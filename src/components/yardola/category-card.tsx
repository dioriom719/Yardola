import Image from "next/image";
import Link from "next/link";
import type { CategoryWithSample } from "@/lib/data/categories";

interface CategoryCardProps {
  category: CategoryWithSample;
  /** Defaults to the plain category page; pass e.g. a city slug suffix to link into a category+location page instead. */
  href?: string;
}

/**
 * Visual entry point into a project category (e.g. Pools, Artificial
 * Turf), illustrated with a real photo from one of its projects.
 */
export function CategoryCard({ category, href }: CategoryCardProps) {
  return (
    <Link
      href={href ?? `/projects/${category.slug}`}
      className="group bg-muted focus-visible:ring-ring relative block aspect-[3/4] overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {category.sampleImageUrl && (
        <Image
          src={category.sampleImageUrl}
          alt={category.sampleImageAlt ?? category.name}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <span className="font-display absolute bottom-4 left-4 text-lg text-white">
        {category.name}
      </span>
    </Link>
  );
}
