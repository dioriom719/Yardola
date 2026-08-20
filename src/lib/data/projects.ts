import { createClient } from "@/lib/supabase/server";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCityBySlug } from "@/lib/data/locations";
import { getStyleBySlug } from "@/lib/data/styles";
import {
  toPaginatedResult,
  sanitizeSearchTerm,
  type PaginatedResult,
} from "@/lib/data/pagination";
import type { BudgetRange } from "@/types/enums";
import type {
  ProjectCardData,
  ProjectDetail,
  ProjectPhoto,
} from "@/types/project";

export const PROJECTS_PAGE_SIZE = 12;

export interface ProjectFilters {
  categorySlug?: string;
  citySlug?: string;
  styleSlug?: string;
  budgetRange?: BudgetRange;
  query?: string;
}

export const PROJECT_CARD_FIELDS = `id, slug, title, budget_range,
       cities(name, slug),
       project_categories(categories(name, slug)),
       project_styles(styles(name)),
       project_photos(url, alt_text),
       businesses(name, slug)`;

export interface ProjectCardRow {
  id: string;
  slug: string;
  title: string;
  budget_range: BudgetRange | null;
  cities: { name: string; slug: string } | null;
  project_categories: { categories: { name: string; slug: string } | null }[];
  project_styles: { styles: { name: string } | null }[];
  project_photos: { url: string; alt_text: string | null }[];
  businesses: { name: string; slug: string } | null;
}

export function mapProjectCard(row: ProjectCardRow): ProjectCardData {
  const category = row.project_categories[0]?.categories ?? null;
  const style = row.project_styles[0]?.styles ?? null;
  const photo = row.project_photos[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    heroImageUrl: photo?.url ?? null,
    heroImageAlt: photo?.alt_text ?? null,
    cityName: row.cities?.name ?? "",
    citySlug: row.cities?.slug ?? "",
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    styleName: style?.name ?? null,
    budgetRange: row.budget_range,
    businessName: row.businesses?.name ?? "",
    businessSlug: row.businesses?.slug ?? "",
  };
}

/**
 * Finds published project ids matching a free-text search term across
 * project title/description and the owning business's name. PostgREST
 * can't express an OR condition across a parent and joined-table column
 * in a single filter, so this runs two small id-only queries and unions
 * the results -- cheap at this data scale, and still a single extra round
 * trip regardless of how many terms match.
 */
async function findProjectIdsMatchingSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  term: string
): Promise<string[]> {
  const pattern = `%${term}%`;

  const [byText, byBusiness] = await Promise.all([
    supabase
      .from("projects")
      .select("id")
      .eq("status", "published")
      .or(`title.ilike.${pattern},description.ilike.${pattern}`),
    supabase
      .from("projects")
      .select("id, businesses!inner(name)")
      .eq("status", "published")
      .ilike("businesses.name", pattern),
  ]);

  if (byText.error) throw byText.error;
  if (byBusiness.error) throw byBusiness.error;

  const ids = new Set<string>();
  for (const row of byText.data ?? []) ids.add(row.id);
  for (const row of byBusiness.data ?? []) ids.add(row.id);
  return [...ids];
}

export async function listProjects(
  filters: ProjectFilters = {},
  page = 1,
  pageSize = PROJECTS_PAGE_SIZE
): Promise<PaginatedResult<ProjectCardData>> {
  const supabase = await createClient();

  const [category, city, style] = await Promise.all([
    filters.categorySlug ? getCategoryBySlug(filters.categorySlug) : null,
    filters.citySlug ? getCityBySlug(filters.citySlug) : null,
    filters.styleSlug ? getStyleBySlug(filters.styleSlug) : null,
  ]);

  // A slug filter that doesn't resolve to a real row can never match.
  if (
    (filters.categorySlug && !category) ||
    (filters.citySlug && !city) ||
    (filters.styleSlug && !style)
  ) {
    return toPaginatedResult([], 0, page, pageSize);
  }

  let matchingIds: string[] | null = null;
  const term = filters.query ? sanitizeSearchTerm(filters.query) : "";
  if (term) {
    matchingIds = await findProjectIdsMatchingSearch(supabase, term);
    if (matchingIds.length === 0) {
      return toPaginatedResult([], 0, page, pageSize);
    }
  }

  const categoriesEmbed = category
    ? "project_categories!inner(categories(name, slug))"
    : "project_categories(categories(name, slug))";
  const stylesEmbed = style
    ? "project_styles!inner(styles(name))"
    : "project_styles(styles(name))";

  let queryBuilder = supabase
    .from("projects")
    .select(
      `id, slug, title, budget_range,
       cities(name, slug),
       ${categoriesEmbed},
       ${stylesEmbed},
       project_photos(url, alt_text),
       businesses(name, slug)`,
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("project_photos.photo_type", "hero")
    .limit(1, { foreignTable: "project_photos" });

  if (!category) {
    queryBuilder = queryBuilder.limit(1, {
      foreignTable: "project_categories",
    });
  }
  if (!style) {
    queryBuilder = queryBuilder.limit(1, { foreignTable: "project_styles" });
  }
  if (category) {
    queryBuilder = queryBuilder.eq(
      "project_categories.category_id",
      category.id
    );
  }
  if (style) {
    queryBuilder = queryBuilder.eq("project_styles.style_id", style.id);
  }
  if (city) {
    queryBuilder = queryBuilder.eq("city_id", city.id);
  }
  if (filters.budgetRange) {
    queryBuilder = queryBuilder.eq("budget_range", filters.budgetRange);
  }
  if (matchingIds) {
    queryBuilder = queryBuilder.in("id", matchingIds);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await queryBuilder
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<ProjectCardRow[]>();

  if (error) throw error;

  return toPaginatedResult(
    (data ?? []).map(mapProjectCard),
    count ?? 0,
    page,
    pageSize
  );
}

export async function listFeaturedProjects(
  limit = 6
): Promise<ProjectCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_CARD_FIELDS)
    .eq("status", "published")
    .eq("is_featured", true)
    .eq("project_photos.photo_type", "hero")
    .limit(1, { foreignTable: "project_photos" })
    .limit(1, { foreignTable: "project_categories" })
    .limit(1, { foreignTable: "project_styles" })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ProjectCardRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapProjectCard);
}

