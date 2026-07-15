import type { Bilingual } from "./taxonomy";

export type RncpPriority = "prioritize" | "build" | "neglect";

export interface RncpCompetency {
  text: Bilingual;
  priority: RncpPriority;
  evidence?: string[]; // project slugs
}

export interface RncpBlock {
  code: string;
  title: Bilingual;
  competencies: RncpCompetency[];
}

export const rncpMeta = {
  code: "RNCP 41030",
  level: { fr: "Niveau 7", en: "Level 7" },
  certifier: "EFREI Paris",
  title: {
    fr: "Titre ingénieur — Diplôme d'ingénieur de l'EFREI Paris",
    en: "Engineering degree — EFREI Paris",
  },
} as const;

export const priorityLabel: Record<RncpPriority, Bilingual> = {
  prioritize: { fr: "Prioriser", en: "Prioritize" },
  build: { fr: "À développer plus tard", en: "Build next" },
  neglect: { fr: "Plus tard", en: "Later" },
};

export const rncpBlocks: RncpBlock[] = [
  {
    code: "BC01",
    title: { fr: "Analyser les besoins", en: "Analyse requirements" },
    competencies: [
      { text: { fr: "Reformuler la demande d'un client pour clarifier et formaliser le besoin", en: "Reframe a client's request to clarify and formalise the need" }, priority: "neglect" },
      { text: { fr: "Traduire les besoins en exigences fonctionnelles et non fonctionnelles", en: "Translate needs into functional and non-functional requirements" }, priority: "build" },
      { text: { fr: "Estimer les ressources (RH, compétences, technologies, budget, délais)", en: "Estimate resources (people, skills, tech, budget, timeline)" }, priority: "neglect" },
      { text: { fr: "Estimer l'impact environnemental et sociétal d'une solution", en: "Estimate a solution's environmental and societal impact" }, priority: "neglect" },
      { text: { fr: "Élaborer et rédiger un cahier des charges", en: "Write a formal specification (cahier des charges)" }, priority: "neglect" },
    ],
  },
  {
    code: "BC02",
    title: { fr: "Concevoir et modéliser", en: "Design & model" },
    competencies: [
      { text: { fr: "Évaluer et sélectionner les solutions existantes (contraintes techniques, économiques, humaines)", en: "Evaluate and select existing solutions under technical, economic and human constraints" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Intégrer l'expérience utilisateur (UX) dans toutes les dimensions du projet", en: "Integrate user experience across the project" }, priority: "build", evidence: ["web-ti402"] },
      { text: { fr: "Adopter les bonnes pratiques de sécurité et de fiabilité dans la conception", en: "Apply security and reliability best practices by design" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Démontrer la faisabilité technique d'un dispositif", en: "Demonstrate the technical feasibility of a system" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Anticiper l'évolutivité et l'interopérabilité dès la conception", en: "Plan for scalability and interoperability from the design stage" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Élaborer des maquettes ou des POC", en: "Build mockups or proofs of concept" }, priority: "prioritize", evidence: ["ecosystem", "web-ti402"] },
    ],
  },
  {
    code: "BC03",
    title: { fr: "Mettre en œuvre", en: "Implement" },
    competencies: [
      { text: { fr: "Implémenter les composants d'une architecture ou d'un système", en: "Implement the components of an architecture or system" }, priority: "prioritize", evidence: ["ecosystem", "chatbot", "web-ti402"] },
      { text: { fr: "Intégrer les composants (compatibilité, intégrité, interopérabilité, sécurité)", en: "Integrate components ensuring compatibility, integrity, interoperability and security" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Tester et valider un dispositif logiciel, système ou embarqué", en: "Test and validate a software, system or embedded solution" }, priority: "build" },
      { text: { fr: "Optimiser les performances (coûts, qualité, impact) en réalisant les arbitrages", en: "Optimise performance (cost, quality, impact) with the right trade-offs" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Produire la documentation technique", en: "Produce technical documentation" }, priority: "prioritize", evidence: ["ecosystem"] },
      { text: { fr: "Mettre à disposition une solution (config, install, automatisation, sauvegarde/secours)", en: "Ship a solution (config, install, automation, backup/recovery)" }, priority: "build", evidence: ["ecosystem"] },
    ],
  },
  {
    code: "BC04",
    title: { fr: "Gérer l'exploitation", en: "Operate & improve" },
    competencies: [
      { text: { fr: "Analyser les indicateurs de performance et repérer les anomalies", en: "Analyse performance indicators and spot anomalies" }, priority: "build", evidence: ["ecosystem"] },
      { text: { fr: "Superviser la solution pour le maintien en conditions opérationnelles", en: "Monitor the solution to keep it operational" }, priority: "build", evidence: ["ecosystem"] },
      { text: { fr: "Proposer des améliorations (fonctionnalités, performances)", en: "Propose improvements (features, performance)" }, priority: "build", evidence: ["ecosystem"] },
      { text: { fr: "Mettre en œuvre les améliorations et mettre à jour la documentation", en: "Implement improvements and update the documentation" }, priority: "build" },
    ],
  },
  {
    code: "BC05",
    title: { fr: "Œuvrer en mode projet", en: "Work in project mode" },
    competencies: [
      { text: { fr: "Mener et partager une recherche documentaire et une veille technique", en: "Conduct and share technical research and watch" }, priority: "prioritize" },
      { text: { fr: "Communiquer efficacement à l'écrit et à l'oral", en: "Communicate effectively in writing and speech" }, priority: "prioritize", evidence: ["web-ti402"] },
      { text: { fr: "Respecter la méthodologie de gestion de projet / delivery", en: "Follow the project-management / delivery methodology" }, priority: "build" },
      { text: { fr: "Réaliser un suivi de l'avancement des travaux / des ressources", en: "Track work and resource progress" }, priority: "build" },
      { text: { fr: "Collaborer en équipe pluridisciplinaire et internationale", en: "Collaborate in a cross-disciplinary, international team" }, priority: "prioritize", evidence: ["chatbot"] },
      { text: { fr: "Prendre des décisions opérationnelles et en comprendre les impacts", en: "Make operational decisions and understand their impact" }, priority: "neglect" },
      { text: { fr: "Sensibiliser aux enjeux de la transition écologique (TEDS)", en: "Champion sustainability (TEDS) concerns" }, priority: "neglect" },
      { text: { fr: "Produire la documentation pour la formation des utilisateurs", en: "Produce user-training documentation" }, priority: "build" },
    ],
  },
];
