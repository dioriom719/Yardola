import Image from "next/image";
import type { GalleryImage } from "@/types";

interface ProjectGalleryProps {
  images: GalleryImage[];
}

/**
 * Responsive image grid for a project's photos. Phase 1 structure
 * only -- no lightbox/zoom interaction yet.
 */
export function ProjectGallery({ images }: ProjectGalleryProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-muted relative aspect-square overflow-hidden rounded-lg"
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
