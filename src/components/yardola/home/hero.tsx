import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/images/category-imagery";

/**
 * Full-bleed, magazine-cover opening statement. Phase 1.6: the photo
 * itself now does the work a heavy overlay used to compensate for -- a
 * complete, naturally lit backyard scene with real negative sky in the
 * upper third gives the headline somewhere to sit without darkening the
 * parts of the image people actually came to see. Copy trimmed to just
 * the headline and two CTAs -- nothing explains what's already visible.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[85svh] items-end overflow-hidden sm:min-h-[92svh]">
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <h1 className="animate-in fade-in slide-in-from-bottom-3 font-display max-w-2xl text-5xl leading-[1.05] font-semibold text-balance text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.5)] duration-700 sm:text-6xl lg:text-7xl">
          Your backyard.
          <br />
          Reimagined.
        </h1>
        <div className="animate-in fade-in slide-in-from-bottom-3 mt-8 flex flex-col gap-3 duration-700 sm:flex-row">
          <Button
            size="lg"
            className="h-12 px-7 text-base shadow-lg"
            nativeButton={false}
            render={<Link href="#start-project" />}
          >
            Start Your Project
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-white/60 bg-white/10 px-7 text-base text-white shadow-lg backdrop-blur-sm hover:bg-white/25 hover:text-white"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Explore Projects
          </Button>
        </div>
      </div>
    </section>
  );
}
