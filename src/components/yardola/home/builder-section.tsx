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
 * Section 2 of the redesign: the no-login project builder, visually
 * integrated into the homepage rather than linking out to a separate
 * page. `id="start-project"` is the target for every "Start Your
 * Project" CTA on the page.
 */
export function BuilderSection({
  categories,
  cities,
  zipCodes,
}: BuilderSectionProps) {
  return (
    <section
      id="start-project"
      className="bg-secondary/30 border-border scroll-mt-16 border-b"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="text-center">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
            Start your project
          </p>
          <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
            What are you dreaming about?
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
            Answer a few quick questions -- no account required to get started.
          </p>
        </div>

        <div className="border-border bg-card mt-12 overflow-hidden rounded-2xl border shadow-sm">
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
