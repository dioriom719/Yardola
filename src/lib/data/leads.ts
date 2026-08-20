import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";

export interface LeadMatchSummary {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  city: string | null;
  matchScore: number;
  status: "pending" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
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
