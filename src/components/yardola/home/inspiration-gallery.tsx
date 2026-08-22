import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { INSPIRATION_IMAGES } from "@/lib/images/category-imagery";

/**
 * "See what's possible" -- replaces the old DB-driven featured-projects
 * grid on the homepage. That grid pulled real `projects` rows, but the
 * current seed data's photos are plain placehold.co color swatches, not
 * real photography -- showing those as "the most visually compelling
 * section on the site" would both look bad and, worse, imply real
 * finished-project photography exists when it doesn't. This section uses
 * curated stock photography instead, honestly labeled as inspiration
 * (never a business/location claim), with a real featured/supporting
 * hierarchy for an editorial-portfolio feel. `listFeaturedProjects()` and
 * `ProjectCard` are untouched -- real project browsing still lives at
 * /projects, linked below, and this section can be swapped back to real
 * project data the moment genuine project photography exists.
 */
export function InspirationGallery() {
  const [featured, ...supporting] = INSPIRATION_IMAGES;

  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
              Get inspired
            </p>
            <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
              See what&apos;s possible.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              A look at the finished spaces YARDOLO professionals can help you
              create.
            </p>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Browse real projects
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2">
          <div className="group bg-muted relative aspect-[4/3] overflow-hidden rounded-xl md:row-span-2 md:aspect-auto">
            <Image
              src={featured.src}
              alt={featured.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
            <div className="absolute right-5 bottom-5 left-5">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide text-white uppercase backdrop-blur-sm">
                Inspiration
              </span>
              <p className="font-display mt-2.5 text-2xl text-white sm:text-3xl">
                {featured.label}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-rows-2">
            {supporting.map((image) => (
              <div
                key={image.src}
                className="group bg-muted relative aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 24vw, 45vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <span className="font-display absolute bottom-3 left-3 text-sm text-white sm:text-base">
                  {image.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Inspiration imagery -- not photos of a specific YARDOLO project. See
          real, completed projects from our professionals at{" "}
          <Link href="/projects" className="text-primary hover:underline">
            /projects
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
