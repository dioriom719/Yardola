"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe";
import { env } from "@/lib/env";

/**
 * Resolves the caller and confirms they own `businessId`, querying with an
 * explicit owner_id filter (not just `.eq("id", businessId)`) because
 * `businesses` has a "publicly readable when active" RLS policy -- an id
 * filter alone would happily return someone else's active business.
 */
async function requireOwnedBusiness(businessId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/business/billing/${businessId}`);

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!business) throw new Error("Business not found.");

  return { supabase, user, business };
}

async function getStripeCustomerId(businessId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_billing")
    .select("stripe_customer_id")
    .eq("business_id", businessId)
    .maybeSingle<{ stripe_customer_id: string | null }>();
  if (error) throw error;
  return data?.stripe_customer_id ?? null;
}

export async function startCheckout(businessId: string, formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();
  if (!planId) throw new Error("Choose a plan first.");

  const { user } = await requireOwnedBusiness(businessId);

  const supabase = await createClient();
  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("id, name, stripe_price_id")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle<{
      id: string;
      name: string;
      stripe_price_id: string | null;
    }>();
  if (planError) throw planError;
  if (!plan) throw new Error("Plan not found.");
  if (!plan.stripe_price_id) {
    throw new Error(
      `${plan.name} isn't available for checkout yet. Contact support.`
    );
  }

  const existingCustomerId = await getStripeCustomerId(businessId);
  const stripe = getStripeClient();
  const returnBase = `${env.siteUrl}/business/billing/${businessId}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    ...(existingCustomerId
      ? { customer: existingCustomerId }
      : { customer_email: user.email ?? undefined }),
    client_reference_id: businessId,
    metadata: { business_id: businessId, plan_id: plan.id },
    subscription_data: {
      metadata: { business_id: businessId, plan_id: plan.id },
    },
    success_url: `${returnBase}?checkout=success`,
    cancel_url: `${returnBase}?checkout=cancelled`,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  redirect(session.url);
}

export async function openCustomerPortal(businessId: string) {
  await requireOwnedBusiness(businessId);

  const customerId = await getStripeCustomerId(businessId);
  if (!customerId) {
    throw new Error("Subscribe to a plan before managing billing.");
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.siteUrl}/business/billing/${businessId}`,
  });

  redirect(session.url);
}

async function getExternalSubscriptionId(
  businessId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("external_subscription_id")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ external_subscription_id: string | null }>();
  if (error) throw error;
  return data?.external_subscription_id ?? null;
}

/**
 * Schedules cancellation at period end. Does not write local subscription
 * state directly -- Stripe sends customer.subscription.updated right back
 * to the webhook handler, which remains the single writer of billing
 * state, so the database never disagrees with Stripe about why a
 * subscription's status changed.
 */
export async function cancelSubscription(businessId: string) {
  await requireOwnedBusiness(businessId);
  const externalSubscriptionId = await getExternalSubscriptionId(businessId);
  if (!externalSubscriptionId) throw new Error("No active subscription.");

  const stripe = getStripeClient();
  await stripe.subscriptions.update(externalSubscriptionId, {
    cancel_at_period_end: true,
  });

  revalidatePath(`/business/billing/${businessId}`);
}

export async function resumeSubscription(businessId: string) {
  await requireOwnedBusiness(businessId);
  const externalSubscriptionId = await getExternalSubscriptionId(businessId);
  if (!externalSubscriptionId) throw new Error("No active subscription.");

  const stripe = getStripeClient();
  await stripe.subscriptions.update(externalSubscriptionId, {
    cancel_at_period_end: false,
  });

  revalidatePath(`/business/billing/${businessId}`);
}
