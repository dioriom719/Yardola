import { SEO_THRESHOLDS } from "@/lib/seo/config";
import {
  countActiveBusinesses,
  countPublishedProjects,
} from "@/lib/seo/counts";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ProjectDetail } from "@/types/project";
import type { BusinessDetail } from "@/types/business";
import type { GuideDetail } from "@/types/guide";

/**
 * Centralized indexability rules. Every threshold from the SEO spec
 * lives here (backed by src/lib/seo/config.ts) -- no page component
 * should compute or hard-code these numbers itself. Each function
 * returns both the decision and a human-readable reason, useful for
 * debugging why a page did or didn't make the sitemap.
 */

export interface IndexabilityResult {
  index: boolean;
  reason: string;
}

export async function getCategoryIndexability(
  category: Pick<Category, "id">
): Promise<IndexabilityResult> {
  const count = await countPublishedProjects({ categoryId: category.id });
  const min = SEO_THRESHOLDS.category.minPublishedProjects;
  return {
    index: count >= min,
    reason: `${count} published project(s), needs >= ${min}`,
  };
}

export async function getLocationIndexability(
  city: Pick<City, "id">
): Promise<IndexabilityResult> {
  const [projectCount, businessCount] = await Promise.all([
    countPublishedProjects({ cityId: city.id }),
    countActiveBusinesses({ cityId: city.id }),
  ]);
  const { minPublishedProjects, minActiveProfessionals } =
    SEO_THRESHOLDS.location;
  const index =
    projectCount >= minPublishedProjects ||
    businessCount >= minActiveProfessionals;
  return {
    index,
    reason: `${projectCount} project(s) (needs >= ${minPublishedProjects}) or ${businessCount} professional(s) (needs >= ${minActiveProfessionals})`,
  };
}

export async function getCategoryLocationIndexability(
  category: Pick<Category, "id">,
  city: Pick<City, "id">
): Promise<IndexabilityResult> {
  const [projectCount, businessCount] = await Promise.all([
    countPublishedProjects({ categoryId: category.id, cityId: city.id }),
    countActiveBusinesses({ categoryId: category.id, cityId: city.id }),
  ]);
  const {
    minPublishedProjectsAlone,
    minPublishedProjectsWithProfessionals,
    minActiveProfessionalsWithProjects,
  } = SEO_THRESHOLDS.categoryLocation;

  const index =
    projectCount >= minPublishedProjectsAlone ||
    (projectCount >= minPublishedProjectsWithProfessionals &&
      businessCount >= minActiveProfessionalsWithProjects);

  return {
    index,
    reason: `${projectCount} project(s), ${businessCount} professional(s)`,
  };
}

/**
 * Project detail is already loaded via getProjectBySlug, which only
 * ever returns published rows -- so "published" is implicit here. This
 * just verifies there's enough content to be a useful landing page.
 */
export function getProjectIndexability(
  project: ProjectDetail
): IndexabilityResult {
  const hasTitle = Boolean(project.title.trim());
  const hasSlug = Boolean(project.slug.trim());
  const hasImage = project.photos.length > 0;
  const index = hasTitle && hasSlug && hasImage;
  return {
    index,
    reason: index
      ? "has title, slug, and at least one image"
      : "missing title, slug, or a usable image",
  };
}

/**
 * Business detail is already loaded via getBusinessBySlug, which only
 * ever returns active rows -- "active" is implicit here.
 */
export function getBusinessIndexability(
  business: BusinessDetail
): IndexabilityResult {
  const hasName = Boolean(business.name.trim());
  const hasSlug = Boolean(business.slug.trim());
  const hasProfile = Boolean(
    business.profile?.about?.trim() ||
    business.profile?.tagline?.trim() ||
    business.description?.trim()
  );
  const hasServiceOrProject =
    business.services.length > 0 || business.projects.length > 0;
  const index = hasName && hasSlug && hasProfile && hasServiceOrProject;
  return {
    index,
    reason: index
      ? "has name, slug, profile content, and at least one service/project"
      : "missing profile content or a service/project",
  };
}

/**
 * Guide detail is already loaded via getGuideBySlug, which only ever
 * returns published rows -- "published" is implicit here.
 */
export function getGuideIndexability(guide: GuideDetail): IndexabilityResult {
  const hasUsableContent = Boolean(
    guide.content && guide.content.trim().length >= 40
  );
  return {
    index: hasUsableContent,
    reason: hasUsableContent ? "has usable content" : "missing usable content",
  };
}

/** Convenience bundle matching the page-type names used elsewhere. */
export const getIndexability = {
  category: getCategoryIndexability,
  location: getLocationIndexability,
  categoryLocation: getCategoryLocationIndexability,
  project: getProjectIndexability,
  business: getBusinessIndexability,
  guide: getGuideIndexability,
};
