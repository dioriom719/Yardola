import Image from "next/image";
import { INSPIRATION_IMAGES } from "@/lib/images/category-imagery";

/**
 * "Get Inspired" -- curated editorial photography only, deliberately
 * kept separate from real Yardolo project data (see RealProjects, which
 * follows this section). Phase 1.6 trims this from 5 small tiles to 3
 * large ones -- fewer, bigger, better -- and drops the inline
 * "inspiration, not a real project" disclosure that lived here in
 * Phase 1.5: with the two concepts now split into their own sections
 * with their own headings, the distinction is made by the page
 * structure itself rather than a caveat.
 */
export function InspirationGallery() {
  const [featured, ...supporting] = INSPIRATION_IMAGES;

  return (
    <section className="bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-16 lg:px-8">
        <h2 className="font-display text-3xl text-white sm:text-4xl lg:text-5xl">
          Explore what&apos;s possible.
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="group bg-muted relative aspect-[4/3] overflow-hidden rounded-lg md:row-span-2 md:aspect-auto">
            <Image
              src={featured.src}
              alt={featured.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
            <p className="font-display absolute bottom-5 left-5 text-2xl text-white sm:text-3xl">
              {featured.label}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-rows-2">
            {supporting.map((image) => (
              <div
                key={image.src}
                className="group bg-muted relative aspect-[4/3] overflow-hidden rounded-lg"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 24vw, 90vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                <span className="font-display absolute bottom-4 left-4 text-lg text-white">
                  {image.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
