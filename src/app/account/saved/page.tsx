import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { Pagination } from "@/components/yardola/pagination";
import { SavedProjectsSelector } from "./saved-projects-selector";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  listSavedProjects,
  SAVED_PROJECTS_PAGE_SIZE,
} from "@/lib/data/saved-projects";
import { paramInt } from "@/lib/search-params";

export const metadata = buildMetadata({
  title: "Saved Projects | Yardola",
  description: "Backyard projects you've saved for inspiration.",
  path: "/account/saved",
  index: false,
});

export default async function SavedProjectsPage(
  props: PageProps<"/account/saved">
) {
  const searchParams = await props.searchParams;
  const page = paramInt(searchParams, "page", 1);
  const result = await listSavedProjects(page, SAVED_PROJECTS_PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "My Yardola", href: "/account" },
          { label: "Saved Projects" },
        ]}
      />

      <div className="mt-4">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          Saved Projects
        </h1>
        <p className="text-muted-foreground mt-2">
          {result.total} project{result.total === 1 ? "" : "s"} saved for
          inspiration.
        </p>
      </div>

      {result.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="No saved projects yet"
            description="Start exploring backyard projects and save the ideas you love."
            action={
              <Button nativeButton={false} render={<Link href="/projects" />}>
                Explore Projects
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <SavedProjectsSelector entries={result.items} />
          </div>

          <div className="mt-10">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              buildHref={(p) =>
                p > 1 ? `/account/saved?page=${p}` : "/account/saved"
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
