import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/urls";
import { SITEMAP_SECTIONS, SITE_IS_PUBLICLY_INDEXABLE } from "@/lib/seo/config";
import {
  listQualifyingCategories,
  listQualifyingLocations,
  listQualifyingCategoryLocations,
  listQualifyingProjects,
  listQualifyingBusinesses,
  listQualifyingGuides,
} from "@/lib/seo/sitemap-data";

/**
 * Sitemap is split by content type via `generateSitemaps`, one id per
 * section (`SITEMAP_SECTIONS`, shared with `app/robots.ts`). This keeps
 * each section's query set small and independent, and gives room to
 * grow (e.g. splitting "projects" further by batches of 50,000) without
 * restructuring. Every section here only includes URLs that already
 * passed the centralized indexability checks -- no noindex pages,
 * filtered URLs, or empty combinations ever appear here.
 */
type SitemapId = (typeof SITEMAP_SECTIONS)[number];

export function generateSitemaps() {
  return SITEMAP_SECTIONS.map((id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = (await id) as SitemapId;

  // Placeholder vercel.app host, no real production domain yet (Phase 19).
  // robots.ts already stops advertising these URLs, but the route itself
  // is still directly reachable -- return empty sections rather than real
  // content URLs on a preview host, as a second layer of defense.
  if (!SITE_IS_PUBLICLY_INDEXABLE) {
    return [];
  }

  switch (resolvedId) {
    case "core":
      return [
        { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
        {
          url: absoluteUrl("/projects"),
          changeFrequency: "daily",
          priority: 0.9,
        },
        {
          url: absoluteUrl("/professionals"),
          changeFrequency: "daily",
          priority: 0.8,
        },
        {
          url: absoluteUrl("/guides"),
          changeFrequency: "weekly",
          priority: 0.7,
        },
      ];

    case "categories": {
      const categories = await listQualifyingCategories();
      return categories.map((category) => ({
        url: absoluteUrl(`/projects/${category.slug}`),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }

    case "locations": {
      const locations = await listQualifyingLocations();
      return locations.map((city) => ({
        url: absoluteUrl(`/locations/${city.slug}`),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }

    case "category-locations": {
      const pairs = await listQualifyingCategoryLocations();
      return pairs.map((pair) => ({
        url: absoluteUrl(`/projects/${pair.categorySlug}/${pair.citySlug}`),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }

    case "projects": {
      const projects = await listQualifyingProjects();
      return projects.map((project) => ({
        url: absoluteUrl(`/projects/${project.slug}`),
        lastModified: project.lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      }));
    }

    case "professionals": {
      const businesses = await listQualifyingBusinesses();
      return businesses.map((business) => ({
        url: absoluteUrl(`/professionals/${business.slug}`),
        lastModified: business.lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      }));
    }

    case "guides": {
      const guides = await listQualifyingGuides();
      return guides.map((guide) => ({
        url: absoluteUrl(`/guides/${guide.slug}`),
        lastModified: guide.lastModified ?? undefined,
        changeFrequency: "monthly",
        priority: 0.5,
      }));
    }

    default:
      return [];
  }
}
