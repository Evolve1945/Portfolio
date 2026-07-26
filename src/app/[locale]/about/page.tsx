import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";

const bio: Record<Locale, string[]> = {
  en: [
    "I'm a computer-engineering student at EFREI Paris — born and based in Paris, to a Russian family. I found programming in an intro tech class around 15, chased that curiosity into the CS specialism (NSI), and pushed my grade from 12 to 16 along the way. Today I work mainly in Python and on the web, with working knowledge of C, SQL, Git and Linux.",
    "I think like an architect: give me a goal and I'll find a path to build it, adapting to the resources at hand, the skills on the team, and how each person likes to work. I learn by building real projects rather than waiting for a course — and I keep sharpening that with a programming mentor I check in with and a few very talented classmates I build alongside.",
    "I'm still figuring out which kind of engineer I want to become, and I try a lot to find out — aiming to go deep on one thing while staying broad across many. I'd like to start inside a strong, ambitious team — people sharper than me, who genuinely care about their ideas — before eventually building something of my own. I'm looking for a developer apprenticeship (alternance) for 2028, open to an internship before then, and preparing an international exchange during my studies.",
  ],
  fr: [
    "Je suis étudiant en cycle ingénieur informatique à l'EFREI Paris — né et basé à Paris, d'une famille russe. J'ai découvert la programmation en cours de SNT, en seconde ; j'ai suivi cette curiosité jusqu'à la spécialité NSI, en faisant passer ma moyenne de 12 à 16. Aujourd'hui je programme surtout en Python et sur le web, avec des bases en C, SQL, Git et Linux.",
    "Je raisonne comme un architecte : donnez-moi un objectif et je trouve un chemin pour le construire, en m'adaptant aux ressources disponibles, aux compétences de l'équipe et à la façon de travailler de chacun. J'apprends en construisant de vrais projets plutôt qu'en attendant un cours — et j'aiguise cela avec un mentor que je consulte régulièrement et quelques camarades très talentueux avec qui je construis.",
    "Je cherche encore quel type d'ingénieur je veux devenir, et j'essaie beaucoup de choses pour le savoir — avec l'idée d'aller en profondeur sur un domaine tout en restant large sur beaucoup d'autres. J'aimerais commencer dans une équipe solide et ambitieuse — des gens plus affûtés que moi, qui tiennent vraiment à leurs idées — avant de bâtir un jour quelque chose à moi. Je recherche une alternance de développeur pour 2028, ouvert à un stage d'ici là, et je prépare un échange international pendant mes études.",
  ],
};

const principlesTitle: Record<Locale, string> = {
  en: "How I work",
  fr: "Ma façon de travailler",
};

const principles: Record<Locale, { h: string; p: string }[]> = {
  en: [
    { h: "I learn by building — and by shipping", p: "School material moves slower than the tech it teaches, so I don't wait for a course. I pick up a new tool from videos and by having AI break a topic down to its core idea, then make it stick by building something real and putting it in front of people — this site is part of that." },
    { h: "I break a problem down to its source", p: "When something's hard, I split it into small steps until I find the real cause — or reuse a solution that already exists. For people problems, I let the emotion settle first, then weigh the options rationally." },
    { h: "I organize a team around its strengths", p: "Leading a project, I split the work fairly — the harder parts to the mid-level, the overflow to me — and keep decisions in writing. The goal is everyone doing their best work, not just staying busy." },
    { h: "I keep the work honest", p: "I'd rather show what I can defend than overstate it. I use AI as a tool and engineer my prompts carefully, but I own the architecture and the decisions — and I say so plainly." },
  ],
  fr: [
    { h: "J'apprends en construisant — et en livrant", p: "Le programme scolaire avance plus lentement que les technologies qu'il enseigne, alors je n'attends pas les cours. Je prends en main un nouvel outil avec des vidéos et en demandant à l'IA de décomposer un sujet jusqu'à son idée centrale, puis je l'ancre en construisant quelque chose de réel et en le confrontant à un public — ce site en fait partie." },
    { h: "Je décompose un problème jusqu'à sa source", p: "Face à une difficulté, je la découpe en petites étapes jusqu'à trouver la vraie cause — ou je réutilise une solution qui existe déjà. Pour les problèmes humains, je laisse d'abord l'émotion retomber, puis je pèse les options rationnellement." },
    { h: "J'organise une équipe autour de ses forces", p: "Quand je pilote un projet, je répartis le travail équitablement — les parties les plus dures au niveau intermédiaire, le surplus pour moi — et je garde une trace écrite des décisions. L'objectif : que chacun fasse son meilleur travail, pas seulement qu'il soit occupé." },
    { h: "Je garde un travail honnête", p: "Je préfère montrer ce que je sais défendre plutôt que de surévaluer. Je me sers de l'IA comme d'un outil et je soigne mes requêtes, mais je reste maître de l'architecture et des décisions — et je le dis clairement." },
  ],
};

const factsTitle: Record<Locale, string> = { en: "At a glance", fr: "En bref" };

const facts: Record<Locale, { k: string; v: string }[]> = {
  en: [
    { k: "Based in", v: "Paris" },
    { k: "School", v: "EFREI Paris — engineering cycle" },
    { k: "Languages", v: "French & Russian (native), English (B2), German (B1)" },
    { k: "Off keyboard", v: "Karate — 1st-dan black belt, gym, learning guitar" },
    { k: "Listening", v: "EDM, hardstyle, rock" },
    { k: "Reading", v: "Greene, Carnegie, Housel — strategy, communication, focus" },
  ],
  fr: [
    { k: "Basé à", v: "Paris" },
    { k: "École", v: "EFREI Paris — cycle ingénieur" },
    { k: "Langues", v: "Français & russe (natif), anglais (B2), allemand (B1)" },
    { k: "Hors clavier", v: "Karaté — ceinture noire (1er dan), musculation, guitare en autodidacte" },
    { k: "J'écoute", v: "EDM, hardstyle, rock" },
    { k: "Lectures", v: "Greene, Carnegie, Housel — stratégie, communication, concentration" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return { title: t("title"), description: t("intro") };
}

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
