import type { Locale } from "@/i18n/routing";

export type Bilingual = Record<Locale, string>;

export type Theme = "ai" | "web" | "academic" | "creative";
export type Complexity = "foundational" | "applied" | "advanced";
export type SkillLevel = "learning" | "practiced" | "confident";
export type SkillSource = "self" | "efrei" | "both";

export const themeLabel: Record<Theme, Bilingual> = {
  ai: { fr: "IA & systèmes", en: "AI & systems" },
  web: { fr: "Web", en: "Web" },
  academic: { fr: "Académique", en: "Academic" },
  creative: { fr: "Créatif", en: "Creative" },
};

export const complexityLabel: Record<Complexity, Bilingual> = {
  foundational: { fr: "Fondations", en: "Foundational" },
  applied: { fr: "Appliqué", en: "Applied" },
  advanced: { fr: "Avancé", en: "Advanced" },
};

export const levelLabel: Record<SkillLevel, Bilingual> = {
  learning: { fr: "En apprentissage", en: "Learning" },
  practiced: { fr: "Pratiqué", en: "Practiced" },
  confident: { fr: "Maîtrisé", en: "Confident" },
};

export const sourceLabel: Record<SkillSource, Bilingual> = {
  self: { fr: "Autodidacte", en: "Self-taught" },
  efrei: { fr: "Formation EFREI", en: "EFREI curriculum" },
  both: { fr: "EFREI + autodidacte", en: "EFREI + self-taught" },
};

export const sectionLabel = {
  value: { fr: "À quoi ça sert au quotidien", en: "What it's for, day to day" },
  context: { fr: "Contexte & enjeux", en: "Context & stakes" },
  built: { fr: "Ce que j'ai construit", en: "What I built" },
  challenges: { fr: "Problèmes rencontrés", en: "Problems I hit" },
  limits: { fr: "Limites", en: "Limits" },
  learned: { fr: "Ce que j'ai appris et découvert", en: "What I learned" },
  consolidate: { fr: "À consolider ensuite", en: "What I'd consolidate next" },
  defend: { fr: "Ce que je maîtrise et sais défendre", en: "What I can defend" },
} satisfies Record<string, Bilingual>;
