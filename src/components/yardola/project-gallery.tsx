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
 * Large hero photo with supporting thumbnails below -- the same stacked
 * layout works for both desktop and mobile. Clicking any image opens the
 * full lightbox at that photo.
 */
export function ProjectGallery({ photos, title }: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const [hero, ...rest] = photos;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenIndex(0)}
        className="bg-muted focus-visible:ring-ring relative block aspect-[16/10] w-full overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Image
          src={hero.url}
          alt={hero.altText ?? title}
          fill
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
          priority
        />
      </button>

      {rest.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {rest.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(i + 1)}
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
