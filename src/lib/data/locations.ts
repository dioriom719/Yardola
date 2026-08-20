import { createClient } from "@/lib/supabase/server";
import type { City } from "@/types";

const CITY_SELECT = "id, name, slug, metros(name, states(abbreviation))";

interface CityRow {
  id: string;
  name: string;
  slug: string;
  metros: { name: string; states: { abbreviation: string } | null } | null;
}

function mapCity(row: CityRow): City {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    metroName: row.metros?.name ?? "",
    stateAbbreviation: row.metros?.states?.abbreviation ?? "",
  };
}

export async function listCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select(CITY_SELECT)
    .order("name", { ascending: true })
    .returns<CityRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapCity);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select(CITY_SELECT)
    .eq("slug", slug)
    .maybeSingle()
    .returns<CityRow>();

  if (error) throw error;
  return data ? mapCity(data) : null;
}

/**
 * Cities with at least one published project in the given category --
 * used for "browse by location" / "related locations" internal links.
 * Existence-based (not threshold-gated): a location worth one contextual
 * link doesn't need to clear the full indexability bar for its own page.
 */
export async function listCitiesWithPublishedProjectsForCategory(
  categoryId: string,
  opts: { excludeCitySlug?: string; limit?: number } = {}
): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`cities(${CITY_SELECT}), project_categories!inner(category_id)`)
    .eq("status", "published")
    .eq("project_categories.category_id", categoryId)
    .returns<{ cities: CityRow | null }[]>();

  if (error) throw error;

  const seen = new Map<string, City>();
  for (const row of data ?? []) {
    if (row.cities && !seen.has(row.cities.id)) {
      seen.set(row.cities.id, mapCity(row.cities));
    }
  }

  let cities = [...seen.values()];
  if (opts.excludeCitySlug) {
    cities = cities.filter((city) => city.slug !== opts.excludeCitySlug);
  }
  cities.sort((a, b) => a.name.localeCompare(b.name));
  return opts.limit ? cities.slice(0, opts.limit) : cities;
}
