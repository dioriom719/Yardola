import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { env } from "@/lib/env";

/**
 * Stripe webhook endpoint. The database becomes the source of truth for
 * Yardola subscription state only after events processed here -- nothing
 * else writes to `subscriptions`/`transactions`/`business_billing`'s
 * Stripe-derived columns.
 *
 * Security/idempotency:
 *  - Signature is verified against the raw request body before anything
 *    else runs (`stripe.webhooks.constructEvent`).
 *  - Every event id is recorded in `stripe_webhook_events` (unique
 *    constraint) before processing; a replayed delivery of the same event
 *    id short-circuits with no further writes.
 *  - All writes use `upsert` keyed on a Stripe-assigned unique id
 *    (`external_subscription_id`, `external_transaction_id`), so even a
 *    duplicate event that somehow got past the id check can't duplicate a
 *    row -- it can only re-apply the same values.
 *  - Uses the service-role Supabase client because there is no end-user
 *    session on a server-to-server webhook call; RLS has no bearing here.
 */

type SupabaseServiceClient = ReturnType<typeof createServiceRoleClient>;

const YARDOLA_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
] as const;
type YardolaSubscriptionStatus = (typeof YARDOLA_SUBSCRIPTION_STATUSES)[number];
const KNOWN_STATUSES: ReadonlySet<string> = new Set(
  YARDOLA_SUBSCRIPTION_STATUSES
);

/**
 * Stripe's `paused` and `unpaid` statuses (and any future status Stripe
 * adds) have no direct Yardola equivalent -- the subscription_status enum
 * is intentionally kept minimal per the migration -- so they map to
 * `past_due`, the closest "payment isn't current, but not yet terminal"
 * state.
 */
function mapStripeStatus(
  status: Stripe.Subscription.Status
): YardolaSubscriptionStatus {
  return KNOWN_STATUSES.has(status)
    ? (status as YardolaSubscriptionStatus)
    : "past_due";
}

async function resolveBusinessId(
  supabase: SupabaseServiceClient,
  customerId: string,
  metadataBusinessId?: string | null
): Promise<string | null> {
  if (metadataBusinessId) return metadataBusinessId;
  const { data } = await supabase
    .from("business_billing")
    .select("business_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle<{ business_id: string }>();
  return data?.business_id ?? null;
}

async function handleCheckoutSessionCompleted(
  supabase: SupabaseServiceClient,
  session: Stripe.Checkout.Session
) {
  const businessId =
    session.metadata?.business_id ?? session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : (session.customer?.id ?? null);
  if (!businessId || !customerId) return;

  await supabase
    .from("business_billing")
    .upsert(
      { business_id: businessId, stripe_customer_id: customerId },
      { onConflict: "business_id" }
    );
}

async function handleSubscriptionEvent(
  supabase: SupabaseServiceClient,
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const businessId = await resolveBusinessId(
    supabase,
    customerId,
    subscription.metadata?.business_id
  );
  if (!businessId) return;

  await supabase
    .from("business_billing")
    .upsert(
      { business_id: businessId, stripe_customer_id: customerId },
      { onConflict: "business_id" }
    );

  const item = subscription.items.data[0];
  const priceId = item?.price?.id;
  if (!priceId) return;

  const { data: plan } = await supabase
    .from("plans")
    .select("id")
    .eq("stripe_price_id", priceId)
    .maybeSingle<{ id: string }>();
  // No local plan maps to this Stripe price -- nothing we can write
  // (plan_id is NOT NULL), but this shouldn't happen for prices created
  // through our own plan catalog.
  if (!plan) return;

  await supabase.from("subscriptions").upsert(
    {
      business_id: businessId,
      plan_id: plan.id,
      status: mapStripeStatus(subscription.status),
      current_period_start: item
        ? new Date(item.current_period_start * 1000).toISOString()
        : null,
      current_period_end: item
        ? new Date(item.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      external_subscription_id: subscription.id,
    },
    { onConflict: "external_subscription_id" }
  );
}

async function handleInvoiceEvent(
  supabase: SupabaseServiceClient,
  invoice: Stripe.Invoice,
  status: "succeeded" | "failed"
) {
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const externalSubscriptionId =
    typeof subscriptionRef === "string"
      ? subscriptionRef
      : (subscriptionRef?.id ?? null);
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : (invoice.customer?.id ?? null);

  let businessId: string | null = null;
  let localSubscriptionId: string | null = null;

  if (externalSubscriptionId) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, business_id")
      .eq("external_subscription_id", externalSubscriptionId)
      .maybeSingle<{ id: string; business_id: string }>();
    if (data) {
      localSubscriptionId = data.id;
      businessId = data.business_id;
    }
  }
  if (!businessId && customerId) {
    businessId = await resolveBusinessId(supabase, customerId);
  }
  if (!businessId) return;

  await supabase.from("transactions").upsert(
    {
      business_id: businessId,
      subscription_id: localSubscriptionId,
      amount_cents:
        status === "succeeded" ? invoice.amount_paid : invoice.amount_due,
      currency: invoice.currency,
      status,
      external_transaction_id: invoice.id,
      description:
        invoice.description ?? `Invoice ${invoice.number ?? invoice.id}`,
    },
    { onConflict: "external_transaction_id" }
  );
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      env.stripe.webhookSecret
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Idempotency gate: insert-first, ON CONFLICT DO NOTHING. If no row
  // came back, this exact event id was already processed -- skip it
  // rather than re-applying (or worse, re-triggering side effects from)
  // the same webhook delivery.
  const { data: recorded, error: recordError } = await supabase
    .from("stripe_webhook_events")
    .upsert(
      { stripe_event_id: event.id, type: event.type },
      { onConflict: "stripe_event_id", ignoreDuplicates: true }
    )
    .select("id");
  if (recordError) {
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }
  if (!recorded || recorded.length === 0) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        supabase,
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(
        supabase,
        event.data.object as Stripe.Subscription
      );
      break;
    case "invoice.paid":
      await handleInvoiceEvent(
        supabase,
        event.data.object as Stripe.Invoice,
        "succeeded"
      );
      break;
    case "invoice.payment_failed":
      await handleInvoiceEvent(
        supabase,
        event.data.object as Stripe.Invoice,
        "failed"
      );
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
