import { Hero } from "@/components/yardola/home/hero";
import { HowItWorks } from "@/components/yardola/home/how-it-works";
import { BuilderSection } from "@/components/yardola/home/builder-section";
import { CategoryExplorer } from "@/components/yardola/home/category-explorer";
import { InspirationGallery } from "@/components/yardola/home/inspiration-gallery";
import { RealProjects } from "@/components/yardola/home/real-projects";
import { ProfessionalsSection } from "@/components/yardola/home/professionals-section";
import { FinalCta } from "@/components/yardola/home/final-cta";
import { listCategories, getCategoryBySlug } from "@/lib/data/categories";
import { listCities, listZipCodes } from "@/lib/data/locations";
import { listFeaturedProjects } from "@/lib/data/projects";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { generateHomeMetadata } from "@/lib/seo/metadata";
import { paramString } from "@/lib/search-params";

export const metadata = generateHomeMetadata();

/**
 * Homepage visual journey: Dream (Hero, big image, with category chips
 * as a real "tell us what you need" entry point) -> How it works (plain
 * -language mechanism) -> Explore (CategoryExplorer, visual grid) -> Get
 * inspired (InspirationGallery, editorial gallery) -> See the finished
 * result (RealProjects, project gallery) -> Find the right professional
 * (ProfessionalsSection) -> Plan (BuilderSection, interactive) -> Start
 * (FinalCta, big image). Proof (real projects + real professionals)
 * comes before the builder asks a homeowner to commit. Guides is
 * intentionally not on the homepage (still reachable from nav/footer at
 * /guides) -- "fewer things, bigger things."
 *
 * `?category=<slug>#start-project` (from a Hero chip or a category
 * page's closing CTA) pre-selects that category in the builder's first
 * step -- an unknown/invalid slug just resolves to no pre-selection.
 */
export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const categorySlug = paramString(searchParams, "category");

  const [
    categories,
    cities,
    zipCodes,
    featuredProjects,
    featuredBusinesses,
    initialCategory,
  ] = await Promise.all([
    listCategories(),
    listCities(),
    listZipCodes(),
    listFeaturedProjects(3),
    listFeaturedBusinesses(3),
    categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
  ]);

  return (
    <>
      <Hero categories={categories} />
      <HowItWorks />
      <CategoryExplorer categories={categories} />
      <InspirationGallery />
      <RealProjects projects={featuredProjects} />
      <ProfessionalsSection businesses={featuredBusinesses} />
      <BuilderSection
        categories={categories}
        cities={cities}
        zipCodes={zipCodes}
        initialCategoryId={initialCategory?.id}
      />
      <FinalCta />
    </>
  );
}
