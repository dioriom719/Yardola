import type { ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "@/components/yardola/project-card";
import type { ProjectCardData } from "@/types/project";

interface ProjectGridProps {
  projects: ProjectCardData[];
  emptyState?: ReactNode;
  /** Which of these projects the current homeowner has already saved. */
  savedProjectIds?: Set<string>;
}

export function ProjectGrid({
  projects,
  emptyState,
  savedProjectIds,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          icon={ImageOff}
          title="No projects found"
          description="Try a different category, location, or budget."
        />
      )
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          initialSaved={savedProjectIds?.has(project.id) ?? false}
        />
      ))}
    </div>
  );
}
