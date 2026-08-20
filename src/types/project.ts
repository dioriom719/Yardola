import type { BudgetRange, PhotoType, PropertyType } from "@/types/enums";

export interface ProjectPhoto {
  id: string;
  url: string;
  altText: string | null;
  caption: string | null;
  photoType: PhotoType;
  sortOrder: number;
}

/** Shape used by ProjectCard / grids -- kept lean, no full detail fields. */
export interface ProjectCardData {
  id: string;
  slug: string;
  title: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  cityName: string;
  citySlug: string;
  categoryName: string | null;
  categorySlug: string | null;
  styleName: string | null;
  budgetRange: BudgetRange | null;
  businessName: string;
  businessSlug: string;
}

export interface ProjectDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cityName: string;
  citySlug: string;
  neighborhoodName: string | null;
  projectYear: number | null;
  budgetRange: BudgetRange | null;
  propertyType: PropertyType | null;
  isFeatured: boolean;
  photos: ProjectPhoto[];
  categories: { name: string; slug: string }[];
  styles: { name: string; slug: string }[];
  features: { name: string; slug: string }[];
  business: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    verificationStatus: string;
    city: string | null;
    state: string | null;
  };
}