interface ProjectDetailRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  project_year: number | null;
  budget_range: BudgetRange | null;
  property_type: ProjectDetail["propertyType"];
  is_featured: boolean;
  cities: { name: string; slug: string } | null;
  neighborhoods: { name: string } | null;
  project_photos: {
    id: string;
    url: string;
    alt_text: string | null;
    caption: string | null;
    photo_type: ProjectPhoto["photoType"];
    sort_order: number;
  }[];
  project_categories: { categories: { name: string; slug: string } | null }[];
  project_styles: { styles: { name: string; slug: string } | null }[];
  project_features: { features: { name: string; slug: string } | null }[];
  businesses: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    verification_status: string;
    city: string | null;
    state: string | null;
  } | null;
}

const PROJECT_DETAIL_SELECT = `
  id, slug, title, description, project_year, budget_range, property_type, is_featured,
  cities(name, slug),
  neighborhoods(name),
  project_photos(id, url, alt_text, caption, photo_type, sort_order),
  project_categories(categories(name, slug)),
  project_styles(styles(name, slug)),
  project_features(features(name, slug)),
  businesses(id, slug, name, logo_url, verification_status, city, state)
`;

function mapProjectDetail(row: ProjectDetailRow): ProjectDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    cityName: row.cities?.name ?? "",
    citySlug: row.cities?.slug ?? "",
    neighborhoodName: row.neighborhoods?.name ?? null,
    projectYear: row.project_year,
    budgetRange: row.budget_range,
    propertyType: row.property_type,
    isFeatured: row.is_featured,
    photos: [...row.project_photos]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => ({
        id: photo.id,
        url: photo.url,
        altText: photo.alt_text,
        caption: photo.caption,
        photoType: photo.photo_type,
        sortOrder: photo.sort_order,
      })),
    categories: row.project_categories
      .map((pc) => pc.categories)
      .filter((c): c is { name: string; slug: string } => c !== null),
    styles: row.project_styles
      .map((ps) => ps.styles)
      .filter((s): s is { name: string; slug: string } => s !== null),
    features: row.project_features
      .map((pf) => pf.features)
      .filter((f): f is { name: string; slug: string } => f !== null),
    business: {
      id: row.businesses?.id ?? "",
      slug: row.businesses?.slug ?? "",
      name: row.businesses?.name ?? "",
      logoUrl: row.businesses?.logo_url ?? null,
      verificationStatus: row.businesses?.verification_status ?? "unverified",
      city: row.businesses?.city ?? null,
      state: row.businesses?.state ?? null,
    },
  };
}

export async function getProjectBySlug(
  slug: string
): Promise<ProjectDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
    .returns<ProjectDetailRow>();

  if (error) throw error;
  return data ? mapProjectDetail(data) : null;
}

/**
 * Similar projects, using category/location as the relevance signal (no
 * ML recommendations). Prefers same-category matches, then fills any
 * remaining slots with same-city matches.
 */
export async function listSimilarProjects(
  project: ProjectDetail,
  limit = 4
): Promise<ProjectCardData[]> {
  const supabase = await createClient();
  const cardSelect = PROJECT_CARD_FIELDS;

  const results: ProjectCardRow[] = [];
  const seenIds = new Set([project.id]);

  const categorySlug = project.categories[0]?.slug;
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (category) {
      const { data, error } = await supabase
        .from("projects")
        .select(cardSelect)
        .eq("status", "published")
        .neq("id", project.id)
        .eq("project_categories.category_id", category.id)
        .eq("project_photos.photo_type", "hero")
        .limit(1, { foreignTable: "project_photos" })
        .limit(1, { foreignTable: "project_categories" })
        .limit(1, { foreignTable: "project_styles" })
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<ProjectCardRow[]>();
      if (error) throw error;
      for (const row of data ?? []) {
        if (!seenIds.has(row.id)) {
          results.push(row);
          seenIds.add(row.id);
        }
      }
    }
  }

  if (results.length < limit) {
    const remaining = limit - results.length;
    const { data, error } = await supabase
      .from("projects")
      .select(cardSelect)
      .eq("status", "published")
      .eq("city_id", (await getCityBySlug(project.citySlug))?.id ?? "")
      .not("id", "in", `(${[...seenIds].join(",")})`)
      .eq("project_photos.photo_type", "hero")
      .limit(1, { foreignTable: "project_photos" })
      .limit(1, { foreignTable: "project_categories" })
      .limit(1, { foreignTable: "project_styles" })
      .order("created_at", { ascending: false })
      .limit(remaining)
      .returns<ProjectCardRow[]>();
    if (error) throw error;
    for (const row of data ?? []) {
      if (!seenIds.has(row.id)) {
        results.push(row);
        seenIds.add(row.id);
      }
    }
  }

  return results.slice(0, limit).map(mapProjectCard);
}
