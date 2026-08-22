import Image from "next/image";
import Link from "next/link";
import { CATEGORY_IMAGES } from "@/lib/images/category-imagery";
import type { Category } from "@/types/category";

/**
 * Image-first category exploration -- a clean, symmetrical grid.
 * Every tile shares the same aspect ratio and the same spacing;
 * consistency here reads as "intentional marketplace interface" rather
 * than an editorial collage (that treatment is reserved for the hero and
 * the inspiration gallery instead -- see Phase 1.5 notes in that file).
 */
export function CategoryExplorer({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
          Explore
        </p>
        <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
          What are you dreaming about?
        </h2>
        <p className="text-muted-foreground mt-4 text-lg">
          Start with a category to see real backyard transformations.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {categories.map((category) => {
          const image = CATEGORY_IMAGES[category.slug];
          return (
            <Link
              key={category.id}
              href={`/projects/${category.slug}`}
              className="group bg-muted focus-visible:ring-ring relative block aspect-[4/5] overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {image && (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 24vw, 45vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
              <span className="font-display absolute bottom-4 left-4 text-lg text-white sm:text-xl">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
