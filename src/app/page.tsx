import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/yardola/project-card";
import { BusinessCard } from "@/components/yardola/business-card";
import { Hero } from "@/components/yardola/home/hero";
import { BuilderSection } from "@/components/yardola/home/builder-section";
import { CategoryExplorer } from "@/components/yardola/home/category-explorer";
import { HowItWorks } from "@/components/yardola/home/how-it-works";
import { FinalCta } from "@/components/yardola/home/final-cta";
import { listCategories } from "@/lib/data/categories";
import { listCities, listZipCodes } from "@/lib/data/locations";
import { listFeaturedProjects } from "@/lib/data/projects";
import { listSavedProjectIds } from "@/lib/data/saved-projects";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { listGuides } from "@/lib/data/guides";
import { generateHomeMetadata } from "@/lib/seo/metadata";

export const metadata = generateHomeMetadata();

export default async function Home() {
  const [
    categories,
    cities,
    zipCodes,
    featuredProjects,
    featuredBusinesses,
    guides,
  ] = await Promise.all([
    listCategories(),
    listCities(),
    listZipCodes(),
    listFeaturedProjects(8),
    listFeaturedBusinesses(4),
    listGuides(3),
  ]);
  const savedProjectIds = await listSavedProjectIds(
    featuredProjects.map((project) => project.id)
  );

  return (
    <>
      <Hero />

      <BuilderSection
        categories={categories}
        cities={cities}
        zipCodes={zipCodes}
      />

      <CategoryExplorer categories={categories} />

      {/* Real projects. Real inspiration. */}
      {featuredProjects.length > 0 && (
        <section className="border-border bg-secondary/20 border-t">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                  Get inspired
                </p>
                <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
                  Real projects. Real inspiration.
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                  See what&apos;s possible in backyards YARDOLO professionals
                  have brought to life.
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/projects" />}
              >
                Browse all projects
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  initialSaved={savedProjectIds.has(project.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />

      {/* Meet the people behind the projects */}
      {featuredBusinesses.length > 0 && (
        <section className="border-border bg-secondary/20 border-t">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                  Professionals
                </p>
                <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
                  Meet the people behind the projects.
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                  Las Vegas professionals building the backyards on YARDOLO.
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/professionals" />}
              >
                Browse all professionals
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YARDOLO Guide */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                Ideas
              </p>
              <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
                YARDOLO Guide
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Ideas and advice for planning a backyard project in Las Vegas.
              </p>
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/guides" />}
            >
              All guides
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {guide.categoryName && (
                  <div className="p-5 pb-0">
                    <span className="text-primary text-xs font-medium tracking-wide uppercase">
                      {guide.categoryName}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display text-foreground text-xl">
                    {guide.title}
                  </h3>
                  {guide.excerpt && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {guide.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FinalCta />
    </>
  );
}
