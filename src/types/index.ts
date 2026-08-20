/**
 * Shared domain types for Yardola.
 *
 * Phase 1 foundation only -- these describe the shape of data that
 * future phases will fetch from Supabase. No database schema exists yet.
 */

export interface ProjectSummary {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
}

export interface BusinessSummary {
  id: string;
  name: string;
  categories: string[];
  location: string;
  logoUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  imageAlt: string;
}

export interface LocationSummary {
  id: string;
  name: string;
  slug: string;
  projectCount?: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}
