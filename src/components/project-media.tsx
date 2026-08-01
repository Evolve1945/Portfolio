"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/data/projects";

// Visual gallery for a project. Images open in a full-screen lightbox (click/tap,
// with prev/next arrows, keyboard ←/→/Esc, and swipe on touch) so screenshots can
// be viewed at full resolution. Videos play inline with native controls.
export function ProjectMedia({
  media,
  locale,
}: {
  media: NonNullable<Project["media"]>;
  locale: Locale;
}) {
  const images = media.filter((m) => m.type === "image");
  const [open, setOpen] = useState<number | null>(null); // index into `images`
  // Cap the on-screen size so a screenshot is never scaled ABOVE its real pixel
  // resolution for this display's density — upscaling is what makes it look blurry.
  const [cap, setCap] = useState<React.CSSProperties | undefined>(undefined);
  // Click-to-zoom: when on, show the image at its full natural width (scroll/pan
  // to inspect detail) instead of the crisp-fit cap.
  const [zoomed, setZoomed] = useState(false);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);

  const close = useCallback(() => setOpen(null), []);
  // Recompute the crisp cap and reset zoom for each newly-shown image.
  useEffect(() => {
    setCap(undefined);
    setZoomed(false);
  }, [open]);
  const go = useCallback(
    (dir: number) =>
      setOpen((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  );

  // Keyboard control + body-scroll lock while the lightbox is open.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  // Swipe left/right on touch devices.
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    // Only track single-finger swipes, so a two-finger pinch-zoom isn't
    // mistaken for a navigation gesture.
    touchX.current = e.touches.length === 1 ? e.touches[0].clientX : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || e.touches.length > 0) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const zoomLabel = locale === "fr" ? "Agrandir" : "Enlarge";
  const zoomInHint =
    locale === "fr" ? "Cliquez sur l'image pour agrandir" : "Click image to zoom";
  const zoomFitHint = locale === "fr" ? "Cliquez pour ajuster" : "Click to fit";

  return (
    <>
      <div className={`grid gap-4 ${media.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {media.map((m, i) => {
          if (m.type === "video") {
            return (
              <figure
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <video
                  src={m.src}
                  poster={m.poster}
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-surface-2 object-cover"
                />
                <figcaption className="px-4 py-2 text-xs text-faint">
                  {m.alt[locale]}
                </figcaption>
              </figure>
            );
          }
          const imgIndex = images.indexOf(m);
          return (
            <figure
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => setOpen(imgIndex)}
                aria-label={`${zoomLabel} — ${m.alt[locale]}`}
                className="group relative block w-full cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.alt[locale]}
                  loading="lazy"
                  className="w-full transition-opacity group-hover:opacity-90"
                />
                <span className="pointer-events-none absolute right-2 top-2 rounded-md bg-background/70 px-2 py-1 text-[0.65rem] text-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  {zoomLabel}
                </span>
              </button>
              <figcaption className="px-4 py-2 text-xs text-faint">
                {m.alt[locale]}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[open].alt[locale]}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-[70] flex flex-col bg-background/95 backdrop-blur"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-mono text-xs text-faint">
              {open + 1} / {images.length}
            </span>
            <span className="hidden font-mono text-[0.7rem] text-faint sm:inline">
              {zoomed ? zoomFitHint : zoomInHint}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={locale === "fr" ? "Fermer" : "Close"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="relative flex flex-1 overflow-hidden px-3 pb-3">
            {images.length > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label={locale === "fr" ? "Image précédente" : "Previous image"}
                className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground backdrop-blur transition-colors hover:border-accent hover:text-accent sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
            ) : null}

            <div
              onClick={(e) => e.stopPropagation()}
              className={
                zoomed
                  ? "h-full w-full overflow-auto"
                  : "flex h-full w-full items-center justify-center overflow-hidden"
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={images[open].src}
                src={images[open].src}
                alt={images[open].alt[locale]}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const dpr = window.devicePixelRatio || 1;
                  setNat({ w: img.naturalWidth, h: img.naturalHeight });
                  setCap({
                    maxWidth: `min(100%, ${Math.round(img.naturalWidth / dpr)}px)`,
                    maxHeight: `min(100%, ${Math.round(img.naturalHeight / dpr)}px)`,
                  });
                }}
                style={
                  zoomed && nat
                    ? { width: `${nat.w}px`, maxWidth: "none", maxHeight: "none" }
                    : cap
                }
                className={`rounded-lg shadow-2xl ${
                  zoomed
                    ? "block max-w-none cursor-zoom-out"
                    : "mx-auto max-h-full max-w-full cursor-zoom-in object-contain"
                }`}
              />
            </div>

            {images.length > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label={locale === "fr" ? "Image suivante" : "Next image"}
                className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/80 text-foreground backdrop-blur transition-colors hover:border-accent hover:text-accent sm:right-4"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            ) : null}
          </div>

          <p
            onClick={(e) => e.stopPropagation()}
            className="mx-auto max-w-2xl px-6 pb-6 text-center text-sm text-muted"
          >
            {images[open].alt[locale]}
          </p>
        </div>
      ) : null}
    </>
  );
}
