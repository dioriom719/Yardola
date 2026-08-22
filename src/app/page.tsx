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
import { listSavedProjectIds } from "@/lib/data/saved-projects";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { generateHomeMetadata } from "@/lib/seo/metadata";

export const metadata = generateHomeMetadata();

/**
 * Homepage visual journey (Phase 1.6): Dream (Hero, big image) -> Explore
 * (CategoryExplorer, visual grid) -> Get inspired (InspirationGallery,
 * big image moment) -> Plan (BuilderSection, interactive) -> See the
 * finished result (RealProjects, project gallery) -> Find the right
 * professional (ProfessionalsSection) -> Start (FinalCta, big image).
 * Guides dropped from the homepage entirely this phase (still reachable
 * from nav/footer at /guides) -- "fewer things, bigger things" meant
 * cutting a section, not just shrinking one.
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
  const savedProjectIds = await listSavedProjectIds(
    featuredProjects.map((project) => project.id)
  );

  return (
    <>
      <Hero />
      <CategoryExplorer categories={categories} />
      <InspirationGallery />
      <BuilderSection
        categories={categories}
        cities={cities}
        zipCodes={zipCodes}
      />
      <RealProjects
        projects={featuredProjects}
        savedProjectIds={savedProjectIds}
      />
      <ProfessionalsSection businesses={featuredBusinesses} />
      <FinalCta />
    </>
  );
}
