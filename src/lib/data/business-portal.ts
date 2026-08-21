import { createClient } from "@/lib/supabase/server";
import { getLeadEntitlement } from "@/lib/data/billing";

export interface OwnedBusiness {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  status: string;
  verificationStatus: string;
  serviceCount: number;
  areaCount: number;
  leadCount: number;
  planName: string;
  planSlug: string;
}

export async function listOwnedBusinesses(): Promise<OwnedBusiness[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
      id, name, slug, description, website, phone, email, logo_url,
      city, state, status, verification_status,
      business_services(count),
      business_service_areas(count),
      lead_matches(count)
    `
    )
    .eq("owner_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const businesses = data ?? [];
  // The business's current plan tier -- server-trusted, same source as
  // the active-opportunity cap (getLeadEntitlement), never client state.
  const entitlements = await Promise.all(
    businesses.map((b) => getLeadEntitlement(supabase, b.id))
  );

  return businesses.map((business, i) => ({
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    website: business.website,
    phone: business.phone,
    email: business.email,
    logoUrl: business.logo_url,
    city: business.city,
    state: business.state,
    status: business.status,
    verificationStatus: business.verification_status,
    serviceCount: business.business_services?.[0]?.count ?? 0,
    areaCount: business.business_service_areas?.[0]?.count ?? 0,
    leadCount: business.lead_matches?.[0]?.count ?? 0,
    planName: entitlements[i].planName,
    planSlug: entitlements[i].planSlug,
  }));
}

export interface MyBusinessClaim {
  id: string;
  business_id: string;
  status: string;
  verification_info: unknown;
  created_at: string;
  businesses: { name: string; slug: string } | null;
}

export async function listMyBusinessClaims(): Promise<MyBusinessClaim[]> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("business_claims")
    .select(
      "id, business_id, status, verification_info, created_at, businesses(name, slug)"
    )
    .eq("claimant_id", userData.user.id)
    .order("created_at", { ascending: false })
    .returns<MyBusinessClaim[]>();

  if (error) throw error;
  return data ?? [];
}
