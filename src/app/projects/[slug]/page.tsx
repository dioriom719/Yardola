import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProjectBySlug } from "@/lib/data/projects";
import { paramInt } from "@/lib/search-params";
import {
  generateCategoryMetadata,
  generateProjectMetadata,
} from "@/lib/seo/metadata";
import {
  getCategoryIndexability,
  getProjectIndexability,
} from "@/lib/seo/indexability";
import { CategoryProjectsView } from "./_components/category-projects-view";
import { ProjectDetailView } from "./_components/project-detail-view";
import type { Metadata } from "next";

/**
 * `/projects/[slug]` serves two different kinds of content under one URL
 * shape: a category browse page (`/projects/pools`) and an individual
 * project page (`/projects/summerlin-lagoon-pool`). Next.js can't have
 * two differently-named dynamic segments at the same route level, so
 * this disambiguates by looking the slug up as a category first, then as
 * a project -- category slugs are a small, fixed, admin-controlled set,
 * so that's the safe tie-breaker if a project ever shared a slug with a
 * category.
 */
export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;

  const category = await getCategoryBySlug(slug);
  if (category) {
    const searchParams = await props.searchParams;
    const page = paramInt(searchParams, "page", 1);
    const { index } = await getCategoryIndexability(category);
    // Only the first page of a paginated hub is treated as canonical /
    // indexable -- deeper pages are near-duplicates of the same content.
    return generateCategoryMetadata(category, index && page === 1);
  }

  const project = await getProjectBySlug(slug);
  if (project) {
    return generateProjectMetadata(
      project,
      getProjectIndexability(project).index
    );
  }

  return { title: "YARDOLO", robots: { index: false, follow: true } };
}

export default async function ProjectOrCategoryPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;

  const category = await getCategoryBySlug(slug);
  if (category) {
    const searchParams = await props.searchParams;
    const page = paramInt(searchParams, "page", 1);
    return (
      <CategoryProjectsView
        category={category}
        page={page}
        basePath={`/projects/${category.slug}`}
      />
    );
  }

  const project = await getProjectBySlug(slug);
  if (project) {
    return <ProjectDetailView project={project} />;
  }

  notFound();
}
