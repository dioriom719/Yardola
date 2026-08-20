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
