import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/data/businesses";
import { listProjects } from "@/lib/data/projects";
import { getCategoryBySlug } from "@/lib/data/categories";
import { listRelatedGuides } from "@/lib/data/guides";
import { generateBusinessMetadata } from "@/lib/seo/metadata";
import { getBusinessIndexability } from "@/lib/seo/indexability";
import { ProfessionalProfileView } from "./_components/professional-profile-view";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/professionals/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);
  if (!business)
    return { title: "YARDOLO", robots: { index: false, follow: true } };
  return generateBusinessMetadata(
    business,
    getBusinessIndexability(business).index
  );
}

export default async function ProfessionalPage(
  props: PageProps<"/professionals/[slug]">
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const relevantCategorySlugs = [
    ...new Set(business.services.map((s) => s.categorySlug).filter(Boolean)),
  ];

  const primaryCategory =
    relevantCategorySlugs.length > 0
      ? await getCategoryBySlug(relevantCategorySlugs[0])
      : null;

  const [guides, moreProjectsResult] = await Promise.all([
    primaryCategory
      ? listRelatedGuides("", { categoryId: primaryCategory.id, limit: 3 })
      : Promise.resolve([]),
    primaryCategory
      ? listProjects({ categorySlug: primaryCategory.slug }, 1, 9)
      : Promise.resolve(null),
  ]);

  return (
    <ProfessionalProfileView
      business={business}
      primaryCategory={primaryCategory}
      moreProjectCandidates={moreProjectsResult?.items ?? []}
      guides={guides}
    />
  );
}
