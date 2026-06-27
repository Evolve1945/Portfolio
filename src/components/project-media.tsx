import type { Locale } from "@/i18n/routing";
import type { Project } from "@/data/projects";

// Visual gallery for a project — images, GIFs (as images), and videos.
// Plain <img>/<video> so animated GIFs and clips work without extra config.
export function ProjectMedia({
  media,
  locale,
}: {
  media: NonNullable<Project["media"]>;
  locale: Locale;
}) {
  return (
    <div className={`grid gap-4 ${media.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {media.map((m, i) => (
        <figure
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          {m.type === "video" ? (
            <video
              src={m.src}
              poster={m.poster}
              controls
              preload="metadata"
              className="aspect-video w-full bg-surface-2 object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.src}
              alt={m.alt[locale]}
              loading="lazy"
              className="w-full object-cover"
            />
          )}
          <figcaption className="px-4 py-2 text-xs text-faint">
            {m.alt[locale]}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
