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
  /** GitHub repo name under the Evolve1945 account. */
  repo?: string;
  /** Repo is kept private — show git stats but no clickable public link. */
  private?: boolean;
  /** External link if there is no public repo. */
  url?: string;
  tags: string[];
  tagline: Bilingual;
  /** Plain-language "what it's for" — concrete advantages / daily-life benefits, shown as a highlighted panel near the top. */
  value?: Para;
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
  /** Sanitised public code excerpts (files under content/excerpts/). */
  excerpts?: { file: string; lang: string; label: Bilingual }[];
  /** Visual media (screenshots, GIFs, videos) under public/projects/<slug>/. */
  media?: { type: "image" | "video"; src: string; alt: Bilingual; poster?: string }[];
  /** Headline at-a-glance facts, shown as a stat strip. */
  metrics?: { value: string; label: Bilingual }[];
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
    private: true,
    tags: ["Python", "FastAPI", "RAG", "ChromaDB", "WebSocket"],
    featured: true,
    aiAssisted: true,
    excerpts: [
      { file: "circuit-breaker.py", lang: "python", label: { fr: "Circuit breaker — 3 états, thread-safe", en: "Circuit breaker — 3-state, thread-safe" } },
      { file: "model-router.py", lang: "python", label: { fr: "Routeur multi-modèles avec bascule", en: "Multi-model failover router" } },
    ],
    metrics: [
      { value: "12", label: { fr: "types d'agents", en: "agent types" } },
      { value: "3", label: { fr: "modèles, avec bascule", en: "models, with failover" } },
      { value: "9", label: { fr: "collections mémoire (RAG)", en: "RAG memory collections" } },
      { value: "12", label: { fr: "vues du tableau de bord", en: "dashboard views" } },
    ],
    tagline: {
      fr: "Infrastructure d'agents IA auto-réparante : elle tourne, se rétablit et se souvient toute seule.",
      en: "Self-healing AI agent infrastructure that runs, recovers, and remembers on its own.",
    },
    value: {
      fr: [
        "Décharge les parties répétitives et longues d'un projet — mise en place, refactorisations, rédaction de docs, exécution des tests — sur une équipe d'agents, pour que je passe mon temps sur l'architecture et les problèmes difficiles.",
        "Continue à tourner sans surveillance : il rejoue les tâches échouées, bascule d'un modèle à l'autre en cas de panne ou de limite de débit, et se relance seul au lieu de mourir en silence.",
        "Se souvient d'une session à l'autre : décisions, code et notes vivent dans une mémoire consultable, donc je ne réexplique pas le contexte à chaque fois que je reprends.",
        "Transforme un objectif flou en tâches ordonnées et suivies, avec une trace claire de ce qui a été fait — au lieu d'un tas de scripts à moitié finis.",
        "Concrètement, c'est une petite équipe de dév toujours disponible pour un étudiant seul : elle me laisse lancer des projets plus ambitieux que je ne pourrais porter à la main.",
      ],
      en: [
        "Offloads the repetitive, long-running parts of a build — scaffolding, refactors, writing docs, running tests — onto a team of agents, so my hours go to architecture and the hard problems.",
        "Keeps working when I'm not watching: it retries failed tasks, fails over between models when one is down or rate-limited, and restarts itself instead of dying silently.",
        "Remembers across sessions: decisions, code and notes live in a searchable memory, so I don't re-explain the context every time I pick the work back up.",
        "Turns a vague goal into ordered, tracked tasks with a clear record of what was done — instead of a pile of half-finished scripts.",
        "In practice it's a small, always-available dev team for a solo student: it lets me take on more ambitious projects than I could carry by hand.",
      ],
    },
    context: {
      fr: [
        "Je voulais une infrastructure IA toujours active — capable d'agir indépendamment, se relancer seule et de garder une mémoire — plutôt qu'un script qu'on lance à la main.",
        "L'enjeu n'était pas de faire une démo, mais de traiter la fiabilité, le coût et la mémoire comme des contraintes de premier ordre, comme dans un vrai système en production.",
        "L'idée était de simplifier l'organisation dans un projet et de rendre les développements plus rapides et plus fiables, en laissant l'IA gérer les tâches répétitives, simples et longues, et en me concentrant sur la conception de l'architecture et les tâches les plus lourdes. Cet ecosystème d'agents IA sert de petite équipe de développement pouvant assister un développeur humain au quotidien.",
        "Je voulais à travers ce projet réduire les limites de l'IA, en la personnalisant à mes besoins et mon usage avec des outils nécessaires, ce qui me simplifie par la suite d'entamer de nouveaux projets plus ambitieux et plus complexes.",
        "Concrètement, il me sert au quotidien : je lui confie la mise en place, les refactorisations et la documentation pendant que je garde la main sur l'architecture et les décisions. L'objectif n'est pas de remplacer le développeur, mais de lui donner une base fiable et personnalisée sur laquelle s'appuyer pour avancer plus vite sans sacrifier la rigueur.",
        "L'autre enjeu était de me mettre en situation réelle d'ingénieur : concevoir un système dont les différentes parties doivent tenir ensemble dans la durée, plutôt que de simplement faire fonctionner une démonstration une fois.",
      ],
      en: [
        "I wanted always-on AI infrastructure that could act independently, restart itself and keep a memory — not a script you launch by hand.",
        "The point was never a demo: it was to treat reliability, cost and memory as first-class constraints, the way a real production system has to.",
        "The idea was to simplify organization in a project and make development faster and more reliable with AI, letting AI handle repetitive, simple, long-running tasks while I focus on architecture design and the heaviest tasks. This ecosystem of AI agents serves as a small development team that can assist a human developer day-to-day.",
        "I wanted through this project to reduce the limits of AI, by customizing it to my needs and usage by adding the required tools, which then simplifies for me to start new projects that are more ambitious and complex.",
        "In practice it earns its place day to day: I hand it scaffolding, refactors and documentation while I keep control of the architecture and the decisions. The goal isn't to replace the developer, but to give one a reliable, personalised base to lean on — moving faster without giving up rigour.",
        "The other stake was to put myself in a real engineer's position: to design a system whose separate parts have to hold together over time, rather than just make a demo work once.",
      ],
    },
    built: {
      fr: [
        "Un orchestrateur de 12 agents avec file de priorité, disjoncteurs et dead-letter queue, pour que les tâches échouent proprement et soient rejouées jusqu'à leur succès.",
        "Autour : une mémoire RAG (ChromaDB), un routeur multi-modèles qui bascule de Claude vers GPT-4o puis Gemini, un watchdog auto-réparant, un tableau de bord FastAPI/WebSocket, un bot Discord de contrôle, et des pipelines liés à un vault Obsidian suivant une hiérarchie stricte, dont le parcours est optimisé avec Graphify.",
        "Le mesh d'agents répartit chaque type d'agent sur son propre serveur HTTP local, ce qui les isole et permet de suivre leur santé un par un. Un moteur de pipelines (DAG) enchaîne des tâches dépendantes, un système de compétences réutilisables évite de réécrire les mêmes routines, et un garde-budget coupe avant de dépasser un plafond de coût fixé.",
        "Côté supervision, un tableau de bord refondu (V2) : 35 vues sur une même API locale, deux thèmes, et un flux temps réel en WebSocket pour suivre en direct les agents, la file d'attente, le budget et la mémoire. C'est la fenêtre par laquelle je pilote et j'observe tout le système.",
      ],
      en: [
        "A 12-agent orchestrator with a priority queue, circuit breakers and a dead-letter queue, so tasks fail cleanly and get replayed until reaching success.",
        "Around it: a RAG memory (ChromaDB), a multi-model router that fails over from Claude to GPT-4o to Gemini, a self-healing watchdog, a FastAPI/WebSocket dashboard, a Discord control bot, and pipelines tied to an Obsidian vault following a strict hierarchy, whose traversal is optimized with Graphify.",
        "The agent mesh runs each agent type as its own local HTTP server, which isolates them and lets me track their health one by one. A pipeline engine (DAG) chains dependent tasks, a reusable skills system avoids rewriting the same routines, and a budget guard cuts off before a set cost ceiling is crossed.",
        "On the supervision side, a rebuilt dashboard (V2): 35 views over a single local API, two themes, and a real-time WebSocket feed to watch the agents, the queue, the budget and the memory live. It's the window through which I steer and observe the whole system.",
      ],
    },
    challenges: {
      fr: [
        "Les limites de débit et les pannes des API m'ont poussé à construire la chaîne de bascule multi-modèles plutôt que de tout arrêter au premier 429.",
        "Garder le système debout sans surveillance permanente a imposé le watchdog (reprises avec backoff, alertes) et la rédaction de règles strictes ; garder du contexte entre les tâches a imposé la couche RAG et recherche dans le vault Obsidian avant de se lancer dans une tâche.",
        "Le plus difficile a été de refondre le tableau de bord (V2) avec un tout nouveau design : la première version ne couvrait qu'environ 8 vues sur 34, il a donc fallu tout recâbler jusqu'à la parité complète (35 vues) sur la même API, dans un nouveau langage visuel à deux thèmes. Reconnecter chaque vue à ses données sans casser l'existant a été long et minutieux.",
        "En cours de route, le polling des serveurs du mesh était silencieusement bloqué par CORS côté navigateur — les cartes restaient vides sans message d'erreur. J'ai dû ajouter un proxy côté serveur pour que la santé du mesh remonte dans les deux interfaces, ce qui m'a appris à lire ce genre de panne muette.",
        "La mise au point s'est faite par vagues de corrections guidées par des revues de captures d'écran plutôt que par des tests classiques : aligner les colonnes, formater les résultats de tâches, réparer les graphiques et les listes, jusqu'à zéro erreur console sur l'ensemble des onglets.",
      ],
      en: [
        "Rate limits and API outages pushed me to build the multi-model failover chain instead of stopping at the first 429.",
        "Keeping it standing without me watching forced the watchdog (retries with backoff, alerts) and writing down strict rules; keeping context across tasks forced the RAG layer, along with a search inside the Obsidian vault before proceeding with a task.",
        "The hardest part was rebuilding the dashboard (V2) with a brand-new design: the first version covered only about 8 of 34 views, so everything had to be re-wired up to full parity (35 views) on the same API, in a new two-theme visual language. Reconnecting each view to its data without breaking what already worked was slow, painstaking work.",
        "Along the way, polling the mesh servers was silently blocked by CORS in the browser — cards just stayed empty with no error. I had to add a server-side proxy so mesh health surfaced in both UIs, which taught me how to read that kind of silent failure.",
        "Getting it right came in waves of fixes driven by screenshot reviews rather than classic tests: aligning columns, formatting task results, repairing charts and lists, down to zero console errors across every tab.",
      ],
    },
    limits: {
      fr: [
        "C'est construit avec l'aide de l'IA (principalement Claude et leurs différents modèles) : je dirige l'architecture et j'en comprends le cœur, mais je n'ai pas écrit chaque ligne — et je le dis clairement.",
        "Aujourd'hui il tourne en local, pour un seul utilisateur ; plusieurs modules sont en v1 et privilégient l'étendue à la finition.",
        "Le tableau de bord et le mesh multiplient les surfaces à maintenir : chaque nouvelle vue ou nouvel agent ajoute du câblage à tenir à jour, et une partie de la vérification repose encore sur des revues manuelles plutôt que sur une suite de tests de bout en bout.",
      ],
      en: [
        "It's built with AI assistance (mainly with Claude and their different models): I direct the architecture and understand its core, but I didn't write every line — and I say so plainly.",
        "Today it runs locally, single-user; several modules are v1 and favour breadth over polish.",
        "The dashboard and the mesh multiply the surfaces to maintain: every new view or agent adds wiring to keep in sync, and part of the verification still relies on manual review rather than a full end-to-end test suite.",
      ],
    },
    learned: {
      fr: [
        "Les vrais enseignements sont les schémas des systèmes distribués sous panne : reprises, disjoncteurs, files, idempotence — et pourquoi ils existent.",
        "Faire tourner un système en continu coûte une attention qu'aucun tutoriel ne montre.",
        "L'application des structures de données m'a permis de comprendre la liaison entre le backend et le front-end, découvrir de nouveaux concepts et que malgré les limites de l'IA, il est toujours possible de subvenir à ses faiblesses en s'attaquant proactivement aux problèmes.",
        "J'ai su diviser les responsabilités entre les agents et les modules, ainsi que séparer un problème complexe en sous-problèmes plus simples, ce qui m'a permis d'agir plus facilement dans la conception et l'implémentation de l'infrastructure.",
        "J'ai aussi appris à faire dialoguer un backend et une interface riche : contrats d'API stables, gestion des états d'échec côté client (fail-open, pour qu'une carte reste utilisable même si un service tombe), et l'importance de vérifier ce qui s'affiche réellement — la revue par captures d'écran a rattrapé des erreurs qu'aucun test unitaire n'aurait vues.",
      ],
      en: [
        "The real lessons are distributed-systems patterns under failure — retries, circuit breakers, queues, idempotency — and why they exist.",
        "Running something continuously costs an attention no tutorial shows you.",
        "Applying data structures let me understand the link between backend and front-end, discover new concepts, and that despite AI's limits, it's always possible to work around its weaknesses by proactively tackling problems.",
        "I was able to divide responsibilities between agents and modules, as well as break a complex problem into simpler sub-problems, which allowed me to act more easily in the design and implementation of the infrastructure.",
        "I also learned to make a backend and a rich interface talk to each other: stable API contracts, handling failure states on the client (fail-open, so a card stays usable even when a service is down), and the value of checking what actually renders — screenshot review caught issues no unit test would have.",
      ],
    },
    consolidate: {
      fr: [
        "Ensuite : un DAG de dépendances de tâches (pipelines branchés), un suivi formel des erreurs et des gates humaines explicites.",
        "Côté interface, remplacer une partie des vérifications manuelles par des tests de bout en bout, et resserrer le nombre de surfaces pour que l'ensemble reste maintenable à mesure qu'il grandit.",
        "Et surtout, approfondir ma compréhension de chaque brique au point de pouvoir la réécrire seul — c'est le vrai objectif.",
      ],
      en: [
        "Next: a task-dependency DAG (branching pipelines), formal error tracking, and explicit human-in-the-loop gates.",
        "On the interface side, replacing some of the manual checks with end-to-end tests, and tightening the number of surfaces so the whole thing stays maintainable as it grows.",
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
    metrics: [
      { value: "6", label: { fr: "présidents analysés", en: "presidents analysed" } },
      { value: "180+", label: { fr: "commits", en: "commits" } },
      { value: "2", label: { fr: "développeurs", en: "developers" } },
    ],
    tagline: {
      fr: "Analyse TF-IDF des discours d'investiture des six derniers présidents français.",
      en: "TF-IDF analysis of the inauguration speeches of France's last six presidents.",
    },
    context: {
      fr: [
        "Projet d'équipe : ce projet m'a été confié comme premier projet de programmation à l'EFREI. Le but était de comparer un corpus de discours présidentiels et permettre d'y poser des questions en français.",
        "L'enjeu était double — transformer du texte brut en quelque chose d'interrogeable, et le faire proprement à deux en découvrant les outils Git.",
      ],
      en: [
        "A team project: this project was given to me as my first programming project at EFREI. The goal was to compare a corpus of presidential speeches and let you ask it questions in French.",
        "The challenge was twofold — turn raw text into something queryable, and do it cleanly as a pair while discovering Git tools.",
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
        "L'élaboration du calcul TF-IDF afin d'obtenir des résultats pertinents et exploitables.",
      ],
      en: [
        "French text preprocessing (accents, stopwords, normalisation) and making free-text answers relevant with a plain bag-of-words.",
        "Keeping a clean shared git history across two people was a lesson in itself.",
        "Working out the TF-IDF calculation to get relevant, usable results.",
      ],
    },
    limits: {
      fr: [
        "Le TF-IDF ne capte pas le sens : synonymes et paraphrases passent à travers, et les réponses restent bornées au corpus et à la pondération choisie.",
        "La limite des délais de ce projet étant de 1 mois et demi, et le peu de connaissances en NLP, nous avons dû nous concentrer sur la mise en place d'une solution fonctionnelle plutôt que sur l'optimisation de la pertinence des réponses.",
      ],
      en: [
        "TF-IDF captures no meaning: synonyms and paraphrase slip through, and answers stay bounded to the corpus and the chosen weighting.",
        "The project deadline was 1.5 months, and our NLP knowledge was limited, so we had to focus on getting a working solution rather than optimizing answer relevance.",
      ],
    },
    learned: {
      fr: [
        "La mécanique de la vectorisation de texte, et surtout ses limites : ce que TF-IDF capte bien, ce qu'il rate, et pourquoi une réponse peut sembler juste sans vraiment l'être.",
        "L'interprétation des boucles pour remonter à la source d'un problème, puis le débogage en binôme avec un historique git propre pour garder une progression lisible.",
        "Et la discipline d'une vraie collaboration git : branches, revues, arbitrages, et le réflexe de documenter ce qu'on change pour pouvoir l'expliquer ensuite.",
      ],
      en: [
        "The mechanics of text vectorisation, and especially its limits: what TF-IDF captures well, what it misses, and why an answer can look right without truly being right.",
        "Interpreting loops to trace a problem back to its source, then pair debugging with a clean git history so the work stays readable.",
        "And the discipline of real git collaboration: branches, reviews, trade-offs, and the habit of documenting changes so they can be explained later.",
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
        "Un projet que nous avons entamé en terminal avec un camarade à moi : j'ai su apprendre à maitriser les boucles de jeu et l'empaquetage d'application en livrant un vrai petit jeu.",
      ],
      en: [
        "A project we started in 12th grade with a friend of mine: teaching myself game loops and app packaging by shipping a real small game.",
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
        "Petite envergure — mécaniques simples, peu de contenu — et pas d'architecture formelle : le projet a grandi de façon organique avec notre imagination. La capacité graphique devient assez saturée avec l'ajout de nouvelles entités animées. Le projet reste inachevé, mais j'envisage de le finir pour de bon une fois que j'aurai consolidé mes connaissances en programmation de jeux et en écriture de scénario.",
      ],
      en: [
        "Small in scope — simple mechanics, limited content — and no formal architecture: it grew organically. The graphics capacity becomes quite saturated with the addition of new animated entities. The project remains unfinished but I plan to finish it properly once I've consolidated my game programming and story-writing skills.",
      ],
    },
    learned: {
      fr: [
        "Comment une boucle de jeu et le rendu s'emboîtent réellement, puis comment synchroniser l'animation à partir de sprites PNG sans casser la logique de mouvement ou de collision.",
        "Que livrer un artefact exécutable est une compétence à part entière : empaqueter proprement les dépendances, tester le résultat final et garder une distribution utilisable.",
      ],
      en: [
        "How a game loop and rendering actually fit together, then how to sync animation from PNG sprites without breaking movement or collision logic.",
        "That shipping a runnable artifact is a skill of its own: packaging dependencies cleanly, testing the final result, and keeping the build usable.",
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
    media: [
      { type: "image", src: "/projects/web-ti402/mockup.png", alt: { fr: "Maquette du site", en: "Site mockup" } },
      { type: "image", src: "/projects/web-ti402/campus.png", alt: { fr: "Page campus du site", en: "Campus page" } },
    ],
    tagline: {
      fr: "Site multi-pages responsive réalisé pour le module web TI402 de l'EFREI.",
      en: "A responsive multi-page site built for EFREI's TI402 web module.",
    },
    context: {
      fr: [
        "Module web de l'EFREI : concevoir, construire et présenter un site structuré — de la maquette à la critique de design.",
        "L'enjeu était de passer d'une maquette à un front-end défendable, choix de design à l'appui. Ce projet a été réalisé en binôme, avec un camarade de classe.",
      ],
      en: [
        "An EFREI web module: design, build and present a structured site — from mockup to design critique.",
        "The point was to go from a mockup to a defensible front-end, design decisions and all. This project was done in a pair with a classmate.",
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
        "Tenir une mise en page responsive, sans aucun appel de librairies externes, sur plusieurs points de rupture sans framework, et structurer le JavaScript à mesure que le site grandissait.",
      ],
      en: [
        "Holding a responsive layout, without calling any external library, across breakpoints without a framework, and structuring the JavaScript as the site grew.",
      ],
    },
    limits: {
      fr: [
        "Statique, sans back-end, en stack vanilla imposée par le module. L'absence d'animation et d'accessibilité a été un choix de priorité pour livrer un site fonctionnel dans les délais et les contraintes du module imposées.",
      ],
      en: [
        "Static, no back-end, vanilla stack as the module required. The lack of animation and accessibility was a choice of priority to deliver a functional site within the module's deadlines and constraints.",
      ],
    },
    learned: {
      fr: [
        "Les fondamentaux du HTML sémantique et du CSS responsive, et comment faire évoluer une page proprement sans perdre la structure ni la lisibilité.",
        "Comment présenter puis défendre des décisions de design avec des contraintes réelles de module, de temps et de rendu final.",
      ],
      en: [
        "Semantic HTML and responsive CSS fundamentals, and how to evolve a page cleanly without losing structure or readability.",
        "How to present and defend design decisions under real module, time, and delivery constraints.",
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
