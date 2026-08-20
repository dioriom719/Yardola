import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/types";

interface CategoryCardProps {
  category: CategorySummary;
}

/**
 * Visual entry point into a project category (e.g. Pool Construction,
 * Artificial Turf). Phase 1 structure only.
 */
export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/projects/${category.slug}`}
      className="group bg-muted focus-visible:ring-ring relative block aspect-3/4 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Image
        src={category.imageUrl}
        alt={category.imageAlt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
      <span className="font-display absolute bottom-4 left-4 text-lg text-white">
        {category.name}
      </span>
    </Link>
  );
}
