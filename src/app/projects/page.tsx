import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { SearchBar } from "@/components/yardola/search-bar";
import { FilterBar } from "@/components/yardola/filter-bar";
import { ProjectGrid } from "@/components/yardola/project-grid";
import { Pagination } from "@/components/yardola/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { listCategories } from "@/lib/data/categories";
import { listCities } from "@/lib/data/locations";
import { listStyles } from "@/lib/data/styles";
import { listProjects, type ProjectFilters } from "@/lib/data/projects";
import { paramInt, paramString } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo/metadata";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import type { BudgetRange } from "@/types/enums";

const TITLE = "Explore Backyard Projects | Yardola";
const DESCRIPTION =
  "Browse real backyard transformations from Las Vegas professionals across every category and location.";

/**
 * `/projects` itself (no filters) is a legitimate, valuable indexable
 * hub. Any filtered/search view is faceted navigation -- noindex, with
 * a canonical pointing at the closest real hub (a category or
 * category+location page) when the active filters match one exactly.
 */
export async function generateMetadata(
  props: PageProps<"/projects">
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const categorySlug = paramString(searchParams, "category");
  const locationSlug = paramString(searchParams, "location");
  const styleSlug = paramString(searchParams, "style");
  const budget = paramString(searchParams, "budget");
  const q = paramString(searchParams, "q");

  const hasAnyFilter = Boolean(
    categorySlug || locationSlug || styleSlug || budget || q
  );
  if (!hasAnyFilter) {
    return buildMetadata({
      title: TITLE,
      description: DESCRIPTION,
      path: "/projects",
      index: true,
    });
  }

  const onlyCategoryAndMaybeLocation =
    categorySlug && !styleSlug && !budget && !q;
  const canonicalPath =
    onlyCategoryAndMaybeLocation && locationSlug
      ? `/projects/${categorySlug}/${locationSlug}`
      : onlyCategoryAndMaybeLocation
        ? `/projects/${categorySlug}`
        : "/projects";

  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: canonicalPath,
    index: false,
  });
}

export default async function ProjectsPage(props: PageProps<"/projects">) {
  const searchParams = await props.searchParams;

  const filters: ProjectFilters = {
    categorySlug: paramString(searchParams, "category"),
    citySlug: paramString(searchParams, "location"),
    styleSlug: paramString(searchParams, "style"),
    budgetRange: paramString(searchParams, "budget") as BudgetRange | undefined,
    query: paramString(searchParams, "q"),
  };
  const page = paramInt(searchParams, "page", 1);

  const [result, categories, cities, styles] = await Promise.all([
    listProjects(filters, page),
    listCategories(),
    listCities(),
    listStyles(),
  ]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.citySlug) params.set("location", filters.citySlug);
    if (filters.styleSlug) params.set("style", filters.styleSlug);
    if (filters.budgetRange) params.set("budget", filters.budgetRange);
    if (filters.query) params.set("q", filters.query);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Explore Backyard Projects
        </h1>
        <p className="text-muted-foreground mt-3">
          Browse real backyard transformations from Las Vegas professionals.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:max-w-xs lg:flex-1">
          <SearchBar placeholder="Search projects or pros..." />
        </div>
        <FilterBar categories={categories} cities={cities} styles={styles} />
      </div>

      <p className="text-muted-foreground mt-6 text-sm">
        {result.total} {result.total === 1 ? "project" : "projects"}
      </p>

      <div className="mt-4">
        <ProjectGrid
          projects={result.items}
          emptyState={
            <EmptyState
              icon={SearchX}
              title="No projects found"
              description="Try a different category, location, style, or budget."
              action={
                hasActiveFilters && (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/projects" />}
                  >
                    Clear filters
                  </Button>
                )
              }
            />
          }
        />
      </div>

      <div className="mt-10">
        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          buildHref={buildHref}
        />
      </div>
    </div>
  );
}
