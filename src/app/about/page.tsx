import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SeoBreadcrumbs } from "@/components/seo/seo-breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About YARDOLO | YARDOLO",
  description:
    "YARDOLO connects Las Vegas homeowners with qualified backyard professionals -- real projects, real matching, nothing fabricated.",
  path: "/about",
  index: true,
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoBreadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <div className="mt-4">
        <h1 className="font-display text-foreground text-3xl sm:text-4xl">
          About YARDOLO
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Discover what you want. Plan what you want. Find someone who can build
          it. YARDOLO is a backyard project marketplace serving Las Vegas,
          Nevada -- built to connect homeowners with qualified professionals for
          real outdoor projects.
        </p>
      </div>

      <section className="border-border mt-12 border-t pt-10">
        <h2 className="font-display text-foreground text-2xl">How it works</h2>
        <ol className="mt-6 space-y-6">
          <li>
            <p className="text-foreground font-medium">
              1. Tell us what you&apos;re building
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Pick a project type, your location, budget, and timeline. No
              account required to start.
            </p>
          </li>
          <li>
            <p className="text-foreground font-medium">
              2. We match you with qualified pros
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              We look at your project against real, verified professionals in
              your area -- not a directory search.
            </p>
          </li>
          <li>
            <p className="text-foreground font-medium">
              3. Review your matches, connect when ready
            </p>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              See real portfolios for each match. Nothing is shared until you
              choose to connect.
            </p>
          </li>
        </ol>
      </section>

      <section className="border-border mt-12 border-t pt-10">
        <h2 className="font-display text-foreground text-2xl">
          Real, not fabricated
        </h2>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Every project and professional you see on YARDOLO is real. We
          don&apos;t invent reviews, ratings, credentials, or project outcomes
          -- if we don&apos;t have real data for something, we leave it out
          rather than fake it.
        </p>
      </section>

      <div className="border-border mt-12 border-t pt-10 text-center">
        <Button nativeButton={false} render={<Link href="/#start-project" />}>
          Start Your Project
        </Button>
      </div>
    </div>
  );
}
