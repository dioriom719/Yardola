import { ClipboardList, Handshake, Search } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell us what you're building",
    description:
      "Pick a project type, your location, budget, and timeline. No account required to start.",
  },
  {
    icon: Search,
    title: "We match you with qualified pros",
    description:
      "We look at your project against real, verified professionals in your area -- not a directory search.",
  },
  {
    icon: Handshake,
    title: "Review your matches, connect when ready",
    description:
      "See real portfolios for each match. Nothing is shared until you choose to connect.",
  },
] as const;

/**
 * Plain-language orientation for what Yardolo actually does, placed
 * right after the Hero -- the site had photography and proof
 * everywhere but never once stated the mechanism in words.
 */
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <h2 className="font-display text-foreground text-center text-3xl sm:text-4xl lg:text-5xl">
        How YARDOLO works
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="text-center sm:text-left">
            <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full sm:mx-0">
              <step.icon className="size-6" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground mt-4 text-xs font-medium tracking-wide uppercase">
              Step {i + 1}
            </p>
            <h3 className="font-display text-foreground mt-1 text-xl">
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
