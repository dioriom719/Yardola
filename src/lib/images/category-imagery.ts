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
    alt: "A backyard pool with a wooden pergola at sunset",
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
  src: "/images/hero/backyard-bright.jpg",
  alt: "A bright, sunlit modern backyard with a covered patio, pool, and turf lawn",
};

/** Reuses the original (dusk) hero photo as a distinct, moodier closing image. */
export const FINAL_CTA_IMAGE: CategoryImage = {
  src: "/images/hero/pool-golden-hour.jpg",
  alt: "A modern desert home with a lap pool at golden hour",
};

/**
 * Curated "inspiration" imagery for the homepage's completed-projects
 * section -- explicitly NOT tied to real project/business records (see
 * InspirationGallery). Distinct from CATEGORY_IMAGES so the two sections
 * never show identical photos.
 */
export const INSPIRATION_IMAGES: (CategoryImage & { label: string })[] = [
  {
    src: "/images/inspiration/poolside-lounge.jpg",
    alt: "An aerial view of a pool deck with lounge chairs, umbrellas, and flowers",
    label: "Poolside Living",
  },
  {
    src: "/images/categories/outdoor-kitchens.jpg",
    alt: "A modern outdoor kitchen with a built-in grill beside a pool",
    label: "Outdoor Kitchens",
  },
  {
    src: "/images/categories/landscaping.jpg",
    alt: "Desert landscaping with palms, cacti, and flowering bougainvillea",
    label: "Landscape Design",
  },
  {
    src: "/images/inspiration/evening-lighting.jpg",
    alt: "String lights glowing over an evening patio",
    label: "Evening Ambiance",
  },
  {
    src: "/images/categories/pools.jpg",
    alt: "A backyard pool surrounded by palm trees and landscaping",
    label: "Backyard Pools",
  },
];
