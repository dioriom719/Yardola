import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";
import { listPlanPhotos } from "@/lib/data/plan-photos";
import { submitProjectPlan } from "@/lib/data/leads";
import {
  PROJECT_CARD_FIELDS,
  mapProjectCard,
  type ProjectCardRow,
} from "@/lib/data/projects";
import type {
  BudgetRange,
  PlanTaxonomyTag,
  ProjectPlanDetail,
  ProjectPlanStatus,
  ProjectPlanSummary,
  ProjectTimeline,
} from "@/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const PLAN_DETAIL_SELECT = `
  id, title, status, budget_range, timeline, description, created_at, updated_at,
  zip_codes(id, code),
  cities(id, name, slug, metros(states(abbreviation))),
  project_plan_categories(categories(id, name, slug)),
  project_plan_styles(styles(id, name, slug)),
  project_plan_features(features(id, name, slug)),
  project_plan_inspiration(projects(${PROJECT_CARD_FIELDS}))
`;

interface PlanDetailRow {
  id: string;
  title: string | null;
  status: ProjectPlanStatus;
  budget_range: BudgetRange | null;
  timeline: ProjectTimeline | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  zip_codes: { id: string; code: string } | null;
  cities: {
    id: string;
    name: string;
    slug: string;
    metros: { states: { abbreviation: string } | null } | null;
  } | null;
  project_plan_categories: { categories: PlanTaxonomyTag | null }[];
  project_plan_styles: { styles: PlanTaxonomyTag | null }[];
  project_plan_features: { features: PlanTaxonomyTag | null }[];
  project_plan_inspiration: { projects: ProjectCardRow | null }[];
}

async function mapPlanDetail(
  supabase: SupabaseServerClient,
  row: PlanDetailRow
): Promise<ProjectPlanDetail> {
  const photos = await listPlanPhotos(row.id);

  return {
    id: row.id,
    title: row.title,
    status: row.status,
    budgetRange: row.budget_range,
    timeline: row.timeline,
    description: row.description,
    zipCodeId: row.zip_codes?.id ?? null,
    zipCode: row.zip_codes?.code ?? null,
    city: row.cities
      ? {
          id: row.cities.id,
          name: row.cities.name,
          slug: row.cities.slug,
          stateAbbreviation: row.cities.metros?.states?.abbreviation ?? "",
        }
      : null,
    categories: row.project_plan_categories
      .map((r) => r.categories)
      .filter((c): c is PlanTaxonomyTag => c !== null),
    styles: row.project_plan_styles
      .map((r) => r.styles)
      .filter((s): s is PlanTaxonomyTag => s !== null),
    features: row.project_plan_features
      .map((r) => r.features)
      .filter((f): f is PlanTaxonomyTag => f !== null),
    inspiration: row.project_plan_inspiration
      .map((r) => r.projects)
      .filter((p): p is ProjectCardRow => p !== null)
      .map(mapProjectCard),
    photos,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createDraftPlan(): Promise<string> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("project_plans")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Starts a draft plan pre-populated from public project data only (the
 * "Plan a Similar Project" CTA) -- never from another homeowner's
 * private data.
 */
export async function createDraftPlanFromProject(
  categoryId: string | null,
  styleId: string | null
): Promise<string> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("project_plans")
    .insert({ user_id: userId, category_id: categoryId, style_id: styleId })
    .select("id")
    .single();

  if (error) throw error;

  if (categoryId) {
    await supabase
      .from("project_plan_categories")
      .insert({ plan_id: data.id, category_id: categoryId });
  }
  if (styleId) {
    await supabase
      .from("project_plan_styles")
      .insert({ plan_id: data.id, style_id: styleId });
  }

  return data.id;
}

export async function getPlanDetail(
  planId: string
): Promise<ProjectPlanDetail | null> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("project_plans")
    .select(PLAN_DETAIL_SELECT)
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle()
    .returns<PlanDetailRow>();

  if (error) throw error;
  return data ? mapPlanDetail(supabase, data) : null;
}

interface PlanSummaryRow {
  id: string;
  title: string | null;
  status: ProjectPlanStatus;
  budget_range: BudgetRange | null;
  timeline: ProjectTimeline | null;
  created_at: string;
  updated_at: string;
  cities: { name: string } | null;
  project_plan_categories: { categories: PlanTaxonomyTag | null }[];
  project_plan_inspiration: { id: string }[];
  project_plan_photos: { id: string }[];
}

export async function listPlans(
  opts: { includeArchived?: boolean } = {}
): Promise<ProjectPlanSummary[]> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  let query = supabase
    .from("project_plans")
    .select(
      `id, title, status, budget_range, timeline, created_at, updated_at,
       cities(name),
       project_plan_categories(categories(id, name, slug)),
       project_plan_inspiration(id),
       project_plan_photos(id)`
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (!opts.includeArchived) {
    query = query.neq("status", "closed");
  }

  const { data, error } = await query.returns<PlanSummaryRow[]>();
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    budgetRange: row.budget_range,
    timeline: row.timeline,
    cityName: row.cities?.name ?? null,
    categories: row.project_plan_categories
      .map((r) => r.categories)
      .filter((c): c is PlanTaxonomyTag => c !== null),
    inspirationCount: row.project_plan_inspiration.length,
    photoCount: row.project_plan_photos.length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function countPlans(): Promise<number> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { count, error } = await supabase
    .from("project_plans")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "closed");

  if (error) throw error;
  return count ?? 0;
}

// -- Step updates ------------------------------------------------------
//
// Each setter scopes its update/delete to `user_id = caller` in addition
// to RLS -- belt-and-suspenders, and it means an update against a plan
// the caller doesn't own silently affects zero rows instead of relying
// on RLS alone to no-op it.

async function assertOwnPlan(
  supabase: SupabaseServerClient,
  userId: string,
  planId: string
) {
  const { data, error } = await supabase
    .from("project_plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Plan not found");
}

export async function updatePlanTitle(
  planId: string,
  title: string
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ title: title.trim() || null })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updatePlanCategories(
  planId: string,
  categoryIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await assertOwnPlan(supabase, userId, planId);

  const { error: deleteError } = await supabase
    .from("project_plan_categories")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw deleteError;

  if (categoryIds.length > 0) {
    const { error: insertError } = await supabase
      .from("project_plan_categories")
      .insert(
        categoryIds.map((category_id) => ({ plan_id: planId, category_id }))
      );
    if (insertError) throw insertError;
  }

  const { error: updateError } = await supabase
    .from("project_plans")
    .update({ category_id: categoryIds[0] ?? null })
    .eq("id", planId)
    .eq("user_id", userId);
  if (updateError) throw updateError;
}

export async function updatePlanLocation(
  planId: string,
  input: { cityId: string | null; zipCodeId: string | null }
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ city_id: input.cityId, zip_code_id: input.zipCodeId })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updatePlanStyles(
  planId: string,
  styleIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await assertOwnPlan(supabase, userId, planId);

  const { error: deleteError } = await supabase
    .from("project_plan_styles")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw deleteError;

  if (styleIds.length > 0) {
    const { error: insertError } = await supabase
      .from("project_plan_styles")
      .insert(styleIds.map((style_id) => ({ plan_id: planId, style_id })));
    if (insertError) throw insertError;
  }

  const { error: updateError } = await supabase
    .from("project_plans")
    .update({ style_id: styleIds[0] ?? null })
    .eq("id", planId)
    .eq("user_id", userId);
  if (updateError) throw updateError;
}

export async function updatePlanFeatures(
  planId: string,
  featureIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await assertOwnPlan(supabase, userId, planId);

  const { error: deleteError } = await supabase
    .from("project_plan_features")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw deleteError;

  if (featureIds.length > 0) {
    const { error: insertError } = await supabase
      .from("project_plan_features")
      .insert(
        featureIds.map((feature_id) => ({ plan_id: planId, feature_id }))
      );
    if (insertError) throw insertError;
  }
}

export async function updatePlanBudget(
  planId: string,
  budgetRange: BudgetRange | null
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ budget_range: budgetRange })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updatePlanTimeline(
  planId: string,
  timeline: ProjectTimeline | null
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ timeline })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updatePlanDescription(
  planId: string,
  description: string
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ description: description.trim() || null })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setPlanInspiration(
  planId: string,
  projectIds: string[]
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  await assertOwnPlan(supabase, userId, planId);

  const { error: deleteError } = await supabase
    .from("project_plan_inspiration")
    .delete()
    .eq("plan_id", planId);
  if (deleteError) throw deleteError;

  if (projectIds.length > 0) {
    const { error: insertError } = await supabase
      .from("project_plan_inspiration")
      .insert(
        projectIds.map((project_id) => ({ plan_id: planId, project_id }))
      );
    if (insertError) throw insertError;
  }
}

export async function addPlanInspiration(
  planId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plan_inspiration")
    .insert({ plan_id: planId, project_id: projectId });
  if (error && error.code !== "23505") throw error;
}

export async function removePlanInspiration(
  planId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plan_inspiration")
    .delete()
    .eq("plan_id", planId)
    .eq("project_id", projectId);
  if (error) throw error;
}

/** Soft "remove from my active plans" -- reversible, keeps all data. */
export async function archivePlan(planId: string): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ status: "closed" })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function restorePlan(planId: string): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("project_plans")
    .update({ status: "draft" })
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Permanent delete -- photos are removed from storage first. */
export async function deletePlan(planId: string): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: photoRows, error: photosError } = await supabase
    .from("project_plan_photos")
    .select("storage_path")
    .eq("plan_id", planId)
    .returns<{ storage_path: string }[]>();
  if (photosError) throw photosError;

  if (photoRows && photoRows.length > 0) {
    await supabase.storage
      .from("homeowner-uploads")
      .remove(photoRows.map((row) => row.storage_path));
  }

  const { error } = await supabase
    .from("project_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId);
  if (error) throw error;
}

export interface AnonymousPlanInput {
  categoryIds: string[];
  cityId: string;
  zipCodeId: string | null;
  budgetRange: BudgetRange | null;
  timeline: ProjectTimeline | null;
  description: string;
}

/**
 * Creates, fills in, and submits a plan in one call for the homepage's
 * no-login builder -- used once a session exists (either immediately
 * after signup, or after the homeowner confirms their email and returns
 * to resume). Deliberately just a thin composition of the same
 * `createDraftPlan`/`updatePlan*`/`submitProjectPlan` functions the
 * authenticated `/plan` wizard already calls one step at a time -- same
 * auth check (`requireUserId`), same RLS, same matching RPC. No new
 * database access pattern.
 */
export async function createAndSubmitAnonymousPlan(
  input: AnonymousPlanInput
): Promise<{ planId: string; leadId: string; matchCount: number }> {
  const planId = await createDraftPlan();
  await updatePlanCategories(planId, input.categoryIds);
  await updatePlanLocation(planId, {
    cityId: input.cityId,
    zipCodeId: input.zipCodeId,
  });
  if (input.budgetRange) await updatePlanBudget(planId, input.budgetRange);
  if (input.timeline) await updatePlanTimeline(planId, input.timeline);
  if (input.description.trim())
    await updatePlanDescription(planId, input.description);

  const { leadId, matchCount } = await submitProjectPlan(planId);
  return { planId, leadId, matchCount };
}
