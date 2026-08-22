import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectGallery } from "@/components/yardola/project-gallery";
import { ProjectShowcaseCard } from "@/components/yardola/home/project-showcase-card";
import { ProfessionalShowcaseCard } from "@/components/yardola/home/professional-showcase-card";
import {
  formatBudgetRange,
  formatProjectYear,
  formatPropertyType,
} from "@/lib/format";
import { listSimilarProjects } from "@/lib/data/projects";
import { listRelatedGuides } from "@/lib/data/guides";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getBusinessBySlug } from "@/lib/data/businesses";
import { isProjectSaved } from "@/lib/data/saved-projects";
import { buildProjectJsonLd } from "@/lib/seo/structured-data";
import { SaveProjectButton } from "@/components/yardola/save-project-button";
import type { ProjectDetail } from "@/types/project";
import type { BusinessDetail, BusinessCardData } from "@/types/business";

interface ProjectDetailViewProps {
  project: ProjectDetail;
}

/**
 * Reshapes the already-fetched full BusinessDetail (from getBusinessBySlug,
 * reused rather than a new query) into the leaner BusinessCardData shape
 * ProfessionalShowcaseCard expects. Page-local and unexported -- if a
 * future phase needs this elsewhere, it can move then.
 */
function toBusinessCardData(business: BusinessDetail): BusinessCardData {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    logoUrl: business.logoUrl,
    verificationStatus: business.verificationStatus,
    city: business.city,
    state: business.state,
    categoryNames: [
      ...new Set(business.services.map((s) => s.categoryName).filter(Boolean)),
    ],
    projectCount: business.projects.length,
    previewPhotoUrls: business.projects
      .map((p) => p.heroImageUrl)
      .filter((url): url is string => Boolean(url))
      .slice(0, 3),
  };
}

export async function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const primaryCategory = project.categories[0] ?? null;

  const [similarProjects, relatedGuides, alreadySaved, businessDetail] =
    await Promise.all([
      listSimilarProjects(project, 3),
      primaryCategory
        ? getCategoryBySlug(primaryCategory.slug).then((category) =>
            category
              ? listRelatedGuides("", { categoryId: category.id, limit: 2 })
              : []
          )
        : Promise.resolve([]),
      isProjectSaved(project.id),
      getBusinessBySlug(project.business.slug),
    ]);

  const startProjectHref = `/plan/start?${new URLSearchParams({
    ...(primaryCategory ? { category: primaryCategory.slug } : {}),
    ...(project.styles[0] ? { style: project.styles[0].slug } : {}),
  }).toString()}`;

  // Real data only, and only what's actually set -- never a fabricated
  // budget, year, or property type filling an empty field.
  //
  // Split into two lines that do two different jobs, rather than one
  // five-token line that gates the story: a short "dateline" (location +
  // category) that orients the reader in one breath right under the
  // title, and a quieter facts line (property type, budget, completed
  // year) that closes the story out afterward instead of opening on it.
  const location = project.neighborhoodName
    ? `${project.neighborhoodName}, ${project.cityName}`
    : project.cityName;
  const dateline = [location, primaryCategory?.name ?? null]
    .filter((v): v is string => Boolean(v))
    .join(" · ");

  const projectYear = formatProjectYear(project.projectYear);
  const factsLine = [
    formatPropertyType(project.propertyType),
    project.styles.length > 0
      ? `${project.styles.map((s) => s.name).join(", ")} style`
      : null,
    formatBudgetRange(project.budgetRange),
    projectYear ? `Completed ${projectYear}` : null,
  ].filter((v): v is string => Boolean(v));

  return (
    <div className="pb-16">
      <JsonLd data={buildProjectJsonLd(project)} />

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <SeoBreadcrumbs
          className="opacity-70"
          items={[
            { label: "Home", href: "/" },
            { label: "Projects", href: "/projects" },
            ...(primaryCategory
              ? [
                  {
                    label: primaryCategory.name,
                    href: `/projects/${primaryCategory.slug}`,
                  },
                ]
              : []),
            ...(primaryCategory
              ? [
                  {
                    label: project.cityName,
                    href: `/projects/${primaryCategory.slug}/${project.citySlug}`,
                  },
                ]
              : [
                  {
                    label: project.cityName,
                    href: `/locations/${project.citySlug}`,
                  },
                ]),
            { label: project.title },
          ]}
        />
      </div>

      {/* Hero / project photography -- the widest band on the page, the
          first thing a visitor sees, deliberately given more room than
          the text content below it. */}
      <div className="mx-auto mt-3 max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProjectGallery photos={project.photos} title={project.title} />
      </div>

      {/* Identity + story + "Built by" all share the same narrower
          reading column so the page reads as one continuous editorial
          piece. Sequenced as desire (title) -> brief context (dateline)
          -> story, with the fuller practical facts held back until after
          the story instead of gating it. */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-display text-foreground text-4xl sm:text-5xl">
              {project.title}
            </h1>
            <SaveProjectButton
              projectId={project.id}
              initialSaved={alreadySaved}
              variant="full"
              className="mt-1 shrink-0"
            />
          </div>

          {dateline && (
            <p className="text-muted-foreground mt-2 text-sm">{dateline}</p>
          )}

          {project.description && (
            <p className="font-display text-foreground mt-7 text-xl leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          )}

          {project.features.length > 0 && (
            <div className="mt-8">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Features
              </p>
              <p className="text-foreground mt-2 text-sm">
                {project.features.map((f) => f.name).join(", ")}
              </p>
            </div>
          )}

          {factsLine.length > 0 && (
            <p className="text-muted-foreground mt-8 text-xs">
              {factsLine.join(" · ")}
            </p>
          )}
        </div>

        {businessDetail && (
          <section className="border-border mt-16 border-t pt-12">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Built by
            </p>
            <div className="mt-5 max-w-xs sm:max-w-sm md:max-w-md">
              <ProfessionalShowcaseCard
                business={toBusinessCardData(businessDetail)}
              />
            </div>
          </section>
        )}

        {similarProjects.length > 0 && (
          <section className="border-border mt-16 border-t pt-12">
            <h2 className="font-display text-foreground text-2xl sm:text-3xl">
              More backyards like this
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {similarProjects.map((similar) => (
                <ProjectShowcaseCard key={similar.id} project={similar} />
              ))}
            </div>
          </section>
        )}

        <section className="border-border mt-16 border-t py-16 text-center">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl">
            Want a backyard like this?
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
            Tell us about your project and we&apos;ll connect you with
            professionals who can bring your vision to life.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 px-8 text-base"
            nativeButton={false}
            render={<Link href={startProjectHref} />}
          >
            Start a Project Like This
          </Button>
        </section>

        {relatedGuides.length > 0 && (
          <section className="border-border border-t pt-12">
            <h2 className="font-display text-foreground text-lg">
              Guides you might like
            </h2>
            <ul className="mt-4 space-y-2">
              {relatedGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="text-foreground hover:text-primary focus-visible:ring-ring text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
