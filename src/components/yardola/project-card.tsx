import Image from "next/image";
import Link from "next/link";
import { formatBudgetRange } from "@/lib/format";
import type { ProjectCardData } from "@/types/project";

interface ProjectCardProps {
  project: ProjectCardData;
}

/**
 * The primary project discovery unit. Image-led (roughly 60-65% of the
 * card), with a compact meta block below -- the project, not the
 * business, is the visual focus.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const budgetLabel = formatBudgetRange(project.budgetRange);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        {project.heroImageUrl && (
          <Image
            src={project.heroImageUrl}
            alt={project.heroImageAlt ?? project.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <div className="flex items-center justify-between gap-2">
          {project.categoryName && (
            <span className="text-primary text-xs font-medium tracking-wide uppercase">
              {project.categoryName}
            </span>
          )}
          {budgetLabel && (
            <span className="text-muted-foreground text-xs">{budgetLabel}</span>
          )}
        </div>
        <h3 className="font-display text-foreground line-clamp-1 text-lg">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {project.cityName}
          {project.styleName ? ` · ${project.styleName}` : ""}
        </p>
        {project.businessName && (
          <p className="text-muted-foreground text-xs">
            By {project.businessName}
          </p>
        )}
      </div>
    </Link>
  );
}
