import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCityBySlug } from "@/lib/data/locations";
import { paramInt } from "@/lib/search-params";
import {
  countActiveBusinesses,
  countPublishedProjects,
} from "@/lib/seo/counts";
import { getCategoryLocationIndexability } from "@/lib/seo/indexability";
import { generateCategoryLocationMetadata } from "@/lib/seo/metadata";
import { CategoryProjectsView } from "../_components/category-projects-view";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/projects/[slug]/[location]">
): Promise<Metadata> {
  const { slug, location } = await props.params;
  const searchParams = await props.searchParams;
  const page = paramInt(searchParams, "page", 1);

  const [category, city] = await Promise.all([
    getCategoryBySlug(slug),
    getCityBySlug(location),
  ]);

  if (!category || !city)
    return { title: "Yardola", robots: { index: false, follow: true } };

  const [{ index }, projectCount, businessCount] = await Promise.all([
    getCategoryLocationIndexability(category, city),
    countPublishedProjects({ categoryId: category.id, cityId: city.id }),
    countActiveBusinesses({ categoryId: category.id, cityId: city.id }),
  ]);

  // Only the first page of a paginated hub is treated as canonical/indexable.
  return generateCategoryLocationMetadata(category, city, index && page === 1, {
    projectCount,
    businessCount,
  });
}

export default async function CategoryLocationPage(
  props: PageProps<"/projects/[slug]/[location]">
) {
  const { slug, location } = await props.params;
  const searchParams = await props.searchParams;
  const page = paramInt(searchParams, "page", 1);

  const [category, city] = await Promise.all([
    getCategoryBySlug(slug),
    getCityBySlug(location),
  ]);

  if (!category || !city) notFound();

  return (
    <CategoryProjectsView
      category={category}
      city={city}
      page={page}
      basePath={`/projects/${category.slug}/${city.slug}`}
    />
  );
}
