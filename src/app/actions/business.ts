"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70); }

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?next=/business");
  return { supabase, user: data.user };
}

export async function createBusiness(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Business name is required.");
  const baseSlug = slugify(name) || `business-${user.id.slice(0, 8)}`;
  const { data: existing } = await supabase.from("businesses").select("slug").like("slug", `${baseSlug}%`);
  const taken = new Set((existing ?? []).map((row) => row.slug));
  let slug = baseSlug; let suffix = 2;
  while (taken.has(slug)) slug = `${baseSlug}-${suffix++}`;
  const { data: business, error } = await supabase.from("businesses").insert({ owner_id: user.id, name, slug, description: String(formData.get("description") ?? "").trim() || null, website: String(formData.get("website") ?? "").trim() || null, phone: String(formData.get("phone") ?? "").trim() || null, email: String(formData.get("email") ?? "").trim() || user.email ?? null, address: String(formData.get("address") ?? "").trim() || null, city: String(formData.get("city") ?? "").trim() || null, state: String(formData.get("state") ?? "").trim() || null, zip: String(formData.get("zip") ?? "").trim() || null, status: "pending", verification_status: "pending" }).select("id").single();
  if (error) throw error;
  await supabase.from("business_profiles").insert({ business_id: business.id });
  await supabase.from("profiles").update({ role: "business_user" }).eq("id", user.id);
  revalidatePath("/business");
  redirect(`/business?business=${business.id}`);
}

export async function submitBusinessClaim(businessId: string, verificationInfo: string) {
  const { supabase, user } = await requireUser();
  const { data: business, error: businessError } = await supabase.from("businesses").select("id, owner_id").eq("id", businessId).maybeSingle();
  if (businessError) throw businessError;
  if (!business) throw new Error("Business not found.");
  if (business.owner_id) throw new Error("This business has already been claimed.");
  const { error } = await supabase.from("business_claims").insert({ business_id: businessId, claimant_id: user.id, verification_info: { note: verificationInfo.trim() } });
  if (error) { if (error.code === "23505") throw new Error("You already have a pending claim for this business."); throw error; }
  await supabase.from("profiles").update({ role: "business_user" }).eq("id", user.id);
  revalidatePath("/business");
  redirect("/business");
}

export async function updateBusinessProfile(businessId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const updates = { name: String(formData.get("name") ?? "").trim(), description: String(formData.get("description") ?? "").trim() || null, website: String(formData.get("website") ?? "").trim() || null, phone: String(formData.get("phone") ?? "").trim() || null, email: String(formData.get("email") ?? "").trim() || null, address: String(formData.get("address") ?? "").trim() || null, city: String(formData.get("city") ?? "").trim() || null, state: String(formData.get("state") ?? "").trim() || null, zip: String(formData.get("zip") ?? "").trim() || null };
  const { error } = await supabase.from("businesses").update(updates).eq("id", businessId);
  if (error) throw error;
  revalidatePath("/business");
  revalidatePath(`/professionals/${businessId}`);
}

export async function updateBusinessTaxonomy(businessId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const serviceIds = formData.getAll("serviceId").map(String).filter(Boolean);
  const cityIds = formData.getAll("cityId").map(String).filter(Boolean);
  const { error: serviceDeleteError } = await supabase.from("business_services").delete().eq("business_id", businessId);
  if (serviceDeleteError) throw serviceDeleteError;
  const { error: areaDeleteError } = await supabase.from("business_service_areas").delete().eq("business_id", businessId);
  if (areaDeleteError) throw areaDeleteError;
  if (serviceIds.length) { const { error } = await supabase.from("business_services").insert(serviceIds.map((service_id) => ({ business_id: businessId, service_id }))); if (error) throw error; }
  if (cityIds.length) { const { error } = await supabase.from("business_service_areas").insert(cityIds.map((city_id) => ({ business_id: businessId, city_id }))); if (error) throw error; }
  revalidatePath("/business");
}
