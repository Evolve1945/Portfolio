import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { skillCategories } from "@/data/skills";
import { getProject } from "@/data/projects";
import { levelLabel, sourceLabel, type SkillLevel } from "@/data/taxonomy";

const rank: Record<SkillLevel, number> = {
  learning: 1,
  practiced: 2,
  confident: 3,
};

function Pips({ level }: { level: SkillLevel }) {
  const n = rank[level];
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= n ? "bg-accent" : "bg-border"}`}
        />
      ))}
    </span>
  );
}

const rncpPlaceholder: Record<Locale, string> = {
  en: "RNCP block · to map",
  fr: "Bloc RNCP · à mapper",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.skills" });
  return { title: t("title"), description: t("intro") };
}

export default async function SkillsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.skills");
  const ui = await getTranslations("ui");

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Link
          href="/rncp"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          {l === "fr"
            ? "Voir la cartographie complète des compétences RNCP"
            : "See the full RNCP competency map"}
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-12 pt-6 md:grid-cols-2">
        {skillCategories.map((cat) => (
          <section
            key={cat.id}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl tracking-tight">
                {cat.title[l]}
              </h2>
              <span className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-faint">
                {cat.rncpBlock ?? rncpPlaceholder[l]}
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {cat.subskills.map((s, i) => (
                <li
                  key={i}
                  className="border-t border-border pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{s.name[l]}</span>
                    <Pips level={s.level} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem]">
                    <span className="font-mono uppercase tracking-wider text-faint">
                      {levelLabel[s.level][l]}
                    </span>
                    <span className="text-muted">{sourceLabel[s.source][l]}</span>
                    {s.evidence?.length ? (
                      <span className="flex flex-wrap items-center gap-1.5 text-faint">
                        {ui("evidence")}:
                        {s.evidence.map((slug) => {
                          const proj = getProject(slug);
                          if (!proj) return null;
                          return (
                            <Link
                              key={slug}
                              href={`/projects/${slug}`}
                              className="text-accent hover:underline"
                            >
                              {proj.name}
                            </Link>
                          );
                        })}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
