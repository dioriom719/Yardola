import { createClient } from "@/lib/supabase/server";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCityBySlug } from "@/lib/data/locations";
import {
  PROJECT_CARD_FIELDS,
  mapProjectCard,
  type ProjectCardRow,
} from "@/lib/data/projects";
import {
  toPaginatedResult,
  sanitizeSearchTerm,
  type PaginatedResult,
} from "@/lib/data/pagination";
import type { VerificationStatus } from "@/types/enums";
import type { BusinessCardData, BusinessDetail } from "@/types/business";
import type { ProjectCardData } from "@/types/project";

export const BUSINESSES_PAGE_SIZE = 12;

export interface BusinessFilters {
  categorySlug?: string;
  citySlug?: string;
  query?: string;
}

interface BusinessCardRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  verification_status: VerificationStatus;
  city: string | null;
  state: string | null;
  business_services: {
    services: { categories: { name: string } | null } | null;
  }[];
  project_count: { count: number }[];
  projects: { project_photos: { url: string; photo_type: string }[] }[];
}

function mapBusinessCard(row: BusinessCardRow): BusinessCardData {
  const categoryNames = [
    ...new Set(
      row.business_services
        .map((bs) => bs.services?.categories?.name)
        .filter((name): name is string => Boolean(name))
    ),
  ];

  const previewPhotoUrls = row.projects
    .map(
      (p) => p.project_photos.find((photo) => photo.photo_type === "hero")?.url
    )
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    verificationStatus: row.verification_status,
    city: row.city,
    state: row.state,
    categoryNames,
    projectCount: row.project_count[0]?.count ?? 0,
    previewPhotoUrls,
  };
}

const BUSINESS_CARD_SELECT = `
  id, slug, name, logo_url, verification_status, city, state,
  business_services(services(categories(name))),
  project_count:projects(count),
  projects(project_photos(url, photo_type))
`;

export async function listBusinesses(
  filters: BusinessFilters = {},
  page = 1,
  pageSize = BUSINESSES_PAGE_SIZE
): Promise<PaginatedResult<BusinessCardData>> {
  const supabase = await createClient();

  const [category, city] = await Promise.all([
    filters.categorySlug ? getCategoryBySlug(filters.categorySlug) : null,
    filters.citySlug ? getCityBySlug(filters.citySlug) : null,
  ]);

  if ((filters.categorySlug && !category) || (filters.citySlug && !city)) {
    return toPaginatedResult([], 0, page, pageSize);
  }

  const businessServicesEmbed = category
    ? "business_services!inner(services!inner(category_id, categories(name)))"
    : "business_services(services(categories(name)))";
  const serviceAreasEmbed = city ? "business_service_areas!inner(city_id)" : "";

  let queryBuilder = supabase
    .from("businesses")
    .select(
      `id, slug, name, logo_url, verification_status, city, state,
       ${businessServicesEmbed},
       ${serviceAreasEmbed ? `${serviceAreasEmbed},` : ""}
       project_count:projects(count),
       projects(project_photos(url, photo_type))`,
      { count: "exact" }
    )
    .eq("status", "active")
    .eq("projects.status", "published")
    .limit(3, { foreignTable: "projects" });

  if (category) {
    queryBuilder = queryBuilder.eq(
      "business_services.services.category_id",
      category.id
    );
  }
  if (city) {
    queryBuilder = queryBuilder.eq("business_service_areas.city_id", city.id);
  }
  if (filters.query) {
    const term = sanitizeSearchTerm(filters.query);
    if (term) {
      queryBuilder = queryBuilder.ilike("name", `%${term}%`);
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await queryBuilder
    .order("verification_status", { ascending: false })
    .order("name", { ascending: true })
    .range(from, to)
    .returns<BusinessCardRow[]>();

  if (error) throw error;

  return toPaginatedResult(
    (data ?? []).map(mapBusinessCard),
    count ?? 0,
    page,
    pageSize
  );
}

export async function listFeaturedBusinesses(
  limit = 4
): Promise<BusinessCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_CARD_SELECT)
    .eq("status", "active")
    .eq("projects.status", "published")
    .limit(3, { foreignTable: "projects" })
    .order("verification_status", { ascending: false })
    .order("name", { ascending: true })
    .limit(limit)
    .returns<BusinessCardRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapBusinessCard);
}

interface BusinessDetailRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  verification_status: VerificationStatus;
  business_profiles: {
    tagline: string | null;
    about: string | null;
    year_established: number | null;
    highlights: string[];
  } | null;
  business_services: {
    services: {
      name: string;
      slug: string;
      categories: { name: string } | null;
    } | null;
  }[];
  business_service_areas: { cities: { name: string } | null }[];
  professionals: {
    id: string;
    name: string;
    title: string | null;
    bio: string | null;
    photo_url: string | null;
  }[];
}

const BUSINESS_DETAIL_SELECT = `
  id, slug, name, description, website, phone, logo_url, city, state, verification_status,
  business_profiles(tagline, about, year_established, highlights),
  business_services(services(name, slug, categories(name))),
  business_service_areas(cities(name)),
  professionals(id, name, title, bio, photo_url)
`;

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("professionals.is_public", true)
    .maybeSingle()
    .returns<BusinessDetailRow>();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description,
    website: data.website,
    phone: data.phone,
    logoUrl: data.logo_url,
    city: data.city,
    state: data.state,
    verificationStatus: data.verification_status,
    profile: data.business_profiles
      ? {
          tagline: data.business_profiles.tagline,
          about: data.business_profiles.about,
          yearEstablished: data.business_profiles.year_established,
          highlights: data.business_profiles.highlights ?? [],
        }
      : null,
    services: data.business_services
      .map((bs) => bs.services)
      .filter(
        (
          s
        ): s is {
          name: string;
          slug: string;
          categories: { name: string } | null;
        } => s !== null
      )
      .map((s) => ({
        name: s.name,
        slug: s.slug,
        categoryName: s.categories?.name ?? "",
      })),
    serviceAreaCityNames: data.business_service_areas
      .map((a) => a.cities?.name)
      .filter((name): name is string => Boolean(name)),
    professionals: data.professionals.map((p) => ({
      id: p.id,
      name: p.name,
      title: p.title,
      bio: p.bio,
      photoUrl: p.photo_url,
    })),
    projects: await listPublishedProjectCardsForBusiness(data.id),
  };
}

async function listPublishedProjectCardsForBusiness(
  businessId: string
): Promise<ProjectCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_CARD_FIELDS)
    .eq("business_id", businessId)
    .eq("status", "published")
    .eq("project_photos.photo_type", "hero")
    .limit(1, { foreignTable: "project_photos" })
    .limit(1, { foreignTable: "project_categories" })
    .limit(1, { foreignTable: "project_styles" })
    .order("created_at", { ascending: false })
    .returns<ProjectCardRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapProjectCard);
}
