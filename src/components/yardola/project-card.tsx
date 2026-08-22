import Image from "next/image";
import Link from "next/link";
import { formatBudgetRange } from "@/lib/format";
import { SaveProjectButton } from "@/components/yardola/save-project-button";
import type { ProjectCardData } from "@/types/project";

interface ProjectCardProps {
  project: ProjectCardData;
  initialSaved?: boolean;
}

export function ProjectCard({
  project,
  initialSaved = false,
}: ProjectCardProps) {
  const budgetLabel = formatBudgetRange(project.budgetRange);
  const imageSrc = project.heroImageUrl
    ? `/api/image-proxy?url=${encodeURIComponent(project.heroImageUrl)}`
    : null;

  return (
    <div className="group border-border bg-card hover:border-primary/40 relative overflow-hidden rounded-lg border transition-colors">
      <Link
        href={`/projects/${project.slug}`}
        className="focus-visible:ring-ring absolute inset-0 z-10 rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span className="sr-only">{project.title}</span>
      </Link>
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={project.heroImageAlt ?? project.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute top-2 right-2 z-20">
          <SaveProjectButton
            projectId={project.id}
            initialSaved={initialSaved}
          />
        </div>
      </div>
      <div className="pointer-events-none space-y-1.5 p-4">
        <h3 className="font-display text-foreground line-clamp-1 text-lg">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {[project.cityName, project.categoryName, project.styleName]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {(budgetLabel || project.businessName) && (
          <p className="text-muted-foreground text-xs">
            {[
              budgetLabel,
              project.businessName ? `By ${project.businessName}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
