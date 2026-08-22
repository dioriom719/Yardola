import { HomepageBuilder } from "@/components/yardola/home/builder/homepage-builder";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ZipCode } from "@/lib/data/locations";

interface BuilderSectionProps {
  categories: Category[];
  cities: City[];
  zipCodes: ZipCode[];
  initialCategoryId?: string;
}

/**
 * The no-login project builder, visually integrated into the homepage
 * rather than linking out to a separate page. `id="start-project"` is
 * the target for every "Start Your Project" CTA on the page.
 *
 * Phase 1.7: dropped the ivory section wash from Phase 1.6 -- the brief
 * called for cutting cream/sand back further toward a cohesive white
 * canvas, so the card's own border and shadow now do all the work of
 * reading as a distinct "product moment," not a background color.
 */
export function BuilderSection({
  categories,
  cities,
  zipCodes,
  initialCategoryId,
}: BuilderSectionProps) {
  return (
    <section id="start-project" className="border-border scroll-mt-16 border-t">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <h2 className="font-display text-foreground text-center text-3xl sm:text-4xl lg:text-5xl">
          Plan your project.
        </h2>

        <div className="border-border bg-card mt-8 overflow-hidden rounded-2xl border shadow-md">
          <HomepageBuilder
            categories={categories}
            cities={cities}
            zipCodes={zipCodes}
            initialCategoryId={initialCategoryId}
          />
        </div>
      </div>
    </section>
  );
}
