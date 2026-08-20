import { createClient } from "@/lib/supabase/server";
import { listCategories } from "@/lib/data/categories";
import { listCities } from "@/lib/data/locations";
import { listGuides } from "@/lib/data/guides";
import {
  getCategoryIndexability,
  getLocationIndexability,
  getCategoryLocationIndexability,
} from "@/lib/seo/indexability";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";

/**
 * Lightweight, sitemap-specific listing queries. These intentionally
 * select far fewer columns than the page-rendering data functions (no
 * categories/styles/business joins) -- the sitemap only needs a slug and
 * just enough signal to answer "is this indexable", not the full detail
 * needed to render the page.
 */

export interface IndexableEntry {
  slug: string;
  index: boolean;
}

export async function listQualifyingCategories(): Promise<Category[]> {
  const categories = await listCategories();
  const results = await Promise.all(
    categories.map(async (category) => ({
      category,
      ...(await getCategoryIndexability(category)),
    }))
  );
  return results.filter((r) => r.index).map((r) => r.category);
}

export async function listQualifyingLocations(): Promise<City[]> {
  const cities = await listCities();
  const results = await Promise.all(
    cities.map(async (city) => ({
      city,
      ...(await getLocationIndexability(city)),
    }))
  );
  return results.filter((r) => r.index).map((r) => r.city);
}

export interface QualifyingCategoryLocation {
  categorySlug: string;
  citySlug: string;
}

/**
 * Every category x city pair that clears the combined threshold. At
 * current catalog size (8 categories x a handful of cities) this is a
 * bounded number of cheap indexed count queries; if the location taxonomy
 * grows substantially, this is the place to replace the per-pair checks
 * with a single aggregated query (e.g. a Postgres view/RPC).
 */
export async function listQualifyingCategoryLocations(): Promise<
  QualifyingCategoryLocation[]
> {
  const [categories, cities] = await Promise.all([
    listCategories(),
    listCities(),
  ]);

  const pairs = categories.flatMap((category) =>
    cities.map((city) => ({ category, city }))
  );
  const results = await Promise.all(
    pairs.map(async ({ category, city }) => ({
      categorySlug: category.slug,
      citySlug: city.slug,
      ...(await getCategoryLocationIndexability(category, city)),
    }))
  );

  return results
    .filter((r) => r.index)
    .map((r) => ({ categorySlug: r.categorySlug, citySlug: r.citySlug }));
}

interface SitemapProjectRow {
  slug: string;
  title: string;
  updated_at: string;
  project_photos: { id: string }[];
}

export async function listQualifyingProjects(): Promise<
  (IndexableEntry & { lastModified: string })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, title, updated_at, project_photos(id)")
    .eq("status", "published")
    .returns<SitemapProjectRow[]>();

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      slug: row.slug,
      index: Boolean(row.title.trim()) && row.project_photos.length > 0,
      lastModified: row.updated_at,
    }))
    .filter((row) => row.index);
}

interface SitemapBusinessRow {
  slug: string;
  name: string;
  updated_at: string;
  business_profiles: { about: string | null; tagline: string | null } | null;
  business_services: { id: string }[];
  projects: { id: string }[];
}

export async function listQualifyingBusinesses(): Promise<
  (IndexableEntry & { lastModified: string })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "slug, name, updated_at, business_profiles(about, tagline), business_services(id), projects(id)"
    )
    .eq("status", "active")
    .eq("projects.status", "published")
    .returns<SitemapBusinessRow[]>();

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      slug: row.slug,
      index:
        Boolean(row.name.trim()) &&
        Boolean(
          row.business_profiles?.about?.trim() ||
          row.business_profiles?.tagline?.trim()
        ) &&
        (row.business_services.length > 0 || row.projects.length > 0),
      lastModified: row.updated_at,
    }))
    .filter((row) => row.index);
}

export async function listQualifyingGuides(): Promise<
  (IndexableEntry & { lastModified: string | null })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guides")
    .select("slug, content, updated_at")
    .eq("status", "published")
    .returns<{ slug: string; content: string | null; updated_at: string }[]>();

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      slug: row.slug,
      index: Boolean(row.content && row.content.trim().length >= 40),
      lastModified: row.updated_at,
    }))
    .filter((row) => row.index);
}

// listGuides is re-exported for callers that just need the summary shape.
export { listGuides };
