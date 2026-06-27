import { getTranslations, setRequestLocale } from "next-intl/server";
import { Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { featuredProjects } from "@/data/projects";

// TODO: confirm exact dates with Rudolf.
const cv: Record<
  Locale,
  {
    education: { h: string; d: string }[];
    experience: { h: string; d: string }[];
    skillsTitle: string;
    languagesTitle: string;
    educationTitle: string;
    experienceTitle: string;
    projectsTitle: string;
    languages: string;
  }
> = {
  en: {
    educationTitle: "Education",
    experienceTitle: "Experience",
    skillsTitle: "Core skills",
    languagesTitle: "Languages",
    projectsTitle: "Selected projects",
    languages: "French (native), Russian (C1), English (B2), German (B1)",
    education: [
      { h: "EFREI Paris", d: "Computer-engineering cycle — Promo 2029" },
      { h: "Lycée Victor Duruy", d: "Baccalauréat — Maths & NSI, with honours" },
    ],
    experience: [
      { h: "Galeries Lafayette", d: "Sales advisor" },
      { h: "Kinougarde", d: "Homework tutoring" },
    ],
  },
  fr: {
    educationTitle: "Formation",
    experienceTitle: "Expérience",
    skillsTitle: "Compétences clés",
    languagesTitle: "Langues",
    projectsTitle: "Projets sélectionnés",
    languages: "Français (natif), russe (C1), anglais (B2), allemand (B1)",
    education: [
      { h: "EFREI Paris", d: "Cycle ingénieur informatique — Promo 2029" },
      { h: "Lycée Victor Duruy", d: "Baccalauréat — Maths & NSI, mention Bien" },
    ],
    experience: [
      { h: "Galeries Lafayette", d: "Conseiller de vente" },
      { h: "Kinougarde", d: "Aide aux devoirs" },
    ],
  },
};

const coreSkills = ["Python", "JavaScript", "HTML/CSS", "C", "SQL", "Git", "Linux"];

export default async function CvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.cv");
  const ui = await getTranslations("ui");
  const c = cv[l];

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-3xl px-5 py-12">
        {/* CV PDFs exported from the Word source (Business project). */}
        <div className="flex flex-wrap items-center gap-3">
          {[
            { code: "FR", file: "/Rudolf-Krylov-CV-FR.pdf" },
            { code: "EN", file: "/Rudolf-Krylov-CV-EN.pdf" },
          ].map((f) => {
            const primary =
              (l === "fr" && f.code === "FR") || (l === "en" && f.code === "EN");
            return (
              <a
                key={f.code}
                href={f.file}
                download
                className={
                  primary
                    ? "inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
                    : "inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm transition-colors hover:border-foreground/30"
                }
              >
                <Download className="h-4 w-4" aria-hidden />
                {ui("downloadCv")} · {f.code}
              </a>
            );
          })}
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <div className="space-y-8">
            <section>
              <h2 className="kicker">{c.educationTitle}</h2>
              <ul className="mt-3 space-y-3">
                {c.education.map((e) => (
                  <li key={e.h}>
                    <p className="font-medium">{e.h}</p>
                    <p className="text-sm text-muted">{e.d}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="kicker">{c.experienceTitle}</h2>
              <ul className="mt-3 space-y-3">
                {c.experience.map((e) => (
                  <li key={e.h}>
                    <p className="font-medium">{e.h}</p>
                    <p className="text-sm text-muted">{e.d}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="kicker">{c.skillsTitle}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {coreSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.72rem] text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="kicker">{c.languagesTitle}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {c.languages}
              </p>
            </section>
            <section>
              <h2 className="kicker">{c.projectsTitle}</h2>
              <ul className="mt-3 space-y-1.5">
                {featuredProjects.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/projects/${p.slug}`}
                      className="text-sm text-accent hover:underline"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
