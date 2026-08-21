import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_IS_PUBLICLY_INDEXABLE,
  SITE_NAME,
} from "@/lib/seo/config";
import { absoluteUrl } from "@/lib/seo/urls";
import { formatBudgetRange } from "@/lib/format";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ProjectDetail } from "@/types/project";
import type { BusinessDetail } from "@/types/business";
import type { GuideDetail } from "@/types/guide";

/**
 * Reusable metadata builders -- every indexable page type generates its
 * <title>/description/canonical/OG/Twitter/robots through one of these
 * instead of hand-rolling a metadata object per page.
 */

function robotsFor(index: boolean): Metadata["robots"] {
  // On a placeholder vercel.app host (no real production domain yet),
  // every page is noindex regardless of what the caller asked for -- see
  // SITE_IS_PUBLICLY_INDEXABLE.
  const shouldIndex = index && SITE_IS_PUBLICLY_INDEXABLE;
  // noindex pages still allow `follow` so link equity keeps flowing
  // through them to the pages that *should* rank.
  return shouldIndex
    ? { index: true, follow: true }
    : { index: false, follow: true };
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  index: boolean;
  type?: "website" | "article";
  image?: { url: string; alt: string };
}

export function buildMetadata({
  title,
  description,
  path,
  index,
  type = "website",
  image,
}: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const images = image ? [{ url: image.url, alt: image.alt }] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: robotsFor(index),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export function generateHomeMetadata(): Metadata {
  return buildMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
    index: true,
  });
}

export function generateCategoryMetadata(
  category: Category,
  index: boolean
): Metadata {
  const title = `${category.name} Projects | ${SITE_NAME}`;
  const description = truncate(
    category.description ??
      `Browse real ${category.name.toLowerCase()} projects from Las Vegas professionals, then start planning your own with ${SITE_NAME}.`,
    160
  );

  return buildMetadata({
    title,
    description,
    path: `/projects/${category.slug}`,
    index,
  });
}

export function generateLocationMetadata(city: City, index: boolean): Metadata {
  const place = `${city.name}, ${city.stateAbbreviation}`;
  const title = `Backyard Projects in ${place} | ${SITE_NAME}`;
  const description = truncate(
    `Explore backyard projects and local professionals serving ${place}. Discover inspiration and plan your next project with ${SITE_NAME}.`,
    160
  );

  return buildMetadata({
    title,
    description,
    path: `/locations/${city.slug}`,
    index,
  });
}

export function generateCategoryLocationMetadata(
  category: Category,
  city: City,
  index: boolean,
  counts: { projectCount: number; businessCount: number }
): Metadata {
  const place = `${city.name}, ${city.stateAbbreviation}`;
  const title = `${category.name} Projects in ${place} | ${SITE_NAME}`;

  const parts = [`Browse ${category.name.toLowerCase()} projects in ${place}`];
  if (counts.businessCount > 0) {
    parts.push(
      `and connect with ${counts.businessCount} local professional${counts.businessCount === 1 ? "" : "s"}`
    );
  }
  const description = truncate(`${parts.join(" ")} on ${SITE_NAME}.`, 160);

  return buildMetadata({
    title,
    description,
    path: `/projects/${category.slug}/${city.slug}`,
    index,
  });
}

export function generateProjectMetadata(
  project: ProjectDetail,
  index: boolean
): Metadata {
  const title = `${project.title} | ${SITE_NAME}`;

  const category = project.categories[0]?.name;
  const style = project.styles[0]?.name;
  const budget = formatBudgetRange(project.budgetRange);
  const fallbackParts = [
    style
      ? `A ${style.toLowerCase()}`
      : category
        ? `A ${category.toLowerCase()}`
        : "A backyard",
    "project",
    category && style ? `(${category})` : "",
    `in ${project.cityName}`,
    project.business.name ? `by ${project.business.name}` : "",
  ].filter(Boolean);

  const description = truncate(
    project.description?.trim() ||
      `${fallbackParts.join(" ")}.${budget ? ` Budget: ${budget}.` : ""}`,
    160
  );

  const heroPhoto = project.photos[0];

  return buildMetadata({
    title,
    description,
    path: `/projects/${project.slug}`,
    index,
    type: "article",
    image: heroPhoto
      ? { url: heroPhoto.url, alt: heroPhoto.altText ?? project.title }
      : undefined,
  });
}

export function generateBusinessMetadata(
  business: BusinessDetail,
  index: boolean
): Metadata {
  const title = `${business.name} | ${SITE_NAME}`;

  const location = [business.city, business.state].filter(Boolean).join(", ");
  const fallback = [
    business.name,
    business.services.length > 0
      ? `offering ${business.services
          .slice(0, 3)
          .map((s) => s.name)
          .join(", ")
          .toLowerCase()}`
      : "",
    location ? `serving ${location}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const description = truncate(
    business.profile?.about?.trim() ||
      business.profile?.tagline?.trim() ||
      business.description?.trim() ||
      `${fallback}.`,
    160
  );

  const image = business.logoUrl
    ? { url: business.logoUrl, alt: business.name }
    : business.projects[0]?.heroImageUrl
      ? {
          url: business.projects[0].heroImageUrl,
          alt: business.projects[0].heroImageAlt ?? business.name,
        }
      : undefined;

  return buildMetadata({
    title,
    description,
    path: `/professionals/${business.slug}`,
    index,
    image,
  });
}

export function generateGuideMetadata(
  guide: GuideDetail,
  index: boolean
): Metadata {
  const title = `${guide.title} | ${SITE_NAME}`;
  const description = truncate(
    guide.excerpt?.trim() || `${guide.title} -- a ${SITE_NAME} guide.`,
    160
  );

  return buildMetadata({
    title,
    description,
    path: `/guides/${guide.slug}`,
    index,
    type: "article",
    image: guide.featuredImageUrl
      ? { url: guide.featuredImageUrl, alt: guide.title }
      : undefined,
  });
}

/** For discovery/faceted pages that should never be indexed (search, filters). */
export function generateNoindexMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return buildMetadata({ ...input, index: false });
}
