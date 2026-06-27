import type { Bilingual, SkillLevel, SkillSource } from "./taxonomy";

export interface SubSkill {
  name: Bilingual;
  level: SkillLevel;
  source: SkillSource;
  /** Project slugs that prove this sub-skill (links to case studies / git traces). */
  evidence?: string[];
}

export interface SkillCategory {
  id: string;
  title: Bilingual;
  /** EFREI RNCP competency block — fill from Rudolf's fiche RNCP. */
  rncpBlock: string | null;
  subskills: SubSkill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: "languages-software",
    title: { fr: "Langages & logiciel", en: "Languages & software" },
    rncpBlock: "BC03 · Mise en œuvre",
    subskills: [
      { name: { fr: "Python", en: "Python" }, level: "confident", source: "both", evidence: ["ecosystem", "chatbot", "cyberpix"] },
      { name: { fr: "Programmation en C", en: "C programming" }, level: "practiced", source: "efrei" },
      { name: { fr: "JavaScript", en: "JavaScript" }, level: "practiced", source: "both", evidence: ["web-ti402"] },
      { name: { fr: "SQL & bases de données", en: "SQL & databases" }, level: "practiced", source: "efrei" },
      { name: { fr: "Java", en: "Java" }, level: "practiced", source: "efrei" },
      { name: { fr: "Structures de données & algorithmes", en: "Data structures & algorithms" }, level: "practiced", source: "efrei" },
    ],
  },
  {
    id: "web",
    title: { fr: "Web", en: "Web" },
    rncpBlock: "BC03 · Mise en œuvre",
    subskills: [
      { name: { fr: "HTML sémantique & CSS", en: "Semantic HTML & CSS" }, level: "practiced", source: "both", evidence: ["web-ti402"] },
      { name: { fr: "Design responsive", en: "Responsive design" }, level: "practiced", source: "both", evidence: ["web-ti402"] },
      { name: { fr: "React / Next.js", en: "React / Next.js" }, level: "learning", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "API REST (FastAPI)", en: "REST APIs (FastAPI)" }, level: "learning", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Tailwind CSS", en: "Tailwind CSS" }, level: "practiced", source: "self" },
    ],
  },
  {
    id: "ai-data",
    title: { fr: "IA & données", en: "AI & data" },
    rncpBlock: "BC02 · Conception & modélisation",
    subskills: [
      { name: { fr: "NLP & TF-IDF", en: "NLP & TF-IDF" }, level: "practiced", source: "self", evidence: ["chatbot"] },
      { name: { fr: "RAG & recherche vectorielle", en: "RAG & vector search" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Orchestration d'agents LLM", en: "LLM agent orchestration" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Routage multi-modèles & bascule", en: "Multi-model routing & failover" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Conception de prompts & d'agents", en: "Prompt & agent design" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Optimisation des coûts LLM", en: "LLM cost optimisation" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
    ],
  },
  {
    id: "systems-tooling",
    title: { fr: "Systèmes & outillage", en: "Systems & tooling" },
    rncpBlock: "BC04 · Exploitation & amélioration",
    subskills: [
      { name: { fr: "Git & collaboration", en: "Git & collaboration" }, level: "confident", source: "both", evidence: ["chatbot", "ecosystem"] },
      { name: { fr: "Linux", en: "Linux" }, level: "practiced", source: "both" },
      { name: { fr: "Patterns de résilience (disjoncteurs, files, reprises)", en: "Resilience patterns (circuit breakers, queues, retries)" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "Empaquetage & distribution d'app", en: "App packaging & distribution" }, level: "practiced", source: "self", evidence: ["cyberpix"] },
      { name: { fr: "Concurrence & threads", en: "Concurrency & threading" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "FastAPI & WebSocket", en: "FastAPI & WebSocket" }, level: "learning", source: "self", evidence: ["ecosystem"] },
      { name: { fr: "SQLite", en: "SQLite" }, level: "practiced", source: "both", evidence: ["ecosystem"] },
      { name: { fr: "CI/CD (GitHub Actions)", en: "CI/CD (GitHub Actions)" }, level: "practiced", source: "self", evidence: ["ecosystem"] },
    ],
  },
  {
    id: "communication",
    title: { fr: "Communication & langues", en: "Communication & languages" },
    rncpBlock: "BC05 · Mode projet & communication",
    subskills: [
      { name: { fr: "Rédaction technique en anglais", en: "Technical writing in English" }, level: "practiced", source: "both" },
      { name: { fr: "Rhétorique & argumentation", en: "Rhetoric & argumentation" }, level: "practiced", source: "efrei" },
      { name: { fr: "Multilingue — FR natif, RU C1, EN B2, DE B1", en: "Multilingual — FR native, RU C1, EN B2, DE B1" }, level: "confident", source: "self" },
    ],
  },
];
