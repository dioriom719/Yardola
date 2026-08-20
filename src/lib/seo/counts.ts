import { createClient } from "@/lib/supabase/server";

/**
 * Low-level, count-only queries backing indexability decisions. These
 * never download full rows -- either `head: true` (count via the
 * response header, no body) or, where PostgREST's join semantics would
 * otherwise overcount, a single narrow id column that's deduplicated in
 * memory (see countActiveBusinesses).
 */

export async function countPublishedProjects(filter: {
  categoryId?: string;
  cityId?: string;
}): Promise<number> {
  const supabase = await createClient();
  // project_categories has a unique(project_id, category_id) constraint,
  // so filtering to one category_id can match at most one row per
  // project -- no risk of the join inflating the count.
  const categoriesEmbed = filter.categoryId
    ? ", project_categories!inner(category_id)"
    : "";

  let query = supabase
    .from("projects")
    .select(`id${categoriesEmbed}`, { count: "exact", head: true })
    .eq("status", "published");

  if (filter.categoryId) {
    query = query.eq("project_categories.category_id", filter.categoryId);
  }
  if (filter.cityId) {
    query = query.eq("city_id", filter.cityId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

/**
 * A business can offer multiple services within the same category, and
 * serve multiple cities, so a plain `!inner` join count over
 * business_services / business_service_areas can return more rows than
 * there are distinct matching businesses. To get an accurate distinct
 * count without a database function, this fetches only the matching
 * `business_id` values (a few dozen UUIDs at current scale, never full
 * rows) and dedupes in memory.
 */
export async function countActiveBusinesses(filter: {
  categoryId?: string;
  cityId?: string;
}): Promise<number> {
  const supabase = await createClient();

  const servicesEmbed = filter.categoryId
    ? ", business_services!inner(services!inner(category_id))"
    : "";
  const areasEmbed = filter.cityId
    ? ", business_service_areas!inner(city_id)"
    : "";

  let query = supabase
    .from("businesses")
    .select(`id${servicesEmbed}${areasEmbed}`)
    .eq("status", "active");

  if (filter.categoryId) {
    query = query.eq(
      "business_services.services.category_id",
      filter.categoryId
    );
  }
  if (filter.cityId) {
    query = query.eq("business_service_areas.city_id", filter.cityId);
  }

  const { data, error } = await query.returns<{ id: string }[]>();
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.id)).size;
}
