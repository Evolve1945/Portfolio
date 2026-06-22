import type { Bilingual, Complexity, Theme } from "./taxonomy";

// Multi-paragraph, per-locale prose.
type Para = { fr: string[]; en: string[] };

export interface Project {
  slug: string;
  name: string;
  /** Approximate year — CONFIRM with Rudolf; used only for ordering the journey. */
  year: string;
  theme: Theme;
  complexity: Complexity;
  /** GitHub repo name under the Evolve1945 account, when public. */
  repo?: string;
  /** External link if there is no public repo. */
  url?: string;
  tags: string[];
  tagline: Bilingual;
  context: Para; // cadre global + enjeux
  built: Para; // what I built
  challenges: Para; // problems encountered
  limits: Para; // honest limits of the project
  learned: Para; // what I learned / discovered
  consolidate: Para; // what I'd like to consolidate next
  aiAssisted?: boolean;
  /** For AI-assisted work: the parts Rudolf owns and can explain in an interview. */
  defend?: Bilingual;
  featured?: boolean;
}

// NOTE: stakes / problems / limits / next-steps are drafted from the repos, the
// Ecosystem README and each project's nature — Rudolf should verify and personalise,
// especially the problems actually encountered.
export const projects: Project[] = [
  {
    slug: "ecosystem",
    name: "Ecosystem",
    year: "2026",
    theme: "ai",
    complexity: "advanced",
    repo: "Ecosystem",
    tags: ["Python", "FastAPI", "RAG", "ChromaDB", "WebSocket"],
    featured: true,
    aiAssisted: true,
    tagline: {
      fr: "Infrastructure d'agents IA auto-réparante : elle tourne, se rétablit et se souvient toute seule.",
      en: "Self-healing AI agent infrastructure that runs, recovers, and remembers on its own.",
    },
    context: {
      fr: [
        "Je voulais une infrastructure IA toujours active — capable de se relancer seule et de garder une mémoire — plutôt qu'un script qu'on lance à la main.",
        "L'enjeu n'était pas de faire une démo, mais de traiter la fiabilité, le coût et la mémoire comme des contraintes de premier ordre, comme dans un vrai système en production.",
      ],
      en: [
        "I wanted always-on AI infrastructure that could restart itself and keep a memory — not a script you launch by hand.",
        "The point was never a demo: it was to treat reliability, cost and memory as first-class constraints, the way a real production system has to.",
      ],
    },
    built: {
      fr: [
        "Un orchestrateur de 12 agents avec file de priorité, disjoncteurs et dead-letter queue, pour que les tâches échouent proprement et soient rejouées.",
        "Autour : une mémoire RAG (ChromaDB), un routeur multi-modèles qui bascule de Claude vers GPT-4o puis Gemini, un watchdog auto-réparant, un tableau de bord FastAPI/WebSocket et un bot Discord de contrôle.",
      ],
      en: [
        "A 12-agent orchestrator with a priority queue, circuit breakers and a dead-letter queue, so tasks fail cleanly and get replayed.",
        "Around it: a RAG memory (ChromaDB), a multi-model router that fails over Claude to GPT-4o to Gemini, a self-healing watchdog, a FastAPI/WebSocket dashboard and a Discord control bot.",
      ],
    },
    challenges: {
      fr: [
        "Les limites de débit et les pannes des API m'ont poussé à construire la chaîne de bascule multi-modèles plutôt que de tout arrêter au premier 429.",
        "Garder le système debout sans surveillance permanente a imposé le watchdog (reprises avec backoff, alertes) ; garder du contexte entre les tâches a imposé la couche RAG.",
      ],
      en: [
        "Rate limits and API outages pushed me to build the multi-model failover chain instead of stopping at the first 429.",
        "Keeping it standing without me watching forced the watchdog (retries with backoff, alerts); keeping context across tasks forced the RAG layer.",
      ],
    },
    limits: {
      fr: [
        "C'est construit avec l'aide de l'IA : je dirige l'architecture et j'en comprends le cœur, mais je n'ai pas écrit chaque ligne — et je le dis clairement.",
        "Aujourd'hui il tourne en local, pour un seul utilisateur ; plusieurs modules sont en v1 et privilégient l'étendue à la finition.",
      ],
      en: [
        "It's built with AI assistance: I direct the architecture and understand its core, but I didn't write every line — and I say so plainly.",
        "Today it runs locally, single-user; several modules are v1 and favour breadth over polish.",
      ],
    },
    learned: {
      fr: [
        "Les vrais enseignements sont les schémas des systèmes distribués sous panne : reprises, disjoncteurs, files, idempotence — et pourquoi ils existent.",
        "Faire tourner un système en continu coûte une attention qu'aucun tutoriel ne montre.",
      ],
      en: [
        "The real lessons are distributed-systems patterns under failure — retries, circuit breakers, queues, idempotency — and why they exist.",
        "Running something continuously costs an attention no tutorial shows you.",
      ],
    },
    consolidate: {
      fr: [
        "Ensuite : un DAG de dépendances de tâches (pipelines branchés), un suivi formel des erreurs et des gates humaines explicites.",
        "Et surtout, approfondir ma compréhension de chaque brique au point de pouvoir la réécrire seul — c'est le vrai objectif.",
      ],
      en: [
        "Next: a task-dependency DAG (branching pipelines), formal error tracking, and explicit human-in-the-loop gates.",
        "And above all, deepening my grasp of each piece until I can rewrite it unaided — that's the real goal.",
      ],
    },
    defend: {
      fr: "Je sais expliquer la logique de file et de disjoncteur, la chaîne de bascule multi-modèles et le flux RAG ; j'ai conçu l'architecture et je l'exploite.",
      en: "I can explain the queue and circuit-breaker logic, the multi-model failover chain, and the RAG flow; I designed the architecture and I operate it.",
    },
  },
  {
    slug: "chatbot",
    name: "Chatbot",
    year: "2025",
    theme: "ai",
    complexity: "applied",
    repo: "Chatbot",
    tags: ["Python", "NLP", "TF-IDF"],
    featured: true,
    tagline: {
      fr: "Analyse TF-IDF des discours d'investiture des six derniers présidents français.",
      en: "TF-IDF analysis of the inauguration speeches of France's last six presidents.",
    },
    context: {
      fr: [
        "Projet d'équipe : comparer un corpus de discours présidentiels et permettre d'y poser des questions en français.",
        "L'enjeu était double — transformer du texte brut en quelque chose d'interrogeable, et le faire proprement à deux.",
      ],
      en: [
        "A team project: compare a corpus of presidential speeches and let you ask it questions in French.",
        "The challenge was twofold — turn raw text into something queryable, and do it cleanly as a pair.",
      ],
    },
    built: {
      fr: [
        "Un classement des mots par TF-IDF, la mise en évidence des thèmes communs et distinctifs, et des réponses en texte libre tirées du corpus.",
        "Le tout construit avec un binôme sur plus de 180 commits — branches, revues, historique partagé.",
      ],
      en: [
        "Word ranking by TF-IDF, surfacing of shared and distinctive themes, and free-text answers drawn from the corpus.",
        "All built with a classmate across 180+ commits — branches, reviews, a shared history.",
      ],
    },
    challenges: {
      fr: [
        "Le prétraitement du français (accents, mots vides, normalisation) et rendre les réponses en texte libre pertinentes avec un simple sac de mots.",
        "Tenir un historique git propre à deux a été un apprentissage en soi.",
      ],
      en: [
        "French text preprocessing (accents, stopwords, normalisation) and making free-text answers relevant with a plain bag-of-words.",
        "Keeping a clean shared git history across two people was a lesson in itself.",
      ],
    },
    limits: {
      fr: [
        "Le TF-IDF ne capte pas le sens : synonymes et paraphrases passent à travers, et les réponses restent bornées au corpus et à la pondération choisie.",
      ],
      en: [
        "TF-IDF captures no meaning: synonyms and paraphrase slip through, and answers stay bounded to the corpus and the chosen weighting.",
      ],
    },
    learned: {
      fr: [
        "La mécanique de la vectorisation de texte — et précisément là où elle casse.",
        "Et la discipline d'une vraie collaboration git.",
      ],
      en: [
        "The mechanics of text vectorisation — and exactly where it breaks.",
        "And the discipline of real git collaboration.",
      ],
    },
    consolidate: {
      fr: [
        "Le refaire avec des embeddings et de la recherche sémantique pour viser le sens, pas la fréquence des mots, et séparer plus nettement données, modèle et interface.",
      ],
      en: [
        "Redo it with embeddings and semantic search to reach meaning rather than word frequency, and separate data, model and interface more cleanly.",
      ],
    },
  },
  {
    slug: "cyberpix",
    name: "Cyberpix",
    year: "2025",
    theme: "creative",
    complexity: "foundational",
    repo: "Cyberpix",
    tags: ["Python", "Pixel art", "Packaging"],
    featured: true,
    tagline: {
      fr: "Un petit jeu 2D en Python, sprites pixel-art faits main, empaqueté en exécutable.",
      en: "A small 2D Python game with hand-drawn pixel-art sprites, packaged as an executable.",
    },
    context: {
      fr: [
        "Un défi que je me suis donné : m'apprendre seul les boucles de jeu et l'empaquetage d'application en livrant un vrai petit jeu.",
      ],
      en: [
        "A challenge I set myself: teach myself game loops and app packaging by shipping a real small game.",
      ],
    },
    built: {
      fr: [
        "Un jeu avec menu et sprites pixel-art dessinés sous Piskel, puis empaqueté en exécutable Windows autonome.",
      ],
      en: [
        "A game with a menu and pixel-art sprites drawn in Piskel, then packaged into a standalone Windows executable.",
      ],
    },
    challenges: {
      fr: [
        "Obtenir une boucle de jeu stable et une gestion correcte des entrées, gérer le pipeline d'assets (dessin, import, animation), puis empaqueter Python et ses dépendances en un seul exécutable.",
      ],
      en: [
        "Getting a stable game loop and correct input handling, managing the asset pipeline (drawing, importing, animating), then bundling Python and its dependencies into a single executable.",
      ],
    },
    limits: {
      fr: [
        "Petite envergure — mécaniques simples, peu de contenu — et pas d'architecture formelle : le projet a grandi de façon organique.",
      ],
      en: [
        "Small in scope — simple mechanics, limited content — and no formal architecture: it grew organically.",
      ],
    },
    learned: {
      fr: [
        "Comment une boucle de jeu et le rendu s'emboîtent réellement, et que livrer un artefact exécutable est une compétence à part entière.",
      ],
      en: [
        "How a game loop and rendering actually fit together, and that shipping a runnable artifact is a skill of its own.",
      ],
    },
    consolidate: {
      fr: [
        "Une structure plus propre (scènes, entités) et davantage de contenu si j'y reviens.",
      ],
      en: [
        "A cleaner structure (scenes, entities) and more content if I return to it.",
      ],
    },
  },
  {
    slug: "web-ti402",
    name: "Web project (TI402)",
    year: "2025",
    theme: "web",
    complexity: "applied",
    repo: "web-done",
    tags: ["HTML", "CSS", "JavaScript", "Responsive"],
    tagline: {
      fr: "Site multi-pages responsive réalisé pour le module web TI402 de l'EFREI.",
      en: "A responsive multi-page site built for EFREI's TI402 web module.",
    },
    context: {
      fr: [
        "Module web de l'EFREI : concevoir, construire et présenter un site structuré — de la maquette à la critique de design.",
        "L'enjeu était de passer d'une maquette à un front-end défendable, choix de design à l'appui.",
      ],
      en: [
        "An EFREI web module: design, build and present a structured site — from mockup to design critique.",
        "The point was to go from a mockup to a defensible front-end, design decisions and all.",
      ],
    },
    built: {
      fr: [
        "Un site responsive en HTML/CSS/JavaScript, accompagné d'une maquette, d'une critique de design et d'une présentation.",
      ],
      en: [
        "A responsive site in HTML/CSS/JavaScript, with a mockup, a design critique, and a presentation.",
      ],
    },
    challenges: {
      fr: [
        "Tenir une mise en page responsive sur plusieurs points de rupture sans framework, et structurer le JavaScript à mesure que le site grandissait.",
      ],
      en: [
        "Holding a responsive layout across breakpoints without a framework, and structuring the JavaScript as the site grew.",
      ],
    },
    limits: {
      fr: [
        "Statique, sans back-end, en stack vanilla imposée par le module.",
      ],
      en: [
        "Static, no back-end, vanilla stack as the module required.",
      ],
    },
    learned: {
      fr: [
        "Les fondamentaux du HTML sémantique et du CSS responsive, et comment présenter puis défendre des décisions de design.",
      ],
      en: [
        "Semantic HTML and responsive CSS fundamentals, and how to present then defend design decisions.",
      ],
    },
    consolidate: {
      fr: [
        "Le reconstruire avec un framework à composants (React) et une vraie accessibilité.",
      ],
      en: [
        "Rebuild it with a component framework (React) and proper accessibility.",
      ],
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
