import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { absoluteUrl } from "@/lib/seo/urls";
import type { BreadcrumbEntry } from "@/components/yardola/page-breadcrumbs";
import type { ProjectDetail } from "@/types/project";
import type { BusinessDetail } from "@/types/business";
import type { GuideDetail } from "@/types/guide";

/**
 * JSON-LD builders. Each one only asserts what the database actually
 * contains -- no invented ratings, reviews, prices, or awards. Keep
 * these as the single source of truth for structured data shapes so a
 * page never hand-rolls its own JSON-LD.
 */

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      // The current page's breadcrumb item may omit href -- schema.org
      // still wants an item URL, so fall back to the page itself.
      item: item.href ? absoluteUrl(item.href) : undefined,
    })),
  };
}

/**
 * A completed backyard project. schema.org has no dedicated "project"
 * type -- CreativeWork is the closest honest fit for a documented piece
 * of work with a title, images, an author (the business), and a
 * location, without implying it's a product for sale or an article.
 */
export function buildProjectJsonLd(project: ProjectDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description ?? undefined,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.photos.map((photo) => photo.url),
    locationCreated: {
      "@type": "Place",
      name: project.neighborhoodName
        ? `${project.neighborhoodName}, ${project.cityName}`
        : project.cityName,
    },
    author: project.business.name
      ? {
          "@type": "Organization",
          name: project.business.name,
          url: absoluteUrl(`/professionals/${project.business.slug}`),
        }
      : undefined,
    about:
      project.categories.map((category) => category.name).join(", ") ||
      undefined,
  };
}

/**
 * LocalBusiness JSON-LD. Only fields the database actually holds are
 * included -- no invented ratings, reviews, or price range.
 */
export function buildBusinessJsonLd(business: BusinessDetail) {
  const address =
    business.city || business.state
      ? {
          "@type": "PostalAddress",
          addressLocality: business.city ?? undefined,
          addressRegion: business.state ?? undefined,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: absoluteUrl(`/professionals/${business.slug}`),
    image: business.logoUrl ?? undefined,
    description: business.profile?.about ?? business.description ?? undefined,
    telephone: business.phone ?? undefined,
    sameAs: business.website ?? undefined,
    address,
    areaServed: business.serviceAreas.length
      ? business.serviceAreas.map((area) => ({
          "@type": "Place",
          name: area.name,
        }))
      : undefined,
  };
}

export function buildArticleJsonLd(guide: GuideDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt ?? undefined,
    url: absoluteUrl(`/guides/${guide.slug}`),
    image: guide.featuredImageUrl ?? undefined,
    datePublished: guide.publishedAt ?? undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
