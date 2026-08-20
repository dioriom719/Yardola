import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCityBySlug } from "@/lib/data/locations";
import { paramInt } from "@/lib/search-params";
import { CategoryProjectsView } from "../_components/category-projects-view";

export async function generateMetadata(
  props: PageProps<"/projects/[slug]/[location]">
) {
  const { slug, location } = await props.params;
  const [category, city] = await Promise.all([
    getCategoryBySlug(slug),
    getCityBySlug(location),
  ]);

  if (!category || !city) return { title: "Yardola" };
  return {
    title: `${category.name} in ${city.name}, ${city.stateAbbreviation} | Yardola`,
  };
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
