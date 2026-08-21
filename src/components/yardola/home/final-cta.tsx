import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="bg-evergreen border-border border-t">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <h2 className="font-display text-3xl text-white sm:text-4xl lg:text-5xl">
          Your dream backyard starts here.
        </h2>
        <p className="mt-5 text-lg text-white/75">
          Tell us what you&apos;re imagining. We&apos;ll help you find the right
          professionals to bring it to life.
        </p>
        <div className="mt-9">
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-8 text-base"
            nativeButton={false}
            render={<Link href="#start-project" />}
          >
            Start Your Project
          </Button>
        </div>
      </div>
    </section>
  );
}
