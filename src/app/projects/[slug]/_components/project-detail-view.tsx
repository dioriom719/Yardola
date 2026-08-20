import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProjectGallery } from "@/components/yardola/project-gallery";
import { ProjectGrid } from "@/components/yardola/project-grid";
import {
  formatBudgetRange,
  formatProjectYear,
  formatPropertyType,
} from "@/lib/format";
import { listSimilarProjects } from "@/lib/data/projects";
import { listRelatedGuides } from "@/lib/data/guides";
import { getCategoryBySlug } from "@/lib/data/categories";
import { isProjectSaved } from "@/lib/data/saved-projects";
import { buildProjectJsonLd } from "@/lib/seo/structured-data";
import { SaveProjectButton } from "@/components/yardola/save-project-button";
import type { ProjectDetail } from "@/types/project";

interface ProjectDetailViewProps {
  project: ProjectDetail;
}

export async function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const primaryCategory = project.categories[0] ?? null;

  const [similarProjects, relatedGuides, alreadySaved] = await Promise.all([
    listSimilarProjects(project, 4),
    primaryCategory
      ? getCategoryBySlug(primaryCategory.slug).then((category) =>
          category
            ? listRelatedGuides("", { categoryId: category.id, limit: 2 })
            : []
        )
      : Promise.resolve([]),
    isProjectSaved(project.id),
  ]);

  const details: { label: string; value: string }[] = [
    {
      label: "Location",
      value: project.neighborhoodName
        ? `${project.neighborhoodName}, ${project.cityName}`
        : project.cityName,
    },
    {
      label: "Project Type",
      value: formatPropertyType(project.propertyType) ?? "",
    },
    { label: "Style", value: project.styles.map((s) => s.name).join(", ") },
    { label: "Budget", value: formatBudgetRange(project.budgetRange) ?? "" },
    { label: "Year", value: formatProjectYear(project.projectYear) ?? "" },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd data={buildProjectJsonLd(project)} />
      <SeoBreadcrumbs
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

      <div className="mt-4">
        {primaryCategory && (
          <span className="text-primary text-xs font-medium tracking-wide uppercase">
            {primaryCategory.name}
          </span>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-foreground mt-1 text-3xl sm:text-4xl">
            {project.title}
          </h1>
          <SaveProjectButton
            projectId={project.id}
            initialSaved={alreadySaved}
            variant="full"
            className="mt-1 shrink-0"
          />
        </div>
        <p className="text-muted-foreground mt-2">
          {project.neighborhoodName ? `${project.neighborhoodName}, ` : ""}
          {project.cityName}
        </p>
      </div>

      <div className="mt-8">
        <ProjectGallery photos={project.photos} title={project.title} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {project.description && (
            <section>
              <h2 className="font-display text-foreground text-xl">
                About this project
              </h2>
              <p className="text-muted-foreground mt-3 whitespace-pre-line">
                {project.description}
              </p>
            </section>
          )}

          {project.features.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-foreground text-xl">Features</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.features.map((feature) => (
                  <Badge key={feature.slug} variant="secondary">
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {details.length > 0 && (
            <div className="border-border bg-card rounded-lg border p-5">
              <h2 className="font-display text-foreground text-lg">
                Project Details
              </h2>
              <dl className="mt-4 space-y-3">
                {details.map((detail) => (
                  <div
                    key={detail.label}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <dt className="text-muted-foreground">{detail.label}</dt>
                    <dd className="text-foreground text-right font-medium">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="border-border bg-card rounded-lg border p-5">
            <h2 className="font-display text-foreground text-lg">Built by</h2>
            <Link
              href={`/professionals/${project.business.slug}`}
              className="focus-visible:ring-ring mt-4 flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-full">
                {project.business.logoUrl && (
                  <Image
                    src={project.business.logoUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-foreground truncate font-medium">
                    {project.business.name}
                  </p>
                  {project.business.verificationStatus === "verified" && (
                    <BadgeCheck
                      className="text-primary size-4 shrink-0"
                      aria-label="Verified"
                    />
                  )}
                </div>
                {project.business.city && (
                  <p className="text-muted-foreground text-sm">
                    {project.business.city}, {project.business.state}
                  </p>
                )}
              </div>
            </Link>
            <Button
              className="mt-4 w-full"
              nativeButton={false}
              render={<Link href={`/professionals/${project.business.slug}`} />}
            >
              View Profile
            </Button>
          </div>

          <div className="border-border bg-secondary/40 rounded-lg border p-5">
            <h2 className="font-display text-foreground text-lg">
              Inspired by this project?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Start planning a similar backyard project of your own.
            </p>
            <Button
              className="mt-4 w-full"
              nativeButton={false}
              render={
                <Link
                  href={`/plan/start?${new URLSearchParams({
                    ...(primaryCategory
                      ? { category: primaryCategory.slug }
                      : {}),
                    ...(project.styles[0]
                      ? { style: project.styles[0].slug }
                      : {}),
                  }).toString()}`}
                />
              }
            >
              Plan a Similar Project
            </Button>
          </div>
        </div>
      </div>

      {similarProjects.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-foreground text-2xl">
              Similar projects
            </h2>
            {primaryCategory && (
              <Link
                href={`/projects/${primaryCategory.slug}/${project.citySlug}`}
                className="text-primary text-sm font-medium hover:underline"
              >
                More {primaryCategory.name.toLowerCase()} projects in{" "}
                {project.cityName}
              </Link>
            )}
          </div>
          <div className="mt-6">
            <ProjectGrid projects={similarProjects} />
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Guides you might like
          </h2>
          <ul className="mt-6 space-y-3">
            {relatedGuides.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-foreground hover:text-primary focus-visible:ring-ring underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
