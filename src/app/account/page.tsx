import Link from "next/link";
import { Bookmark, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCurrentProfile } from "@/lib/data/profile";
import { countSavedProjects } from "@/lib/data/saved-projects";
import { countPlans } from "@/lib/data/plans";

export const metadata = buildMetadata({
  title: "My Yardola | Yardola",
  description: "Your saved inspiration and project plans.",
  path: "/account",
  index: false,
});

export default async function AccountDashboardPage() {
  const [profile, savedCount, planCount] = await Promise.all([
    getCurrentProfile(),
    countSavedProjects(),
    countPlans(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-primary text-xs font-medium tracking-wide uppercase">
          My Yardola
        </p>
        <h1 className="font-display text-foreground mt-1 text-3xl sm:text-4xl">
          {profile?.firstName
            ? `Welcome back, ${profile.firstName}`
            : "Welcome back"}
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/account/saved"
          className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring rounded-lg border p-6 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Bookmark className="text-primary size-5" aria-hidden="true" />
          <p className="font-display text-foreground mt-3 text-3xl">
            {savedCount}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Saved {savedCount === 1 ? "Project" : "Projects"}
          </p>
        </Link>

        <Link
          href="/account/plans"
          className="border-border bg-card hover:border-primary/40 focus-visible:ring-ring rounded-lg border p-6 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ClipboardList className="text-primary size-5" aria-hidden="true" />
          <p className="font-display text-foreground mt-3 text-3xl">
            {planCount}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Project {planCount === 1 ? "Plan" : "Plans"}
          </p>
        </Link>
      </div>

      <div className="border-border bg-secondary/40 mt-6 rounded-lg border p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles
              className="text-primary mt-0.5 size-6 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-foreground text-xl">
                Start a new project
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Shape an idea into a plan -- category, location, style, and
                budget, step by step.
              </p>
            </div>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/plan" />}
            className="w-full shrink-0 sm:w-auto"
          >
            Start a Project
          </Button>
        </div>
      </div>
    </div>
  );
}
