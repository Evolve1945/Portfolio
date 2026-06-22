import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";

const bio: Record<Locale, string[]> = {
  en: [
    "I'm a computer-engineering student at EFREI Paris, focused on software and web development. I work mainly in Python and on the web, with working knowledge of C, SQL, Git and Linux.",
    "My next steps are React, REST APIs and full-stack deployment — which I practise through my own projects rather than waiting for a course to cover them.",
    "I'm preparing an international exchange in my third year and looking for a developer apprenticeship for 2027, open to an internship before then.",
  ],
  fr: [
    "Je suis étudiant en cycle ingénieur informatique à l'EFREI Paris, orienté développement logiciel et web. Je programme surtout en Python et sur le web, avec des bases en C, SQL, Git et Linux.",
    "Mes prochaines étapes : React, les API REST et le déploiement full-stack — que je travaille à travers mes propres projets plutôt qu'en attendant un cours.",
    "Je prépare un échange international en 3e année et je recherche une alternance de développeur pour 2027, ouvert à un stage d'ici là.",
  ],
};

const principlesTitle: Record<Locale, string> = {
  en: "How I work",
  fr: "Ma façon de travailler",
};

const principles: Record<Locale, { h: string; p: string }[]> = {
  en: [
    { h: "I learn by building — and by explaining", p: "Ideas only really stick once I've built them and put them into words for an audience. This site is part of that." },
    { h: "I remap problems across domains", p: "I translate a hard problem into a more tractable one — an AI stack as distributed infrastructure, a policy problem as a systems problem." },
    { h: "I keep the work honest", p: "I'd rather show what I can defend than overstate it. The work should look serious because it is, not because of the framing." },
  ],
  fr: [
    { h: "J'apprends en construisant — et en expliquant", p: "Les idées ne tiennent vraiment qu'une fois construites et mises en mots pour un public. Ce site en fait partie." },
    { h: "Je remappe les problèmes d'un domaine à l'autre", p: "Je traduis un problème difficile en un problème plus traitable — une stack IA comme une infrastructure distribuée, un sujet de politique comme un problème de systèmes." },
    { h: "Je garde un travail honnête", p: "Je préfère montrer ce que je sais défendre plutôt que de surévaluer. Le travail doit paraître sérieux parce qu'il l'est, pas grâce à l'emballage." },
  ],
};

const factsTitle: Record<Locale, string> = { en: "At a glance", fr: "En bref" };

const facts: Record<Locale, { k: string; v: string }[]> = {
  en: [
    { k: "Based in", v: "Paris" },
    { k: "School", v: "EFREI — engineering cycle" },
    { k: "Languages", v: "French (native), Russian (C1), English (B2), German (B1)" },
    { k: "Off keyboard", v: "Karate — black belt (1st dan), gym" },
    { k: "Reading", v: "Carnegie, Greene — communication & strategy" },
  ],
  fr: [
    { k: "Basé à", v: "Paris" },
    { k: "École", v: "EFREI — cycle ingénieur" },
    { k: "Langues", v: "Français (natif), russe (C1), anglais (B2), allemand (B1)" },
    { k: "Hors clavier", v: "Karaté — ceinture noire (1er dan), salle de sport" },
    { k: "Lectures", v: "Carnegie, Greene — communication & stratégie" },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const t = await getTranslations("pages.about");

  return (
    <>
      <PageHeader kicker={t("kicker")} title={t("title")} intro={t("intro")} />

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="space-y-4 text-lg leading-relaxed text-muted">
            {bio[l].map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <h2 className="mt-12 font-display text-2xl tracking-tight">
            {principlesTitle[l]}
          </h2>
          <div className="mt-5 space-y-5">
            {principles[l].map((pr) => (
              <div
                key={pr.h}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <h3 className="font-medium">{pr.h}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {pr.p}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="md:pt-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <span className="kicker">{factsTitle[l]}</span>
            <dl className="mt-4 space-y-4">
              {facts[l].map((f) => (
                <div key={f.k}>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-faint">
                    {f.k}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
