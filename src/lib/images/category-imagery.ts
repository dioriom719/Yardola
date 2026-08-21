/**
 * Curated, locally-hosted editorial photography for the homepage's
 * category exploration and project-type picker -- deliberately separate
 * from `listCategoriesWithSampleImage()` (which borrows a photo from a
 * random published project and is used on /projects, /locations, etc).
 * The homepage's imagery needs to stay premium and consistent regardless
 * of what homeowners have or haven't submitted real project photos for
 * yet, so it's keyed by category slug against files checked into
 * `/public/images/categories/` instead.
 *
 * All photos are free-to-use under the Unsplash License, downloaded once
 * at build time into this repo (see CREDITS.md in the same folder) --
 * not hotlinked, so nothing here depends on a third party staying up.
 *
 * Swapping in real, licensed brand photography later is a one-line change
 * per category -- nothing that reads this manifest needs to change.
 */
export interface CategoryImage {
  src: string;
  alt: string;
}

export const CATEGORY_IMAGES: Record<string, CategoryImage> = {
  pools: {
    src: "/images/categories/pools.jpg",
    alt: "A backyard pool surrounded by palm trees and landscaping",
  },
  landscaping: {
    src: "/images/categories/landscaping.jpg",
    alt: "Desert landscaping with palms, cacti, and flowering bougainvillea",
  },
  "artificial-turf": {
    src: "/images/categories/artificial-turf.jpg",
    alt: "A modern home with a vivid green artificial turf lawn and pool",
  },
  "patios-pavers": {
    src: "/images/categories/patios-pavers.jpg",
    alt: "A covered stone patio with modern outdoor furniture",
  },
  "outdoor-kitchens": {
    src: "/images/categories/outdoor-kitchens.jpg",
    alt: "A modern outdoor kitchen with a built-in grill beside a pool",
  },
  pergolas: {
    src: "/images/categories/pergolas.jpg",
    alt: "A modern wooden pergola against a clear evening sky",
  },
  "putting-greens": {
    src: "/images/categories/putting-greens.jpg",
    alt: "Close-up of dense, manicured green turf",
  },
  "outdoor-living": {
    src: "/images/categories/outdoor-living.jpg",
    alt: "A backyard fire pit surrounded by lounge chairs and flowers",
  },
};

export const HERO_IMAGE: CategoryImage = {
  src: "/images/hero/pool-golden-hour.jpg",
  alt: "A modern desert home with a lap pool at golden hour",
};
