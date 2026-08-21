import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/images/category-imagery";

/**
 * Full-bleed, magazine-style opening section. Deliberately not a
 * two-column "text left, image right" layout (that's the pattern this
 * replaces) -- the photo carries the emotional weight, with the headline
 * set directly over it.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] items-end overflow-hidden sm:min-h-[92svh]">
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
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <p className="animate-in fade-in slide-in-from-bottom-2 text-sm font-medium tracking-[0.2em] text-white/80 uppercase duration-700">
          Las Vegas, Nevada
        </p>
        <h1 className="animate-in fade-in slide-in-from-bottom-3 font-display mt-4 max-w-3xl text-5xl leading-[1.05] font-semibold text-balance text-white duration-700 sm:text-6xl lg:text-7xl">
          Your backyard.
          <br />
          Reimagined.
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-3 mt-6 max-w-lg text-lg text-white/85 duration-700 sm:text-xl">
          Discover inspiring outdoor spaces and the professionals who can bring
          your vision to life.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-3 mt-9 flex flex-col gap-3 duration-700 sm:flex-row">
          <Button
            size="lg"
            className="h-12 px-7 text-base"
            nativeButton={false}
            render={<Link href="#start-project" />}
          >
            Start Your Project
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-white/30 bg-white/5 px-7 text-base text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Explore Inspiration
          </Button>
        </div>
        <p className="mt-6 text-sm text-white/70">
          Free for homeowners. No account required to get started.
        </p>
      </div>
    </section>
  );
}
