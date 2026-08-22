import { Hero } from "@/components/yardola/home/hero";
import { BuilderSection } from "@/components/yardola/home/builder-section";
import { CategoryExplorer } from "@/components/yardola/home/category-explorer";
import { InspirationGallery } from "@/components/yardola/home/inspiration-gallery";
import { RealProjects } from "@/components/yardola/home/real-projects";
import { ProfessionalsSection } from "@/components/yardola/home/professionals-section";
import { FinalCta } from "@/components/yardola/home/final-cta";
import { listCategories } from "@/lib/data/categories";
import { listCities, listZipCodes } from "@/lib/data/locations";
import { listFeaturedProjects } from "@/lib/data/projects";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { generateHomeMetadata } from "@/lib/seo/metadata";

export const metadata = generateHomeMetadata();

/**
 * Homepage visual journey: Dream (Hero, big image) -> Explore
 * (CategoryExplorer, visual grid) -> Get inspired (InspirationGallery,
 * editorial gallery) -> See the finished result (RealProjects, project
 * gallery) -> Find the right professional (ProfessionalsSection) -> Plan
 * (BuilderSection, interactive) -> Start (FinalCta, big image). Proof
 * (real projects + real professionals) comes before the builder asks a
 * homeowner to commit. Guides is intentionally not on the homepage
 * (still reachable from nav/footer at /guides) -- "fewer things, bigger
 * things."
 */
export default async function Home() {
  const [categories, cities, zipCodes, featuredProjects, featuredBusinesses] =
    await Promise.all([
      listCategories(),
      listCities(),
      listZipCodes(),
      listFeaturedProjects(3),
      listFeaturedBusinesses(3),
    ]);

  return (
    <>
      <Hero />
      <CategoryExplorer categories={categories} />
      <InspirationGallery />
      <RealProjects projects={featuredProjects} />
      <ProfessionalsSection businesses={featuredBusinesses} />
      <BuilderSection
        categories={categories}
        cities={cities}
        zipCodes={zipCodes}
      />
      <FinalCta />
    </>
  );
}
