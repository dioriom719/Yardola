import Link from "next/link";
import { MapPin } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { listCities } from "@/lib/data/locations";
import { listProjects } from "@/lib/data/projects";
import { listBusinesses } from "@/lib/data/businesses";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Locations | YARDOLO",
  description:
    "Browse backyard projects and professionals by location across the Las Vegas market.",
  path: "/locations",
  index: true,
});

export default async function LocationsPage() {
  const cities = await listCities();

  const cityTotals = await Promise.all(
    cities.map((city) =>
      Promise.all([
        listProjects({ citySlug: city.slug }, 1, 1),
        listBusinesses({ citySlug: city.slug }, 1, 1),
      ])
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Locations" }]}
      />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Locations
        </h1>
        <p className="text-muted-foreground mt-3">
          Browse backyard projects and professionals by location across the Las
          Vegas market.
        </p>
      </div>

      <div className="mt-10">
        {cities.length === 0 ? (
          <EmptyState icon={MapPin} title="No locations published yet" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city, i) => {
              const [projectResult, businessResult] = cityTotals[i];
              const counts = [
                projectResult.total > 0
                  ? `${projectResult.total} ${projectResult.total === 1 ? "project" : "projects"}`
                  : null,
                businessResult.total > 0
                  ? `${businessResult.total} ${businessResult.total === 1 ? "professional" : "professionals"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <Link
                  key={city.id}
                  href={`/locations/${city.slug}`}
                  className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring rounded-lg border p-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {city.name}, {city.stateAbbreviation}
                  {counts && (
                    <p className="text-muted-foreground mt-1 text-xs font-normal">
                      {counts}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
