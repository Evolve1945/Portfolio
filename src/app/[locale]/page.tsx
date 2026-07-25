import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SystemCanvas } from "@/components/systems/system-canvas";
import { SiteBackground } from "@/components/systems/site-background";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { featuredProjects } from "@/data/projects";
import { getGithub } from "@/lib/github";
import { site } from "@/data/site";

type Locale = "fr" | "en";

// Live metrics from the daily GitHub pipeline (src/data/github.json).
const gh = getGithub();
const metrics = [
  {
    label: { fr: "Dépôts", en: "Repositories" },
    value: gh.totals.repos ? String(gh.totals.repos) : "—",
  },
  {
    label: { fr: "Commits", en: "Commits" },
    value: gh.totals.commits ? String(gh.totals.commits) : "—",
  },
  {
    label: { fr: "Langage principal", en: "Primary language" },
    value: gh.totals.topLanguage ?? "—",
  },
];

// Featured projects come from src/data/projects.ts (single source of truth).

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("home");

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <SiteBackground />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
          <div>
            <p className="kicker text-muted">{t("status")}</p>

            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              {t("tagline")}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t("intro")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                {t("ctaProjects")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground/30"
              >
                {t("ctaNotes")}
              </Link>
            </div>
          </div>

          {/* Live system-map banner (canvas) — the "systems accent" identity. */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-3">
              <span className="kicker">System map</span>
            </div>
            <SystemCanvas className="h-56 w-full" />
            <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-faint">
              {site.github} / ecosystem
            </p>
          </div>
        </div>
      </section>

      {/* ── Live metrics ───────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="kicker">{t("metricsTitle")}</h2>
            {gh.generatedAt ? (
              <span className="kicker">
                {(l === "fr" ? "Mis à jour " : "Updated ") +
                  gh.generatedAt.slice(0, 10)}
              </span>
            ) : null}
          </div>
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label.en} className="bg-surface px-5 py-6">
                <dt className="kicker">{m.label[l]}</dt>
                <dd className="mt-2 font-display text-3xl tracking-tight">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Selected work ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl tracking-tight">
              {t("flagshipTitle")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted">{t("flagshipNote")}</p>
          </div>
          <Link
            href="/projects"
            className="hidden shrink-0 items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground sm:inline-flex"
          >
            {t("ctaProjects")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((p) => (
            <StaggerItem key={p.slug} className="h-full">
              <ProjectCard project={p} locale={l} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
