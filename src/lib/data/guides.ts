import { createClient } from "@/lib/supabase/server";
import type { GuideDetail, GuideSummary } from "@/types/guide";

interface GuideRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  categories: { name: string } | null;
}

function mapGuideSummary(row: GuideRow): GuideSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    featuredImageUrl: row.featured_image_url,
    categoryName: row.categories?.name ?? null,
    publishedAt: row.published_at,
  };
}

const GUIDE_SUMMARY_SELECT =
  "id, slug, title, excerpt, featured_image_url, published_at, categories(name)";

export async function listGuides(limit?: number): Promise<GuideSummary[]> {
  const supabase = await createClient();
  let queryBuilder = supabase
    .from("guides")
    .select(GUIDE_SUMMARY_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) queryBuilder = queryBuilder.limit(limit);

  const { data, error } = await queryBuilder.returns<GuideRow[]>();
  if (error) throw error;
  return (data ?? []).map(mapGuideSummary);
}

export async function getGuideBySlug(
  slug: string
): Promise<GuideDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select(`${GUIDE_SUMMARY_SELECT}, content`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
    .returns<GuideRow & { content: string | null }>();

  if (error) throw error;
  return data ? { ...mapGuideSummary(data), content: data.content } : null;
}

export async function listRelatedGuides(
  excludeSlug: string,
  limit = 3
): Promise<GuideSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select(GUIDE_SUMMARY_SELECT)
    .eq("status", "published")
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<GuideRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapGuideSummary);
}
