import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { type BreadcrumbEntry } from "@/components/yardola/page-breadcrumbs";
import { ProjectGrid } from "@/components/yardola/project-grid";
import { BusinessGrid } from "@/components/yardola/business-grid";
import { CategoryCard } from "@/components/yardola/category-card";
import { Pagination } from "@/components/yardola/pagination";
import { listProjects } from "@/lib/data/projects";
import { listBusinesses } from "@/lib/data/businesses";
import {
  listOtherCategories,
  listCategoriesWithSampleImage,
} from "@/lib/data/categories";
import { listCitiesWithPublishedProjectsForCategory } from "@/lib/data/locations";
import { listRelatedGuides } from "@/lib/data/guides";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";

interface CategoryProjectsViewProps {
  category: Category;
  city?: City;
  page: number;
  basePath: string;
}

/**
 * Shared editorial view for a category page and a category+location page
 * -- same shape, just scoped to an additional city when one is provided.
 */
export async function CategoryProjectsView({
  category,
  city,
  page,
  basePath,
}: CategoryProjectsViewProps) {
  const [
    projectResult,
    professionals,
    relatedCategories,
    relatedLocations,
    relatedGuides,
  ] = await Promise.all([
    listProjects({ categorySlug: category.slug, citySlug: city?.slug }, page),
    listBusinesses({ categorySlug: category.slug, citySlug: city?.slug }, 1, 4),
    listOtherCategories(category.slug, 4).then(listCategoriesWithSampleImage),
    listCitiesWithPublishedProjectsForCategory(category.id, {
      excludeCitySlug: city?.slug,
      limit: 4,
    }),
    listRelatedGuides("", { categoryId: category.id, limit: 3 }),
  ]);

  const breadcrumbItems: BreadcrumbEntry[] = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    city
      ? { label: category.name, href: `/projects/${category.slug}` }
      : { label: category.name },
  ];
  if (city) breadcrumbItems.push({ label: city.name });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs items={breadcrumbItems} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          {city
            ? `${category.name} in ${city.name}, ${city.stateAbbreviation}`
            : category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground mt-3">{category.description}</p>
        )}
        <p className="text-muted-foreground mt-3 text-sm">
          {projectResult.total}{" "}
          {projectResult.total === 1 ? "project" : "projects"}
        </p>
      </div>

      <div className="mt-8">
        <ProjectGrid
          projects={projectResult.items}
          emptyState={
            <EmptyState
              icon={SearchX}
              title="No projects found yet"
              description={
                city
                  ? `No ${category.name.toLowerCase()} projects in ${city.name} yet -- check back soon.`
                  : "Check back soon for new projects in this category."
              }
              action={
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href="/projects" />}
                >
                  Browse all projects
                </Button>
              }
            />
          }
        />
      </div>

      {projectResult.pageCount > 1 && (
        <div className="mt-10">
          <Pagination
            page={projectResult.page}
            pageCount={projectResult.pageCount}
            buildHref={(targetPage) =>
              targetPage > 1 ? `${basePath}?page=${targetPage}` : basePath
            }
          />
        </div>
      )}

      {professionals.items.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-foreground text-2xl">
              Professionals for {category.name.toLowerCase()}
              {city ? ` in ${city.name}` : ""}
            </h2>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/professionals" />}
            >
              View all professionals
            </Button>
          </div>
          <div className="mt-6">
            <BusinessGrid businesses={professionals.items} />
          </div>
        </section>
      )}

      {relatedLocations.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            {city ? "Other locations" : "Browse by location"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {category.name} projects in nearby areas.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relatedLocations.map((related) => (
              <Link
                key={related.id}
                href={`/projects/${category.slug}/${related.slug}`}
                className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring rounded-lg border p-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {category.name} in {related.name}, {related.stateAbbreviation}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedCategories.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Explore related categories
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedCategories.map((related) => (
              <CategoryCard
                key={related.id}
                category={related}
                href={
                  city ? `/projects/${related.slug}/${city.slug}` : undefined
                }
              />
            ))}
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Related guides
          </h2>
          <ul className="mt-6 space-y-3">
            {relatedGuides.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-foreground hover:text-primary focus-visible:ring-ring underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
