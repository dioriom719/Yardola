import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageBreadcrumbs } from "@/components/yardola/page-breadcrumbs";
import { ProjectGrid } from "@/components/yardola/project-grid";
import { BusinessGrid } from "@/components/yardola/business-grid";
import { CategoryCard } from "@/components/yardola/category-card";
import { Pagination } from "@/components/yardola/pagination";
import { getCityBySlug } from "@/lib/data/locations";
import { listProjects } from "@/lib/data/projects";
import { listBusinesses } from "@/lib/data/businesses";
import {
  listCategories,
  listCategoriesWithSampleImage,
} from "@/lib/data/categories";
import { paramInt } from "@/lib/search-params";

export async function generateMetadata(props: PageProps<"/locations/[slug]">) {
  const { slug } = await props.params;
  const city = await getCityBySlug(slug);
  if (!city) return { title: "Yardola" };
  return {
    title: `Backyard Projects in ${city.name}, ${city.stateAbbreviation} | Yardola`,
  };
}

export default async function LocationPage(
  props: PageProps<"/locations/[slug]">
) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = paramInt(searchParams, "page", 1);

  const city = await getCityBySlug(slug);
  if (!city) notFound();

  const [projectResult, professionals, categories] = await Promise.all([
    listProjects({ citySlug: city.slug }, page),
    listBusinesses({ citySlug: city.slug }, 1, 4),
    listCategories().then((cats) =>
      listCategoriesWithSampleImage(cats.slice(0, 4))
    ),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Locations" },
          { label: city.name },
        ]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Backyard Projects in {city.name}, {city.stateAbbreviation}
        </h1>
        <p className="text-muted-foreground mt-3">
          {projectResult.total}{" "}
          {projectResult.total === 1 ? "project" : "projects"} and{" "}
          {professionals.total}{" "}
          {professionals.total === 1 ? "professional" : "professionals"} serving{" "}
          {city.name}.
        </p>
      </div>

      <div className="mt-8">
        <ProjectGrid
          projects={projectResult.items}
          emptyState={
            <EmptyState
              icon={SearchX}
              title="No projects found yet"
              description={`Check back soon for new projects in ${city.name}.`}
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
              targetPage > 1
                ? `/locations/${city.slug}?page=${targetPage}`
                : `/locations/${city.slug}`
            }
          />
        </div>
      )}

      {professionals.items.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-foreground text-2xl">
              Professionals in {city.name}
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

      {categories.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Browse by category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                href={`/projects/${category.slug}/${city.slug}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
