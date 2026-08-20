import Link from "next/link";
import { Compass, Ruler, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: Compass,
    title: "Discover",
    description:
      "Browse real backyard transformations -- pools, patios, turf, outdoor kitchens, and more -- for inspiration.",
  },
  {
    icon: Ruler,
    title: "Plan",
    description:
      "Shape your project idea, understand scope, and get a feel for what it takes to bring it to life.",
  },
  {
    icon: Users,
    title: "Build",
    description:
      "Connect with vetted Las Vegas professionals who specialize in the project you have in mind.",
  },
] as const;

export default function Home() {
  return (
    <>
      <section className="border-border bg-secondary/40 border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div>
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              Las Vegas, Nevada
            </p>
            <h1 className="font-display text-foreground mt-3 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Your backyard, reimagined.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-md text-lg">
              Discover what you want. Plan what you want. Find someone who can
              build it. Yardola is where backyard projects begin.
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
                Browse Projects
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="border-border bg-warm-sand/60 aspect-4/3 rounded-lg border"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-foreground text-3xl sm:text-4xl">
            How Yardola works
          </h2>
          <p className="text-muted-foreground mt-3">
            A simple path from inspiration to a finished backyard project.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardContent>
                <step.icon className="text-primary size-6" aria-hidden="true" />
                <h3 className="font-display text-foreground mt-4 text-xl">
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
    </>
  );
}
