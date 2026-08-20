import { createClient } from "@/lib/supabase/server";
import type {
  BusinessSubscription,
  BusinessTransaction,
  LeadEntitlement,
  PricingPlan,
} from "@/types/billing";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface PlanRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  billing_interval: PricingPlan["billingInterval"];
  features: unknown;
  max_active_leads: number | null;
  stripe_price_id: string | null;
}

function mapPlan(row: PlanRow): PricingPlan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceCents: row.price_cents,
    billingInterval: row.billing_interval,
    features: Array.isArray(row.features)
      ? row.features.filter((f): f is string => typeof f === "string")
      : [],
    maxActiveLeads: row.max_active_leads,
    stripePriceId: row.stripe_price_id,
  };
}

const PLAN_COLUMNS =
  "id, name, slug, description, price_cents, billing_interval, features, max_active_leads, stripe_price_id";

/** Public plan catalog -- active plans, cheapest/lowest sort_order first. */
export async function listActivePlans(): Promise<PricingPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<PlanRow[]>();
  if (error) throw error;
  return (data ?? []).map(mapPlan);
}

export async function getPlanBySlug(slug: string): Promise<PricingPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<PlanRow>();
  if (error) throw error;
  return data ? mapPlan(data) : null;
}

interface SubscriptionRow {
  id: string;
  business_id: string;
  status: BusinessSubscription["status"];
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  plans: PlanRow | null;
}

/**
 * Current subscription for a business, or null if it has never
 * subscribed. RLS ("Owners view their own subscriptions") independently
 * enforces that the caller may only see this for a business they own (or
 * as an admin) -- this function does not itself check ownership.
 */
export async function getBusinessSubscription(
  businessId: string
): Promise<BusinessSubscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `id, business_id, status, current_period_start, current_period_end, cancel_at_period_end, plans(${PLAN_COLUMNS})`
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRow>();
  if (error) throw error;
  if (!data || !data.plans) return null;
  return {
    id: data.id,
    businessId: data.business_id,
    status: data.status,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    plan: mapPlan(data.plans),
  };
}

interface TransactionRow {
  id: string;
  amount_cents: number;
  currency: string;
  status: BusinessTransaction["status"];
  description: string | null;
  created_at: string;
}

/** Recent transactions for a business. RLS-scoped the same way as above. */
export async function listBusinessTransactions(
  businessId: string,
  limit = 20
): Promise<BusinessTransaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount_cents, currency, status, description, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<TransactionRow[]>();
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
  }));
}

const SUBSCRIBED_STATUSES: BusinessSubscription["status"][] = [
  "active",
  "trialing",
  "past_due",
];

/**
 * Server-trusted lead-visibility entitlement for a business: the plan
 * backing its current subscription if one is active/trialing/past_due, or
 * the Basic (free) plan's limit as a migration-safe default for
 * businesses that have never subscribed. If even the Basic plan can't be
 * found (e.g. an unseeded environment), entitlement is treated as
 * unlimited rather than silently hiding existing Phase 8 data.
 *
 * Takes the caller's Supabase client so callers that already resolved and
 * verified `businessId` (e.g. listBusinessLeads, scoped to the caller's
 * own businesses) reuse the same RLS-respecting session.
 */
export async function getLeadEntitlement(
  supabase: SupabaseServerClient,
  businessId: string
): Promise<LeadEntitlement> {
  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select(`status, plans(name, max_active_leads)`)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{
      status: BusinessSubscription["status"];
      plans: { name: string; max_active_leads: number | null } | null;
    }>();
  if (subError) throw subError;

  if (sub?.plans && SUBSCRIBED_STATUSES.includes(sub.status)) {
    return {
      planName: sub.plans.name,
      maxActiveLeads: sub.plans.max_active_leads,
    };
  }

  const { data: basic, error: basicError } = await supabase
    .from("plans")
    .select("name, max_active_leads")
    .eq("slug", "basic")
    .eq("is_active", true)
    .maybeSingle<{ name: string; max_active_leads: number | null }>();
  if (basicError) throw basicError;

  if (!basic) return { planName: "none", maxActiveLeads: null };
  return { planName: basic.name, maxActiveLeads: basic.max_active_leads };
}
