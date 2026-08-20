import { env } from "@/lib/env";

/**
 * Centralized SEO configuration. Every indexability threshold and piece
 * of default metadata lives here -- nowhere else in the app should
 * hard-code a number like "3 projects" or a fallback title/description.
 */

export const SITE_URL = env.siteUrl.replace(/\/+$/, "");
export const SITE_NAME = "Yardola";
export const SITE_TAGLINE = "Your Backyard Starts Here.";
export const DEFAULT_TITLE = `${SITE_NAME} | Backyard Projects & Inspiration in Las Vegas`;
export const DEFAULT_DESCRIPTION =
  "Explore real backyard projects, discover local professionals, and turn your ideas into a plan. Yardola is Las Vegas's visual backyard-project marketplace.";
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} -- backyard project inspiration in Las Vegas`;
export const TWITTER_HANDLE = undefined as string | undefined;

/**
 * Indexability thresholds. Each rule below is deliberately conservative
 * -- a thin/empty page is worse for SEO than a missing one. Tune these
 * here as the catalog grows; nothing else in the app should encode these
 * numbers directly.
 */
export const SEO_THRESHOLDS = {
  category: {
    minPublishedProjects: 3,
  },
  location: {
    minPublishedProjects: 3,
    minActiveProfessionals: 3,
  },
  categoryLocation: {
    // Index when EITHER condition holds.
    minPublishedProjectsAlone: 5,
    minPublishedProjectsWithProfessionals: 3,
    minActiveProfessionalsWithProjects: 2,
  },
} as const;

/**
 * robots.txt Disallow list -- reserved for routes that should never be
 * crawled at all (private application surfaces, API routes). This is
 * deliberately narrow: `/plan` and other not-yet-useful public pages are
 * still crawlable, just marked `noindex` in their own metadata, so
 * search engines can see and honor that directive instead of only
 * seeing "blocked by robots.txt". Kept centralized so robots.ts and any
 * future gating logic agree.
 */
export const DISALLOWED_ROBOTS_PATHS = ["/api/"] as const;

/**
 * Sitemap sections, one per `generateSitemaps()` id in `app/sitemap.ts`.
 * Next.js serves each at `/sitemap/{id}.xml` with no auto-generated
 * index route for this pattern, so `app/robots.ts` lists them
 * individually -- both files import this single list to stay in sync.
 */
export const SITEMAP_SECTIONS = [
  "core",
  "categories",
  "locations",
  "category-locations",
  "projects",
  "professionals",
  "guides",
] as const;
