import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";

// Update this date whenever the page changes.
const updated = "2026-07-25";

const blocks: Record<Locale, { h: string; items: string[] }[]> = {
  en: [
    {
      h: "Learning",
      items: [
        "React & Next.js — by building this site",
        "TypeScript — typing this codebase end to end",
        "REST APIs with FastAPI and WebSockets",
        "Retrieval-augmented generation & vector search",
        "Distributed-systems patterns: retries, circuit breakers, idempotency",
        "CI/CD and full-stack deployment (GitHub Actions, Vercel)",
      ],
    },
    {
      h: "Building",
      items: [
        "This portfolio — bilingual, self-updating from GitHub",
        "Ecosystem: a task-dependency DAG for branching pipelines",
        "Ecosystem dashboard V2 — a 35-view supervision UI",
        "An evaluation loop to score and improve agent output",
        "Error tracking & categorisation across the agent mesh",
        "Always-on remote access and alerting",
      ],
    },
    {
      h: "Reading",
      items: [
        "Robert Greene — The 48 Laws of Power, The 50th Law (with 50 Cent), The Art of Seduction, Mastery, The 33 Strategies of War, The Laws of Human Nature, The Daily Laws — strategy & influence",
        "Dale Carnegie — How to Win Friends & Influence People — communication",
        "Gary Keller & Jay Papasan — The One Thing — productivity",
        "Cal Newport — Deep Work, Digital Minimalism — focus & attention",
        "Bodo Schäfer — The 30 Laws of Success — success & wealth",
        "Morgan Housel — The Psychology of Money, The Art of Spending Money — personal finance",
        "Clément Viktorovich — Le pouvoir rhétorique — influence & argumentation",
        "Xavier Niel, interviews with Jean-Louis Missika — Une sacrée envie de foutre le bordel — entrepreneurship & strategy",
        "Walter Isaacson — Elon Musk, Steve Jobs — biographies of innovators",
        "Phil Knight — Shoe Dog — biography of Nike founder",
        "Nicolas Bernard — La Guerre germano-soviétique — history of the Eastern Front in WWII",
      ],
    },
  ],
  fr: [
    {
      h: "J'apprends",
      items: [
        "React & Next.js — en construisant ce site",
        "TypeScript — en typant ce projet de bout en bout",
        "Les API REST avec FastAPI et les WebSockets",
        "La génération augmentée par récupération (RAG) & la recherche vectorielle",
        "Les patterns des systèmes distribués : reprises, disjoncteurs, idempotence",
        "Le CI/CD et le déploiement full-stack (GitHub Actions, Vercel)",
      ],
    },
    {
      h: "Je construis",
      items: [
        "Ce portfolio — bilingue, mis à jour automatiquement depuis GitHub",
        "Ecosystem : un DAG de dépendances de tâches pour des pipelines branchés",
        "Le dashboard V2 de l'Ecosystem — une interface de supervision à 35 vues",
        "Une boucle d'évaluation pour noter et améliorer les sorties des agents",
        "Le suivi et la catégorisation des erreurs sur le mesh d'agents",
        "L'accès distant permanent et les alertes",
      ],
    },
    {
      h: "Je lis",
      items: [
        "Robert Greene — The 48 Laws of Power, The 50th Law (avec 50 Cent), The Art of Seduction, Mastery, The 33 Strategies of War, The Laws of Human Nature, The Daily Laws — stratégie & influence",
        "Dale Carnegie — How to Win Friends & Influence People — communication",
        "Gary Keller & Jay Papasan — The One Thing — productivité",
        "Cal Newport — Deep Work, Digital Minimalism — focus & attention",
        "Bodo Schäfer — The 30 Laws of Success — succès & richesse",
        "Morgan Housel — La psychologie de l'argent, L'art de dépenser — finances personnelles",
        "Clément Viktorovich — Le pouvoir rhétorique — influence & argumentation",
        "Xavier Niel, entretiens avec Jean-Louis Missika — Une sacrée envie de foutre le bordel — entrepreneuriat & stratégie",
        "Walter Isaacson — Elon Musk, Steve Jobs — biographies d'innovateurs",
        "Phil Knight — L'art de la victoire — biographie du fondateur de Nike",
        "Nicolas Bernard — La Guerre germano-soviétique — histoire du front de l'Est pendant la Seconde Guerre mondiale",
      ],
    },
  ],
};

export default async function NowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.now");
  const ui = await getTranslations("ui");

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="kicker">
          {ui("lastUpdated")} · {updated}
        </p>

        <div className="mt-6 space-y-8">
          {blocks[l].map((b) => (
            <section key={b.h}>
              <h2 className="font-display text-2xl tracking-tight">{b.h}</h2>
              <ul className="mt-3 space-y-2">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-2.5 text-muted">
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    <span className="leading-relaxed">{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
