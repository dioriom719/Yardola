import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { SearchBar } from "@/components/yardola/search-bar";
import { FilterBar } from "@/components/yardola/filter-bar";
import { BusinessGrid } from "@/components/yardola/business-grid";
import { Pagination } from "@/components/yardola/pagination";
import { CategoryCard } from "@/components/yardola/category-card";
import {
  listCategories,
  listCategoriesWithSampleImage,
} from "@/lib/data/categories";
import { listCities } from "@/lib/data/locations";
import { listBusinesses, type BusinessFilters } from "@/lib/data/businesses";
import { paramInt, paramString } from "@/lib/search-params";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

const TITLE = "Backyard Professionals in Las Vegas | YARDOLO";
const DESCRIPTION =
  "Portfolios from the businesses building Las Vegas backyards on YARDOLO -- browse by category or location.";

/**
 * `/professionals` itself (no filters) is a legitimate indexable
 * directory hub. Filtered views are faceted navigation: noindex, with
 * the canonical pointing back at the unfiltered directory (there's no
 * approved `/professionals/[category]/[location]` tier to canonicalize
 * to, unlike `/projects`).
 */
export async function generateMetadata(
  props: PageProps<"/professionals">
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const hasAnyFilter = Boolean(
    paramString(searchParams, "category") ||
    paramString(searchParams, "location") ||
    paramString(searchParams, "q")
  );

  return buildMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/professionals",
    index: !hasAnyFilter,
  });
}

export default async function ProfessionalsPage(
  props: PageProps<"/professionals">
) {
  const searchParams = await props.searchParams;

  const filters: BusinessFilters = {
    categorySlug: paramString(searchParams, "category"),
    citySlug: paramString(searchParams, "location"),
    query: paramString(searchParams, "q"),
  };
  const page = paramInt(searchParams, "page", 1);

  const [result, categories, cities] = await Promise.all([
    listBusinesses(filters, page),
    listCategories(),
    listCities(),
  ]);
  const categoriesWithSample = await listCategoriesWithSampleImage(
    categories.slice(0, 4)
  );

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.citySlug) params.set("location", filters.citySlug);
    if (filters.query) params.set("q", filters.query);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/professionals?${qs}` : "/professionals";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Professionals" }]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Backyard Professionals
        </h1>
        <p className="text-muted-foreground mt-3">
          Portfolios from the businesses building Las Vegas backyards on
          YARDOLO.
        </p>
      </div>

      <div className="border-border bg-card mt-8 rounded-2xl border p-5 shadow-sm sm:p-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Find what you&apos;re looking for
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-none lg:flex-1">
            <SearchBar placeholder="Search professionals..." size="lg" />
          </div>
          <FilterBar
            categories={categories}
            cities={cities}
            hideStyle
            hideBudget
          />
        </div>
      </div>

      <p className="text-muted-foreground mt-6 text-sm">
        {result.total} {result.total === 1 ? "professional" : "professionals"}
      </p>

      <div className="mt-4">
        <BusinessGrid
          businesses={result.items}
          emptyState={
            <EmptyState
              icon={Users}
              title="No professionals found"
              description="Try a different category or location."
              action={
                hasActiveFilters && (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/professionals" />}
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

      {categoriesWithSample.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Browse by category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categoriesWithSample.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                href={`/professionals?category=${category.slug}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
