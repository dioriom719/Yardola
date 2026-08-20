import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { buildMetadata } from "@/lib/seo/metadata";

// Planner pages are explicitly noindex -- there's no useful content here
// yet, just a placeholder for the CTA destination.
export const metadata = buildMetadata({
  title: "Plan My Project | Yardola",
  description: "The Yardola project planner is coming soon.",
  path: "/plan",
  index: false,
});

/**
 * Placeholder destination for every "Plan My Project" CTA across the
 * site. The interactive planner is a later phase -- this just needs to
 * exist so those links don't 404.
 */
export default function PlanPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <EmptyState
        icon={Sparkles}
        title="The Project Planner is coming soon"
        description="Soon you'll be able to shape your backyard project idea step by step -- category, location, budget, and style -- and get matched with the right Las Vegas professionals."
        action={
          <Button nativeButton={false} render={<Link href="/projects" />}>
            Explore Projects for Inspiration
          </Button>
        }
      />
    </div>
  );
}
