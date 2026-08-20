import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@/types";

interface ProjectCardProps {
  project: ProjectSummary;
}

/**
 * Presentational card for a single project. Phase 1 structure only --
 * not yet wired to real project data or a project detail route.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="bg-muted relative aspect-4/3 overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-primary text-xs font-medium tracking-wide uppercase">
          {project.category}
        </p>
        <h3 className="font-display text-foreground mt-1 text-lg">
          {project.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">{project.location}</p>
      </div>
    </Link>
  );
}
