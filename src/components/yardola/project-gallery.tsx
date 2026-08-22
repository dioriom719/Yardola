"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/yardola/lightbox";
import type { ProjectPhoto } from "@/types/project";

interface ProjectGalleryProps {
  photos: ProjectPhoto[];
  title: string;
}

/**
 * A large hero photo followed by up to two supporting photos at real
 * editorial scale (not a small contact-sheet strip) -- an editorial
 * feature reads as a small, confident set of large images, not a hero
 * plus a gallery widget. Any photos beyond those two fall back to a
 * compact thumbnail row so the layout still holds for a project with a
 * larger photo set later. Clicking any image opens the full lightbox at
 * that photo. Single-use (only project-detail-view.tsx renders this), so
 * its own scale/spacing can be tuned for that page without any
 * cross-page blast radius.
 */
export function ProjectGallery({ photos, title }: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const [hero, ...rest] = photos;
  const featured = rest.slice(0, 2);
  const extra = rest.slice(2);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenIndex(0)}
        className="bg-muted focus-visible:ring-ring relative block aspect-[16/9] w-full overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src={hero.url}
          alt={hero.altText ?? title}
          fill
          sizes="(min-width: 1024px) 1152px, 100vw"
          className="object-cover"
          priority
        />
      </button>

      {featured.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {featured.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(i + 1)}
              className="bg-muted focus-visible:ring-ring relative aspect-[4/3] overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={photo.url}
                alt={photo.altText ?? ""}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {extra.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {extra.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(i + 3)}
              className="bg-muted focus-visible:ring-ring relative aspect-square overflow-hidden rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={photo.url}
                alt={photo.altText ?? ""}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        photos={photos}
        index={openIndex}
        onIndexChange={setOpenIndex}
        title={title}
      />
    </div>
  );
}
