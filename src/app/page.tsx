import Link from "next/link";
import { Compass, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryCard } from "@/components/yardola/category-card";
import { ProjectCard } from "@/components/yardola/project-card";
import { BusinessCard } from "@/components/yardola/business-card";
import {
  listCategories,
  listCategoriesWithSampleImage,
} from "@/lib/data/categories";
import { listFeaturedProjects } from "@/lib/data/projects";
import { listSavedProjectIds } from "@/lib/data/saved-projects";
import { listFeaturedBusinesses } from "@/lib/data/businesses";
import { listGuides } from "@/lib/data/guides";
import { generateHomeMetadata } from "@/lib/seo/metadata";

export const metadata = generateHomeMetadata();

const STEPS = [
  {
    number: "01",
    icon: Compass,
    title: "Explore",
    description: "Find real backyard projects.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Plan",
    description: "Build your project plan.",
  },
  {
    number: "03",
    icon: Users,
    title: "Connect",
    description: "Find professionals who fit.",
  },
] as const;

export default async function Home() {
  const categories = await listCategories();
  const [categoriesWithImage, featuredProjects, featuredBusinesses, guides] =
    await Promise.all([
      listCategoriesWithSampleImage(categories),
      listFeaturedProjects(8),
      listFeaturedBusinesses(4),
      listGuides(3),
    ]);
  const savedProjectIds = await listSavedProjectIds(
    featuredProjects.map((project) => project.id)
  );

  return (
    <>
      {/* Hero */}
      <section className="border-border bg-secondary/40 border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div>
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              Las Vegas, Nevada
            </p>
            <h1 className="font-display text-foreground mt-3 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Your Backyard Starts Here.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-md text-lg">
              Explore real backyard projects, discover local professionals, and
              turn your ideas into a plan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/plan" />}
              >
                Plan My Project
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/projects" />}
              >
                Explore Projects
              </Button>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Free for homeowners. Tell us what you need, and we&apos;ll help
              you find professionals who fit.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="border-border bg-sand/60 aspect-[4/3] rounded-lg border"
          />
        </div>
      </section>

      {/* What are you dreaming up? */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl">
            What are you dreaming up?
          </h2>
          <p className="text-muted-foreground mt-3">
            Start with a category to see real backyard transformations.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categoriesWithImage.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Real projects. Real inspiration. */}
      {featuredProjects.length > 0 && (
        <section className="border-border bg-secondary/20 border-t">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-foreground text-3xl sm:text-4xl">
                  Real projects. Real inspiration.
                </h2>
                <p className="text-muted-foreground mt-3">
                  A closer look at backyards YARDOLO professionals have brought
                  to life.
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/projects" />}
              >
                Browse all projects
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  initialSaved={savedProjectIds.has(project.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How YARDOLO works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl">
            How YARDOLO works
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.number}>
              <CardContent>
                <span className="font-display text-primary text-sm">
                  {step.number}
                </span>
                <h3 className="font-display text-foreground mt-2 text-xl">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Meet the people behind the projects */}
      {featuredBusinesses.length > 0 && (
        <section className="border-border bg-secondary/20 border-t">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="font-display text-foreground text-3xl sm:text-4xl">
                  Meet the people behind the projects.
                </h2>
                <p className="text-muted-foreground mt-3">
                  Las Vegas professionals building the backyards on YARDOLO.
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/professionals" />}
              >
                Browse all professionals
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YARDOLO Guide */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="font-display text-foreground text-3xl sm:text-4xl">
                YARDOLO Guide
              </h2>
              <p className="text-muted-foreground mt-3">
                Ideas and advice for planning a backyard project in Las Vegas.
              </p>
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/guides" />}
            >
              All guides
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {guide.categoryName && (
                  <div className="p-4 pb-0">
                    <span className="text-primary text-xs font-medium tracking-wide uppercase">
                      {guide.categoryName}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display text-foreground text-lg">
                    {guide.title}
                  </h3>
                  {guide.excerpt && (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {guide.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final planner CTA */}
      <section className="border-border bg-primary border-t">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24 lg:px-8">
          <h2 className="font-display text-primary-foreground text-3xl sm:text-4xl">
            Have an idea? Let&apos;s turn it into a plan.
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              nativeButton={false}
              render={<Link href="/plan" />}
            >
              Plan My Project
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
