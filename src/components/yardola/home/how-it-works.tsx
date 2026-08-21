import { Compass, Sparkles, Users } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Compass,
    title: "Tell us what you're dreaming about",
    description:
      "Share your project, your location, and your budget -- no account needed.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Discover professionals who fit",
    description:
      "We match your project with local professionals suited to the work.",
  },
  {
    number: "03",
    icon: Users,
    title: "Bring your backyard to life",
    description: "Connect directly and turn your plan into a real project.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase">
            How it works
          </p>
          <h2 className="font-display text-foreground mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Three steps to your next project.
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number}>
              <div className="border-border text-primary flex size-12 items-center justify-center rounded-full border">
                <step.icon className="size-5" aria-hidden="true" />
              </div>
              <span className="font-display text-muted-foreground/60 mt-6 block text-sm">
                {step.number}
              </span>
              <h3 className="font-display text-foreground mt-2 text-xl">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
