"use server";

import { revalidatePath } from "next/cache";
import * as plans from "@/lib/data/plans";
import { submitProjectPlan } from "@/lib/data/leads";
import {
  uploadPlanPhoto,
  deletePlanPhoto,
  PlanPhotoUploadError,
} from "@/lib/data/plan-photos";
import type { BudgetRange, ProjectTimeline } from "@/types";

export type PlanActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<PlanActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Unable to save. Please try again." };
  }
}

function revalidatePlan(planId: string) {
  revalidatePath("/account/plans");
  revalidatePath(`/account/plans/${planId}`);
}

export async function createDraftPlanAction(): Promise<PlanActionResult<string>> {
  return run(() => plans.createDraftPlan());
}

export async function updatePlanTitleAction(planId: string, title: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanTitle(planId, title); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanCategoriesAction(planId: string, categoryIds: string[]): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanCategories(planId, categoryIds); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanLocationAction(planId: string, input: { cityId: string | null; zipCodeId: string | null }): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanLocation(planId, input); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanStylesAction(planId: string, styleIds: string[]): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanStyles(planId, styleIds); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanFeaturesAction(planId: string, featureIds: string[]): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanFeatures(planId, featureIds); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanBudgetAction(planId: string, budgetRange: BudgetRange | null): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanBudget(planId, budgetRange); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanTimelineAction(planId: string, timeline: ProjectTimeline | null): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanTimeline(planId, timeline); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function updatePlanDescriptionAction(planId: string, description: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.updatePlanDescription(planId, description); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function setPlanInspirationAction(planId: string, projectIds: string[]): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.setPlanInspiration(planId, projectIds); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function removePlanInspirationAction(planId: string, projectId: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.removePlanInspiration(planId, projectId); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function uploadPlanPhotoAction(planId: string, formData: FormData): Promise<PlanActionResult<{ id: string; url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo to upload." };
  try {
    const photo = await uploadPlanPhoto(planId, file);
    revalidatePlan(planId);
    return { ok: true, data: { id: photo.id, url: photo.url } };
  } catch (err) {
    if (err instanceof PlanPhotoUploadError) return { ok: false, error: err.message };
    return { ok: false, error: "Photo upload failed. Please try again." };
  }
}

export async function deletePlanPhotoAction(planId: string, photoId: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await deletePlanPhoto(photoId); return undefined; });
  revalidatePlan(planId);
  return result;
}

export async function archivePlanAction(planId: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.archivePlan(planId); return undefined; });
  revalidatePath("/account/plans");
  return result;
}

export async function restorePlanAction(planId: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.restorePlan(planId); return undefined; });
  revalidatePath("/account/plans");
  return result;
}

export async function deletePlanAction(planId: string): Promise<PlanActionResult<undefined>> {
  const result = await run(async () => { await plans.deletePlan(planId); return undefined; });
  revalidatePath("/account/plans");
  return result;
}

export async function submitPlanAction(planId: string): Promise<PlanActionResult<{ leadId: string; matchCount: number }>> {
  const result = await run(() => submitProjectPlan(planId));
  if (result.ok) revalidatePlan(planId);
  return result;
}

/** Starts a new draft plan pre-loaded with inspiration (from the Saved Projects picker). */
export async function createPlanFromInspirationAction(projectIds: string[]): Promise<PlanActionResult<string>> {
  return run(async () => {
    const planId = await plans.createDraftPlan();
    await plans.setPlanInspiration(planId, projectIds);
    return planId;
  });
}
