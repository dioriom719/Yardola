import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";

export interface BusinessLead {
  matchId: string;
  leadId: string;
  businessId: string;
  homeownerName: string | null;
  homeownerEmail: string | null;
  homeownerPhone: string | null;
  status: string;
  matchStatus: string;
  matchScore: number;
  createdAt: string;
  plan: {
    id: string;
    title: string | null;
    description: string | null;
    budgetRange: string | null;
    timeline: string | null;
    city: string | null;
    categories: string[];
  };
}

interface LeadMatchRow {
  id: string;
  business_id: string;
  match_score: number | null;
  match_status: string;
  created_at: string;
  leads: {
    id: string;
    status: string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    project_plans: {
      id: string;
      title: string | null;
      description: string | null;
      budget_range: string | null;
      timeline: string | null;
      cities: { name: string } | null;
      project_plan_categories: { categories: { name: string } | null }[];
    } | null;
  } | null;
}

export async function listBusinessLeads(): Promise<BusinessLead[]> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", userId);
  if (businessError) throw businessError;
  const businessIds = (businesses ?? []).map((b) => b.id);
  if (businessIds.length === 0) return [];

  const { data, error } = await supabase
    .from("lead_matches")
    .select(
      `
      id, business_id, match_score, match_status, created_at,
      leads(id, status, contact_name, contact_email, contact_phone, created_at,
        project_plans(id, title, description, budget_range, timeline,
          cities(name), project_plan_categories(categories(name))))
    `
    )
    .in("business_id", businessIds)
    .in("match_status", ["pending", "sent", "viewed", "accepted"])
    .order("created_at", { ascending: false })
    .returns<LeadMatchRow[]>();

  if (error) throw error;

  return (data ?? []).flatMap((row) => {
    const lead = row.leads;
    if (!lead?.project_plans) return [];
    const plan = lead.project_plans;
    return [
      {
        matchId: row.id,
        leadId: lead.id,
        businessId: row.business_id,
        homeownerName: lead.contact_name,
        homeownerEmail: lead.contact_email,
        homeownerPhone: lead.contact_phone,
        status: lead.status,
        matchStatus: row.match_status,
        matchScore: Number(row.match_score ?? 0),
        createdAt: lead.created_at,
        plan: {
          id: plan.id,
          title: plan.title,
          description: plan.description,
          budgetRange: plan.budget_range,
          timeline: plan.timeline,
          city: plan.cities?.name ?? null,
          categories: plan.project_plan_categories
            .map((c) => c.categories?.name)
            .filter((n): n is string => Boolean(n)),
        },
      },
    ];
  });
}
