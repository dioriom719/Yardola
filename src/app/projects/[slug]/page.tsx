import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProjectBySlug } from "@/lib/data/projects";
import { paramInt } from "@/lib/search-params";
import { CategoryProjectsView } from "./_components/category-projects-view";
import { ProjectDetailView } from "./_components/project-detail-view";

// Basic per-page titles only -- canonicals, structured data, and the
// rest of the SEO system land in a later phase.
export async function generateMetadata(props: PageProps<"/projects/[slug]">) {
  const { slug } = await props.params;

  const category = await getCategoryBySlug(slug);
  if (category) {
    return { title: `${category.name} Projects | Yardola` };
  }

  const project = await getProjectBySlug(slug);
  if (project) {
    return { title: `${project.title} | Yardola` };
  }

  return { title: "Yardola" };
}

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
