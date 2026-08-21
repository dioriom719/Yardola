import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";
import type { OpportunityStatus } from "@/lib/data/business-leads";

export interface LeadMatchSummary {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  city: string | null;
  matchScore: number;
  status: OpportunityStatus;
}

export interface LeadSummary {
  id: string;
  status: "new" | "matched" | "contacted" | "accepted" | "rejected" | "closed";
  createdAt: string;
  matchCount: number;
  matches: LeadMatchSummary[];
}

export async function submitProjectPlan(planId: string) {
  const supabase = await createClient();
  await requireUserId(supabase);

  const { data, error } = await supabase.rpc("submit_project_plan", {
    target_plan_id: planId,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.lead_id) throw new Error("Lead submission failed");

  return {
    leadId: row.lead_id as string,
    matchCount: Number(row.match_count ?? 0),
  };
}

export async function getLeadForPlan(
  planId: string
): Promise<LeadSummary | null> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, status, created_at")
    .eq("project_plan_id", planId)
    .eq("homeowner_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (leadError) throw leadError;
  if (!lead) return null;

  interface LeadMatchRow {
    id: string;
    business_id: string;
    match_score: number | null;
    match_status: LeadMatchSummary["status"];
    businesses: { name: string; slug: string; city: string | null } | null;
  }

  const { data: matches, error: matchError } = await supabase
    .from("lead_matches")
    .select(
      "id, business_id, match_score, match_status, businesses(name, slug, city)"
    )
    .eq("lead_id", lead.id)
    .order("match_score", { ascending: false })
    .returns<LeadMatchRow[]>();

  if (matchError) throw matchError;

  const mapped: LeadMatchSummary[] = (matches ?? []).flatMap((match) => {
    const business = match.businesses;
    if (!business) return [];
    return [
      {
        id: match.id,
        businessId: match.business_id,
        businessName: business.name,
        businessSlug: business.slug,
        city: business.city,
        matchScore: Number(match.match_score ?? 0),
        status: match.match_status,
      },
    ];
  });

  return {
    id: lead.id,
    status: lead.status,
    createdAt: lead.created_at,
    matchCount: mapped.length,
    matches: mapped,
  };
}

/**
 * The homeowner facilitates a connection with a business that has
 * expressed interest. Idempotent; ownership and the "must be interested
 * first" rule are enforced by the RPC. This is the only point at which
 * the matched business's opportunity view starts showing the
 * homeowner's contact details -- see get_business_opportunities().
 */
export async function connectWithOpportunity(matchId: string): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase.rpc("connect_opportunity", {
    target_match_id: matchId,
  });
  if (error) throw error;
}

const CONNECTED_OR_LATER: ReadonlySet<OpportunityStatus> = new Set([
  "connected",
  "won",
  "lost",
]);
const INTERESTED_OR_LATER: ReadonlySet<OpportunityStatus> = new Set([
  "interested",
  ...CONNECTED_OR_LATER,
]);

/** A small, reassuring summary of contractor engagement for the homeowner -- never exposes contractor-private information. */
export function summarizeEngagement(matches: LeadMatchSummary[]) {
  return {
    matchedCount: matches.length,
    interestedCount: matches.filter((m) => INTERESTED_OR_LATER.has(m.status))
      .length,
    connectionAvailable: matches.some((m) => m.status === "interested"),
    connectedCount: matches.filter((m) => CONNECTED_OR_LATER.has(m.status))
      .length,
  };
}

export interface PlanEngagement {
  submitted: boolean;
  matchedCount: number;
  connectionAvailable: boolean;
  connectedCount: number;
}

/**
 * Batched version of getLeadForPlan()'s engagement summary for the "My
 * Plans" list, so a homeowner with several plans can see which ones need
 * attention without opening each one. Two queries total regardless of
 * plan count (RLS still scopes both to the caller's own leads).
 */
export async function listPlanEngagement(
  planIds: string[]
): Promise<Map<string, PlanEngagement>> {
  const result = new Map<string, PlanEngagement>();
  if (planIds.length === 0) return result;

  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: leadRows, error: leadError } = await supabase
    .from("leads")
    .select("id, project_plan_id")
    .in("project_plan_id", planIds)
    .eq("homeowner_id", userId)
    .returns<{ id: string; project_plan_id: string }[]>();
  if (leadError) throw leadError;
  if (!leadRows || leadRows.length === 0) return result;

  for (const row of leadRows) {
    result.set(row.project_plan_id, {
      submitted: true,
      matchedCount: 0,
      connectionAvailable: false,
      connectedCount: 0,
    });
  }

  const leadIdToPlanId = new Map(
    leadRows.map((row) => [row.id, row.project_plan_id])
  );
  const { data: matchRows, error: matchError } = await supabase
    .from("lead_matches")
    .select("lead_id, match_status")
    .in(
      "lead_id",
      leadRows.map((row) => row.id)
    )
    .returns<{ lead_id: string; match_status: LeadMatchSummary["status"] }[]>();
  if (matchError) throw matchError;

  for (const match of matchRows ?? []) {
    const planId = leadIdToPlanId.get(match.lead_id);
    const engagement = planId ? result.get(planId) : undefined;
    if (!engagement) continue;
    engagement.matchedCount++;
    if (match.match_status === "interested")
      engagement.connectionAvailable = true;
    if (CONNECTED_OR_LATER.has(match.match_status)) engagement.connectedCount++;
  }

  return result;
}

/** Homeowner-friendly label for a plan's current state -- never a raw DB status. */
export function formatPlanEngagement(
  engagement: PlanEngagement | undefined
): string {
  if (!engagement?.submitted) return "Draft";
  if (engagement.connectedCount > 0) return "Connected";
  if (engagement.connectionAvailable) return "Ready to connect";
  if (engagement.matchedCount > 0) return "Waiting for a professional";
  return "Finding professionals";
}
