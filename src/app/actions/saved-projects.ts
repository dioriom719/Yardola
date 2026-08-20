"use server";

import { revalidatePath } from "next/cache";
import { saveProject, unsaveProject } from "@/lib/data/saved-projects";

export type SavedProjectActionResult =
  { ok: true } | { ok: false; reason: "unauthenticated" | "error" };

function toResult(err: unknown): SavedProjectActionResult {
  if (err instanceof Error && err.message === "Not authenticated") {
    return { ok: false, reason: "unauthenticated" };
  }
  return { ok: false, reason: "error" };
}

export async function saveProjectAction(
  projectId: string
): Promise<SavedProjectActionResult> {
  try {
    await saveProject(projectId);
    revalidatePath("/account/saved");
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}

export async function unsaveProjectAction(
  projectId: string
): Promise<SavedProjectActionResult> {
  try {
    await unsaveProject(projectId);
    revalidatePath("/account/saved");
    revalidatePath("/account");
    return { ok: true };
  } catch (err) {
    return toResult(err);
  }
}
