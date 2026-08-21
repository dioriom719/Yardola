import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";
import { getLeadEntitlement } from "@/lib/data/billing";

/**
 * The v1 opportunity lifecycle (see docs/OPPORTUNITY-MARKETPLACE.md):
 *   pending/sent -> viewed -> interested -> connected -> won/lost
 * `accepted`/`rejected`/`expired` are legacy match_status values from
 * Phase 8 that no app code has ever written -- kept here only so the
 * type stays a complete mirror of the database enum.
 */
export type OpportunityStatus =
  | "pending"
  | "sent"
  | "viewed"
  | "interested"
  | "connected"
  | "won"
  | "lost"
  | "accepted"
  | "rejected"
  | "expired";

/** Statuses that haven't reached a terminal outcome yet -- these are what count against a plan's opportunity cap. */
const ACTIVE_STATUSES: readonly OpportunityStatus[] = [
  "pending",
  "sent",
  "viewed",
  "interested",
  "connected",
];

export interface BusinessOpportunity {
  matchId: string;
  leadId: string;
  businessId: string;
  matchScore: number;
  matchStatus: OpportunityStatus;
  matchedAt: string;
  viewedAt: string | null;
  interestedAt: string | null;
  connectedAt: string | null;
  resolvedAt: string | null;
  /** Homeowner contact fields are null until matchStatus reaches connected/won/lost -- see get_business_opportunities(). */
  homeownerName: string | null;
  homeownerEmail: string | null;
  homeownerPhone: string | null;
  plan: {
    title: string | null;
    description: string | null;
    budgetRange: string | null;
    timeline: string | null;
    city: string | null;
    categories: string[];
  };
}

interface OpportunityRpcRow {
  match_id: string;
  lead_id: string;
  business_id: string;
  match_score: number | null;
  match_status: OpportunityStatus;
  matched_at: string;
  viewed_at: string | null;
  interested_at: string | null;
  connected_at: string | null;
  resolved_at: string | null;
  plan_title: string | null;
  plan_description: string | null;
  budget_range: string | null;
  timeline: string | null;
  city_name: string | null;
  category_names: string[] | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

function mapRow(
  row: OpportunityRpcRow,
  viewedNow: boolean
): BusinessOpportunity {
  return {
    matchId: row.match_id,
    leadId: row.lead_id,
    businessId: row.business_id,
    matchScore: Number(row.match_score ?? 0),
    matchStatus: viewedNow ? "viewed" : row.match_status,
    matchedAt: row.matched_at,
    viewedAt: row.viewed_at ?? (viewedNow ? new Date().toISOString() : null),
    interestedAt: row.interested_at,
    connectedAt: row.connected_at,
    resolvedAt: row.resolved_at,
    homeownerName: row.contact_name,
    homeownerEmail: row.contact_email,
    homeownerPhone: row.contact_phone,
    plan: {
      title: row.plan_title,
      description: row.plan_description,
      budgetRange: row.budget_range,
      timeline: row.timeline,
      city: row.city_name,
      categories: row.category_names ?? [],
    },
  };
}

/**
 * Every opportunity matched to a business the caller owns, newest first.
 * Loading this list is the "contractor opens the opportunity" moment in
 * this app (there's no separate detail route yet), so any still-unopened
 * opportunity is marked viewed as part of loading it -- best-effort; a
 * failure here doesn't break the page.
 */
export async function listBusinessOpportunities(): Promise<
  BusinessOpportunity[]
> {
  const supabase = await createClient();
  await requireUserId(supabase);

  const { data, error } = await supabase.rpc("get_business_opportunities");
  if (error) throw error;
  const rows = (data ?? []) as OpportunityRpcRow[];

  const unopenedIds = rows
    .filter((r) => r.match_status === "pending" || r.match_status === "sent")
    .map((r) => r.match_id);
  if (unopenedIds.length > 0) {
    await Promise.all(
      unopenedIds.map((id) =>
        supabase.rpc("mark_opportunity_viewed", { target_match_id: id })
      )
    );
  }
  const unopened = new Set(unopenedIds);

  const opportunities = rows.map((row) =>
    mapRow(row, unopened.has(row.match_id))
  );

  // Entitlement enforcement (Phase 9, extended in Phase 13): cap how many
  // *active* opportunities are returned per business according to its
  // plan, without touching the underlying lead_matches rows -- an
  // upgrade immediately surfaces the rest. Resolved (won/lost)
  // opportunities are always shown; they're history, not a fresh
  // opportunity competing for a limited cap. A business with no
  // subscription falls back to the Basic plan's limit (see
  // getLeadEntitlement), and a null limit means unlimited for that plan
  // tier today -- see docs/OPPORTUNITY-MARKETPLACE.md for why that's a
  // deliberate, temporary, fully reversible default rather than an
  // invented permanent capacity rule.
  const businessIds = [...new Set(opportunities.map((o) => o.businessId))];
  const entitlementByBusiness = new Map(
    await Promise.all(
      businessIds.map(
        async (id) => [id, await getLeadEntitlement(supabase, id)] as const
      )
    )
  );
  const seenActivePerBusiness = new Map<string, number>();
  return opportunities.filter((opp) => {
    if (!ACTIVE_STATUSES.includes(opp.matchStatus)) return true;
    const cap = entitlementByBusiness.get(opp.businessId)?.maxActiveLeads;
    if (cap == null) return true;
    const seen = seenActivePerBusiness.get(opp.businessId) ?? 0;
    if (seen >= cap) return false;
    seenActivePerBusiness.set(opp.businessId, seen + 1);
    return true;
  });
}

/** The matched business chooses to pursue this opportunity. Idempotent; ownership/state are enforced by the RPC. */
export async function expressInterestInOpportunity(
  matchId: string
): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase.rpc("express_interest", {
    target_match_id: matchId,
  });
  if (error) throw error;
}

/** The owning business reports it won a connected opportunity. Idempotent, one-way. */
export async function markOpportunityWon(matchId: string): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase.rpc("mark_opportunity_won", {
    target_match_id: matchId,
  });
  if (error) throw error;
}

/** The owning business reports it lost a connected opportunity. Idempotent, one-way. */
export async function markOpportunityLost(matchId: string): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase.rpc("mark_opportunity_lost", {
    target_match_id: matchId,
  });
  if (error) throw error;
}
