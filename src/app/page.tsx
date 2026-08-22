import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BusinessCard } from "@/components/yardola/business-card";
import { Hero } from "@/components/yardola/home/hero";
import { BuilderSection } from "@/components/yardola/home/builder-section";
import { CategoryExplorer } from "@/components/yardola/home/category-explorer";
import { InspirationGallery } from "@/components/yardola/home/inspiration-gallery";
import { FinalCta } from "@/components/yardola/home/final-cta";
import { listCategories } from "@/lib/data/categories";
import { listCities, listZipCodes } from "@/lib/data/locations";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { listGuides } from "@/lib/data/guides";
import { generateHomeMetadata } from "@/lib/seo/metadata";

export const metadata = generateHomeMetadata();

/**
 * Homepage story (Phase 1.5): Dream (Hero) -> Explore (CategoryExplorer)
 * -> See what's possible (InspirationGallery) -> Plan (BuilderSection) ->
 * Connect (Professionals) -> Start (FinalCta), with Guides as bonus
 * content before the close. The standalone "How it works" 3-step
 * explainer from Phase 1 was folded out -- the page's own flow now
 * demonstrates that same story directly, so a separate icon-card section
 * repeating it was redundant with itself (see Phase 1.5 report).
 */
export default async function Home() {
  const [categories, cities, zipCodes, featuredBusinesses, guides] =
    await Promise.all([
      listCategories(),
      listCities(),
      listZipCodes(),
      listFeaturedBusinesses(4),
      listGuides(3),
    ]);

  return (
    <>
      <Hero />

      <CategoryExplorer categories={categories} />

      <InspirationGallery />

      <BuilderSection
        categories={categories}
        cities={cities}
        zipCodes={zipCodes}
      />

      {/* Meet the people behind the projects */}
      {featuredBusinesses.length > 0 && (
        <section className="border-border border-t">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                  Connect
                </p>
                <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
                  Meet the people behind the projects.
                </h2>
                <p className="text-muted-foreground mt-4 text-lg">
                  Professionals ready to bring your project to life.
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
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YARDOLO Guide */}
      {guides.length > 0 && (
        <section className="border-border mx-auto max-w-7xl border-t px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
                Ideas
              </p>
              <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
                YARDOLO Guide
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Ideas and advice for planning your next backyard project.
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
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
