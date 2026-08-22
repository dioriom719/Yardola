import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FINAL_CTA_IMAGE } from "@/lib/images/category-imagery";

/**
 * The closing visual moment of the homepage -- a full-bleed photograph,
 * not a flat color block. Reuses the Phase 1 hero photo (a moodier dusk
 * shot) so this section has its own distinct mood from the now-bright
 * opening hero, rather than repeating it.
 */
export function FinalCta() {
  return (
    <section className="relative flex min-h-[60svh] items-center overflow-hidden">
      <Image
        src={FINAL_CTA_IMAGE.src}
        alt={FINAL_CTA_IMAGE.alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] sm:text-4xl lg:text-5xl">
          Your dream backyard starts here.
        </h2>
        <p className="mt-5 text-lg text-white/90">
          Tell us what you&apos;re imagining. We&apos;ll help you find the right
          professionals to bring it to life.
        </p>
        <div className="mt-9">
          <Button
            size="lg"
            className="h-12 px-8 text-base shadow-lg"
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
