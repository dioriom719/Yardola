"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ProjectPhoto } from "@/types/project";

interface LightboxProps {
  photos: ProjectPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  title: string;
}

/**
 * Minimal full-screen image lightbox built on the existing Dialog
 * primitive -- no extra gallery dependency for what's just a large image
 * with prev/next controls.
 */
export function Lightbox({
  photos,
  index,
  onIndexChange,
  title,
}: LightboxProps) {
  const open = index !== null;
  const current = index !== null ? photos[index] : null;

  const goTo = useCallback(
    (nextIndex: number) => {
      onIndexChange((nextIndex + photos.length) % photos.length);
    },
    [onIndexChange, photos.length]
  );

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") goTo((index ?? 0) - 1);
      if (event.key === "ArrowRight") goTo((index ?? 0) + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, index, goTo]);

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <DialogPrimitive.Popup
          data-slot="lightbox-content"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-8"
        >
          <DialogTitle className="sr-only">
            {title} -- photo {(index ?? 0) + 1} of {photos.length}
          </DialogTitle>

          <DialogPrimitive.Close
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            aria-label="Close gallery"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>

          <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
            <Image
              src={current.url}
              alt={current.altText ?? title}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {current.caption && (
            <p className="mt-3 max-w-2xl text-center text-sm text-white/80">
              {current.caption}
            </p>
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo((index ?? 0) - 1)}
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-4"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={() => goTo((index ?? 0) + 1)}
                aria-label="Next photo"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-4"
              >
                <ChevronRight className="size-6" />
              </button>
              <p className="mt-2 text-xs text-white/60">
                {(index ?? 0) + 1} / {photos.length}
              </p>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
