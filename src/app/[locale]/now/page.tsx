import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";

// Update this date whenever the page changes.
const updated = "2026-06-22";

const blocks: Record<Locale, { h: string; items: string[] }[]> = {
  en: [
    {
      h: "Learning",
      items: [
        "React & Next.js — by building this site",
        "REST APIs with FastAPI",
        "Full-stack deployment",
      ],
    },
    {
      h: "Building",
      items: [
        "Ecosystem: task-dependency DAG",
        "Error tracking & categorisation",
        "Always-on remote access",
      ],
    },
    {
      h: "Reading",
      items: [
        "Robert Greene — strategy & leverage",
        "Dale Carnegie — communication",
      ],
    },
  ],
  fr: [
    {
      h: "J'apprends",
      items: [
        "React & Next.js — en construisant ce site",
        "Les API REST avec FastAPI",
        "Le déploiement full-stack",
      ],
    },
    {
      h: "Je construis",
      items: [
        "Ecosystem : DAG de dépendances de tâches",
        "Suivi et catégorisation des erreurs",
        "Accès distant permanent",
      ],
    },
    {
      h: "Je lis",
      items: [
        "Robert Greene — stratégie & influence",
        "Dale Carnegie — communication",
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
