import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/supabase/auth";
import type { PlanPhoto } from "@/types";

const BUCKET = "homeowner-uploads";
// Signed URLs are resolved fresh on every page render (see listPlanPhotos)
// rather than cached, so a short TTL is fine and keeps stale links from
// lingering if a photo is later removed.
const SIGNED_URL_TTL_SECONDS = 60 * 10;

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class PlanPhotoUploadError extends Error {}

function extensionFor(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Uploads one "current backyard" photo for a plan. The plan-ownership
 * check happens twice: once here (so a bad plan id fails fast with a
 * clear error) and again via RLS on both the storage object path
 * (`{user_id}/...`) and the project_plan_photos insert.
 */
export async function uploadPlanPhoto(
  planId: string,
  file: File
): Promise<PlanPhoto> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new PlanPhotoUploadError("Photos must be JPEG, PNG, or WebP images.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new PlanPhotoUploadError("Photos must be smaller than 8MB.");
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const path = `${userId}/${planId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new PlanPhotoUploadError("Photo upload failed. Please try again.");
  }

  const { data: row, error: insertError } = await supabase
    .from("project_plan_photos")
    .insert({ plan_id: planId, storage_path: path })
    .select("id, storage_path, sort_order")
    .single();

  if (insertError) {
    // Roll back the orphaned storage object if the row insert failed
    // (e.g. the plan doesn't belong to this user, caught by RLS).
    await supabase.storage.from(BUCKET).remove([path]);
    throw insertError;
  }

  const url = await signedUrlFor(supabase, row.storage_path);
  return { id: row.id, url, sortOrder: row.sort_order };
}

export async function listPlanPhotos(planId: string): Promise<PlanPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_plan_photos")
    .select("id, storage_path, sort_order")
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true })
    .returns<{ id: string; storage_path: string; sort_order: number }[]>();

  if (error) throw error;

  const photos = await Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      url: await signedUrlFor(supabase, row.storage_path),
      sortOrder: row.sort_order,
    }))
  );
  return photos;
}

export async function deletePlanPhoto(photoId: string): Promise<void> {
  const supabase = await createClient();
  await requireUserId(supabase);

  const { data: row, error: fetchError } = await supabase
    .from("project_plan_photos")
    .select("storage_path")
    .eq("id", photoId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!row) return;

  const { error: deleteError } = await supabase
    .from("project_plan_photos")
    .delete()
    .eq("id", photoId);

  if (deleteError) throw deleteError;

  await supabase.storage.from(BUCKET).remove([row.storage_path]);
}

async function signedUrlFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) throw error ?? new Error("Failed to sign photo URL");
  return data.signedUrl;
}
