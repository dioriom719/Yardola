export interface GuideSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  categoryName: string | null;
  publishedAt: string | null;
}

export interface GuideDetail extends GuideSummary {
  content: string | null;
}
