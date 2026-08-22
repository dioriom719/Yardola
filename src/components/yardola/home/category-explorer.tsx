import Image from "next/image";
import Link from "next/link";
import { CATEGORY_IMAGES } from "@/lib/images/category-imagery";
import type { Category } from "@/types/category";

/**
 * Large visual discovery gallery -- Phase 1.6 replaces the small
 * 4-column tile grid with fewer, much bigger tiles (3 per row) so each
 * photograph is actually appreciable, not a thumbnail. Every image shows
 * a complete finished space for its category, never a texture or
 * close-up (a putting green tile shows a finished backyard, not grass).
 */
export function CategoryExplorer({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
      <h2 className="font-display text-foreground text-3xl sm:text-4xl lg:text-5xl">
        What are you dreaming about?
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const image = CATEGORY_IMAGES[category.slug];
          return (
            <Link
              key={category.id}
              href={`/projects/${category.slug}`}
              className="group bg-muted focus-visible:ring-ring relative block aspect-[4/3] overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {image && (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent transition-opacity duration-300 group-hover:from-black/75" />
              <span className="font-display absolute bottom-5 left-5 text-xl text-white sm:text-2xl">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
