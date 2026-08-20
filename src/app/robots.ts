import type { MetadataRoute } from "next";
import {
  SITE_URL,
  DISALLOWED_ROBOTS_PATHS,
  SITEMAP_SECTIONS,
} from "@/lib/seo/config";

// `app/sitemap.ts` uses `generateSitemaps()` to split the sitemap by
// content type, which Next.js serves at `/sitemap/{id}.xml` -- there is
// no auto-generated `/sitemap.xml` index for that pattern, so every
// section is listed explicitly here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...DISALLOWED_ROBOTS_PATHS],
    },
    sitemap: SITEMAP_SECTIONS.map(
      (section) => `${SITE_URL}/sitemap/${section}.xml`
    ),
    host: SITE_URL,
  };
}
