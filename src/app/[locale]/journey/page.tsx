import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/motion/reveal";
import { projects } from "@/data/projects";
import { complexityLabel, type Complexity } from "@/data/taxonomy";

const complexityRank: Record<Complexity, number> = {
  foundational: 0,
  applied: 1,
  advanced: 2,
};

const learnedLabel: Record<Locale, string> = {
  en: "Learned: ",
  fr: "Appris : ",
};

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.journey");

  const items = [...projects].sort(
    (a, b) =>
      a.year.localeCompare(b.year) ||
      complexityRank[a.complexity] - complexityRank[b.complexity],
  );

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <Reveal className="mx-auto max-w-3xl px-5 py-12">
        <ol className="relative border-l border-border">
          {items.map((p) => (
            <li key={p.slug} className="relative pb-9 pl-6 last:pb-0">
              <span
                className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent"
                aria-hidden
              />
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-faint">{p.year}</span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-accent">
                  {complexityLabel[p.complexity][l]}
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl tracking-tight">
                <Link
                  href={`/projects/${p.slug}`}
                  className="transition-colors hover:text-accent"
                >
                  {p.name}
                </Link>
              </h2>
              <p className="mt-1 text-muted">{p.tagline[l]}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <span className="text-faint">{learnedLabel[l]}</span>
                {p.learned[l]}
              </p>
            </li>
          ))}
        </ol>
      </Reveal>
    </>
  );
}
