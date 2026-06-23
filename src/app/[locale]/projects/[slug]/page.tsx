import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { projects, getProject } from "@/data/projects";
import { complexityLabel, themeLabel, sectionLabel } from "@/data/taxonomy";
import { getRepoStats } from "@/lib/github";
import { site } from "@/data/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p ? `${p.name} — ${site.name}` : site.name };
}

const traceNote: Record<Locale, string> = {
  en: "Commit activity, languages and last-active date are wired in by the daily GitHub pipeline.",
  fr: "L'activité de commits, les langages et la dernière activité sont injectés par le pipeline GitHub quotidien.",
};

const traceLabels: Record<
  Locale,
  { commits: string; language: string; stars: string; active: string }
> = {
  en: { commits: "Commits", language: "Top language", stars: "Stars", active: "Last active" },
  fr: { commits: "Commits", language: "Langage", stars: "Étoiles", active: "Dernière activité" },
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const p = getProject(slug);
  if (!p) notFound();

  const ui = await getTranslations("ui");
  const repoUrl = p.repo ? `${site.githubUrl}/${p.repo}` : p.url;
  const stats = getRepoStats(p.repo);
  const tl = traceLabels[l];
  const isPrivate = !!p.private;

  const sections: { key: keyof typeof sectionLabel; paras: string[] }[] = [
    { key: "context", paras: p.context[l] },
    { key: "built", paras: p.built[l] },
    { key: "challenges", paras: p.challenges[l] },
    { key: "limits", paras: p.limits[l] },
    { key: "learned", paras: p.learned[l] },
    { key: "consolidate", paras: p.consolidate[l] },
  ];

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {ui("backToProjects")}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-accent">
          {complexityLabel[p.complexity][l]}
        </span>
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-faint">
          {themeLabel[p.theme][l]}
        </span>
        {p.aiAssisted ? (
          <span className="rounded border border-signal/40 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-signal">
            {ui("builtWithAi")}
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
        {p.name}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">{p.tagline[l]}</p>

      {repoUrl && !isPrivate ? (
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-foreground/30"
        >
          {ui("viewRepo")}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      ) : null}

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.key}>
            <h2 className="kicker">{sectionLabel[s.key][l]}</h2>
            <div className="mt-2 space-y-3 leading-relaxed">
              {s.paras.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        ))}

        {p.aiAssisted && p.defend ? (
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="kicker text-signal">{sectionLabel.defend[l]}</h2>
            <p className="mt-2 leading-relaxed">{p.defend[l]}</p>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          {p.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.7rem] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {p.repo ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="kicker">Git trace</span>
            {isPrivate ? (
              <span className="kicker text-faint">
                {l === "fr" ? "dépôt privé" : "private"}
              </span>
            ) : (
              <a
                href={`${site.githubUrl}/${p.repo}`}
                target="_blank"
                rel="noreferrer"
                className="kicker transition-colors hover:text-foreground"
              >
                live · daily
              </a>
            )}
          </div>
          <p className="mt-2 font-mono text-sm">
            {site.github}/{p.repo}
          </p>
          {isPrivate ? (
            <p className="mt-1 text-sm text-faint">
              {l === "fr"
                ? "Code gardé privé — statistiques issues du dépôt local."
                : "Code kept private — stats read from the local repository."}
            </p>
          ) : null}
          {stats ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <div>
                <dt className="kicker">{tl.commits}</dt>
                <dd className="mt-1 font-display text-2xl tracking-tight">
                  {stats.commits}
                </dd>
              </div>
              <div>
                <dt className="kicker">{tl.language}</dt>
                <dd className="mt-1 font-display text-2xl tracking-tight">
                  {stats.topLanguage ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="kicker">{tl.stars}</dt>
                <dd className="mt-1 font-display text-2xl tracking-tight">
                  {stats.stars}
                </dd>
              </div>
              <div>
                <dt className="kicker">{tl.active}</dt>
                <dd className="mt-1 font-display text-2xl tracking-tight">
                  {stats.pushedAt ? stats.pushedAt.slice(0, 10) : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-faint">
              {traceNote[l]}
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}
