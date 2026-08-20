import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

const CATEGORY_SELECT = "id, name, slug, description, icon";

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<Category[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()
    .returns<Category>();

  if (error) throw error;
  return data;
}

export async function listOtherCategories(
  excludeSlug: string,
  limit = 4
): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .neq("slug", excludeSlug)
    .order("sort_order", { ascending: true })
    .limit(limit)
    .returns<Category[]>();

  if (error) throw error;
  return data ?? [];
}

export interface CategoryWithSample extends Category {
  sampleImageUrl: string | null;
  sampleImageAlt: string | null;
}

interface SampleProjectRow {
  projects: {
    project_photos: {
      url: string;
      alt_text: string | null;
      photo_type: string;
    }[];
  } | null;
}

/**
 * Categories have no image field of their own -- each tile borrows a
 * hero photo from one of its published projects instead. Categories are
 * a small, fixed set, so one small indexed lookup per category (run in
 * parallel) stays cheap.
 */
export async function listCategoriesWithSampleImage(
  categories?: Category[]
): Promise<CategoryWithSample[]> {
  const supabase = await createClient();
  const list = categories ?? (await listCategories());

  return Promise.all(
    list.map(async (category) => {
      const { data, error } = await supabase
        .from("project_categories")
        .select(
          "projects!inner(status, project_photos(url, alt_text, photo_type))"
        )
        .eq("category_id", category.id)
        .eq("projects.status", "published")
        .limit(1)
        .returns<SampleProjectRow[]>();

      if (error) throw error;

      const photos = data?.[0]?.projects?.project_photos ?? [];
      const photo =
        photos.find((p) => p.photo_type === "hero") ?? photos[0] ?? null;

      return {
        ...category,
        sampleImageUrl: photo?.url ?? null,
        sampleImageAlt: photo?.alt_text ?? null,
      };
    })
  );
}
