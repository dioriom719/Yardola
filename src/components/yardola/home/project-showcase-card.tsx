import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectCardData } from "@/types/project";

/**
 * Homepage-specific project card -- Phase 1.7 replaces the shared
 * ProjectCard (budget badge, save button, business byline, style +
 * city on one line) with a simpler treatment for this one section: a
 * large photo, the project name, location, category, and a "View
 * Project" link. Deliberately homepage-only -- ProjectCard itself, and
 * every other page that uses it, is untouched.
 */
export function ProjectShowcaseCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
        {project.heroImageUrl && (
          <Image
            src={project.heroImageUrl}
            alt={project.heroImageAlt ?? project.title}
            fill
            sizes="(min-width: 640px) 30vw, 90vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-foreground text-xl">
          {project.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {project.cityName}
          {project.categoryName ? ` · ${project.categoryName}` : ""}
          {project.styleName ? ` · ${project.styleName}` : ""}
        </p>
        <span className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium">
          View Project
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
