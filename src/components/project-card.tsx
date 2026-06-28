import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Project } from "@/data/projects";
import { complexityLabel } from "@/data/taxonomy";

export function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl tracking-tight">{project.name}</h3>
        <ArrowRight
          className="mt-1 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {project.tagline[locale]}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent">
          {complexityLabel[project.complexity][locale]}
        </span>
        {project.tags.slice(0, 3).map((t) => (
          <span key={t} className="font-mono text-[0.7rem] text-faint">
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
