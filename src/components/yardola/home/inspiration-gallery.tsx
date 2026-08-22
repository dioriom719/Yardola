import Image from "next/image";
import { INSPIRATION_IMAGES } from "@/lib/images/category-imagery";

/**
 * "Get Inspired" -- curated editorial photography only, deliberately
 * kept separate from real Yardolo project data (see RealProjects, which
 * follows this section).
 *
 * Phase 1.7: moved off a dark section background -- against an
 * otherwise all-white homepage it read as a jarring "different website"
 * moment rather than a rhythm change. Contrast now comes from scale and
 * composition instead: one large hero image up top, two supporting
 * images below it, with captions set in restrained type beneath each
 * photo rather than as a white-text-over-gradient overlay -- one less
 * layer of UI decoration, and it reads more like a magazine spread.
 */
export function InspirationGallery() {
  const [featured, ...supporting] = INSPIRATION_IMAGES;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <h2 className="font-display text-foreground text-3xl sm:text-4xl lg:text-5xl">
        Explore what&apos;s possible.
      </h2>

      <figure className="mt-8">
        <div className="bg-muted relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={featured.src}
            alt={featured.alt}
            fill
            sizes="(min-width: 1024px) 72vw, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="font-display text-foreground mt-4 text-xl sm:text-2xl">
          {featured.label}
        </figcaption>
      </figure>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {supporting.map((image) => (
          <figure key={image.src}>
            <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 36vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="font-display text-foreground mt-3 text-lg">
              {image.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
