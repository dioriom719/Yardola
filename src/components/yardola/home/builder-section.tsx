import { HomepageBuilder } from "@/components/yardola/home/builder/homepage-builder";
import type { Category } from "@/types/category";
import type { City } from "@/types/location";
import type { ZipCode } from "@/lib/data/locations";

interface BuilderSectionProps {
  categories: Category[];
  cities: City[];
  zipCodes: ZipCode[];
}

/**
 * The no-login project builder, visually integrated into the homepage
 * rather than linking out to a separate page. `id="start-project"` is
 * the target for every "Start Your Project" CTA on the page.
 *
 * Phase 1.6: tightened further -- shorter heading, no supporting
 * paragraph (the builder itself explains what it needs, step by step),
 * a slightly warm (not cream) card background so the tool reads as a
 * distinct, premium "moment" against the otherwise white page rather
 * than a form floating in empty space.
 */
export function BuilderSection({
  categories,
  cities,
  zipCodes,
}: BuilderSectionProps) {
  return (
    <section
      id="start-project"
      className="border-border bg-ivory scroll-mt-16 border-t border-b"
    >
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <h2 className="font-display text-foreground text-center text-3xl sm:text-4xl lg:text-5xl">
          Plan your project.
        </h2>

        <div className="border-border bg-card mt-8 overflow-hidden rounded-2xl border shadow-md">
          <HomepageBuilder
            categories={categories}
            cities={cities}
            zipCodes={zipCodes}
          />
        </div>
      </div>
    </section>
  );
}
