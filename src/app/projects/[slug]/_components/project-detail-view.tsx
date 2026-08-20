import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumbs } from "@/components/yardola/page-breadcrumbs";
import { ProjectGallery } from "@/components/yardola/project-gallery";
import { ProjectGrid } from "@/components/yardola/project-grid";
import {
  formatBudgetRange,
  formatProjectYear,
  formatPropertyType,
} from "@/lib/format";
import { listSimilarProjects } from "@/lib/data/projects";
import type { ProjectDetail } from "@/types/project";

interface ProjectDetailViewProps {
  project: ProjectDetail;
}

export async function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const similarProjects = await listSimilarProjects(project, 4);
  const primaryCategory = project.categories[0] ?? null;

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
      <PageBreadcrumbs
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
          { label: project.title },
        ]}
      />

      <div className="mt-4">
        {primaryCategory && (
          <span className="text-primary text-xs font-medium tracking-wide uppercase">
            {primaryCategory.name}
          </span>
        )}
        <h1 className="font-display text-foreground mt-1 text-3xl sm:text-4xl">
          {project.title}
        </h1>
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
              render={<Link href="/plan" />}
            >
              Plan a Similar Project
            </Button>
          </div>
        </div>
      </div>

      {similarProjects.length > 0 && (
        <section className="border-border mt-16 border-t pt-12">
          <h2 className="font-display text-foreground text-2xl">
            Similar projects
          </h2>
          <div className="mt-6">
            <ProjectGrid projects={similarProjects} />
          </div>
        </section>
      )}
    </div>
  );
}
