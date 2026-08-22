import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/yardola/project-card";
import type { ProjectCardData } from "@/types/project";

interface RealProjectsProps {
  projects: ProjectCardData[];
  savedProjectIds: Set<string>;
}

/**
 * Real Yardolo projects -- actual `projects` rows, actual businesses.
 * Phase 1.6 explicitly separates this from InspirationGallery (curated
 * stock photography) so neither section has to caveat what the other
 * is. Deliberately kept to 3 cards (page.tsx fetches
 * `listFeaturedProjects(3)`, not a larger number) rather than a full
 * gallery -- current seed-data project photos are plain placehold.co
 * color swatches, not real photography, so filling this section out
 * with more of them would just be a bigger version of the same problem.
 * `ProjectCard` itself is untouched; this section grows automatically
 * (raise the fetch limit here and in page.tsx) once real project
 * photography exists.
 */
export function RealProjects({ projects, savedProjectIds }: RealProjectsProps) {
  if (projects.length === 0) return null;

  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl lg:text-5xl">
            See the finished result.
          </h2>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Browse all projects
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              initialSaved={savedProjectIds.has(project.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
