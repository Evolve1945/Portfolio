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
  /** Collaborator credit with an optional profile link (e.g. a school-project teammate). */
  credit?: { name: string; url?: string };
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
      { value: "23", label: { fr: "agents spécialisés", en: "specialised agents" } },
      { value: "3", label: { fr: "modèles, avec bascule", en: "models, with failover" } },
      { value: "9", label: { fr: "collections mémoire (RAG)", en: "RAG memory collections" } },
      { value: "35", label: { fr: "vues du tableau de bord", en: "dashboard views" } },
    ],
    media: [
      {
        type: "image",
        src: "/projects/ecosystem/dashboard-home.png",
        alt: {
          fr: "Le tableau de bord de supervision — santé de la flotte, niveau d'autonomie, coût, et un flux en direct de ce que fait chaque agent.",
          en: "The supervision dashboard — fleet health, autonomy level, spend, and a live feed of what each agent is doing.",
        },
      },
      {
        type: "image",
        src: "/projects/ecosystem/agents-skills.png",
        alt: {
          fr: "Le parc d'agents — 23 agents spécialisés, chacun avec son modèle et ses compteurs de tokens, de coût et d'erreurs, ainsi que le registre de compétences.",
          en: "The agent roster — 23 specialised agents, each with its own model and its own token, cost and error counters, plus the skill registry.",
        },
      },
      {
        type: "image",
        src: "/projects/ecosystem/agent-mesh.png",
        alt: {
          fr: "Le mesh d'agents — les 23 agents joignables, chacun sur son propre port local avec son modèle, l'état de son disjoncteur et son usage.",
          en: "The agent mesh — all 23 agents reachable, each on its own local port with its model, circuit-breaker state and usage.",
        },
      },
      {
        type: "image",
        src: "/projects/ecosystem/trust-monitor-privacy.png",
        alt: {
          fr: "La politique de confidentialité du trust monitor — chaque catégorie de données (notes, code, tâches…) est réglée sur « cloud autorisé » ou « local uniquement ».",
          en: "The trust monitor's privacy policy — each data category (notes, code, tasks…) is set to cloud-allowed or local-only, so sensitive data can stay on the machine.",
        },
      },
      {
        type: "image",
        src: "/projects/ecosystem/knowledge-graph.png",
        alt: {
          fr: "Le graphe de connaissances Graphify du code — plus de 3 800 nœuds et 8 000 liens regroupés en 217 communautés détectées.",
          en: "The Graphify knowledge graph of the codebase — 3,800+ nodes and 8,000+ edges grouped into 217 detected communities.",
        },
      },
      {
        type: "image",
        src: "/projects/ecosystem/knowledge-graph-full.png",
        alt: {
          fr: "Le graphe de connaissances en plein écran — des grappes denses de modules très liés se détachent des bords plus épars.",
          en: "The knowledge graph full-screen — dense clusters of tightly-linked modules stand out from the sparser edges.",
        },
      },
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
        "L'idée était de simplifier l'organisation d'un projet et de rendre le développement plus rapide et plus fiable : je garde la main sur l'architecture et les tâches les plus lourdes, et je personnalise l'IA à mes propres besoins et outils plutôt que d'accepter ses limites par défaut.",
        "L'autre enjeu était de me mettre en situation réelle d'ingénieur : concevoir un système dont les différentes parties doivent tenir ensemble dans la durée, plutôt que de simplement faire fonctionner une démonstration une fois.",
      ],
      en: [
        "I wanted always-on AI infrastructure that could act independently, restart itself and keep a memory — not a script you launch by hand.",
        "The point was never a demo: it was to treat reliability, cost and memory as first-class constraints, the way a real production system has to.",
        "The idea was to simplify how a project is organised and make development faster and more reliable: I keep control of the architecture and the heaviest tasks, and I shape the AI to my own needs and tools rather than accept its defaults.",
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
        "Deux points ont encore compliqué cette refonte : le polling des serveurs du mesh était silencieusement bloqué par CORS côté navigateur — les cartes restaient vides sans erreur, j'ai donc ajouté un proxy côté serveur pour faire remonter leur santé dans les deux interfaces — et la mise au point s'est faite par vagues de corrections guidées par des captures d'écran (aligner les colonnes, formater les résultats, réparer les graphiques) plutôt que par des tests classiques, jusqu'à zéro erreur console sur tous les onglets.",
      ],
      en: [
        "Rate limits and API outages pushed me to build the multi-model failover chain instead of stopping at the first 429.",
        "Keeping it standing without me watching forced the watchdog (retries with backoff, alerts) and writing down strict rules; keeping context across tasks forced the RAG layer, along with a search inside the Obsidian vault before proceeding with a task.",
        "The hardest part was rebuilding the dashboard (V2) with a brand-new design: the first version covered only about 8 of 34 views, so everything had to be re-wired up to full parity (35 views) on the same API, in a new two-theme visual language. Reconnecting each view to its data without breaking what already worked was slow, painstaking work.",
        "Two more things complicated the rebuild: polling the mesh servers was silently blocked by CORS in the browser — cards just stayed empty with no error, so I added a server-side proxy to surface their health in both UIs — and the fine-tuning came in waves of screenshot-driven fixes (aligning columns, formatting task results, repairing charts) rather than classic tests, down to zero console errors across every tab.",
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
        "J'ai appris à répartir les responsabilités entre agents et modules et à découper un problème complexe en sous-problèmes plus simples — et que les limites de l'IA peuvent presque toujours se contourner en s'y attaquant de front plutôt qu'en attendant que l'outil progresse.",
        "J'ai aussi appris à faire dialoguer un backend et une interface riche : contrats d'API stables, gestion des états d'échec côté client (fail-open, pour qu'une carte reste utilisable même si un service tombe), et l'importance de vérifier ce qui s'affiche réellement — la revue par captures d'écran a rattrapé des erreurs qu'aucun test unitaire n'aurait vues.",
      ],
      en: [
        "The real lessons are distributed-systems patterns under failure — retries, circuit breakers, queues, idempotency — and why they exist.",
        "Running something continuously costs an attention no tutorial shows you.",
        "I learned to divide responsibilities between agents and modules and to break a complex problem into simpler sub-problems — and that AI's limits can almost always be worked around by tackling them head-on rather than waiting for the tool to improve.",
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
        "Projet d'équipe de première année, pour le module Programmation en Python de l'EFREI (fin 2023). La consigne des enseignants était volontairement ciblée : classer et répondre à des questions sur un corpus de discours d'investiture de présidents français avec TF-IDF, et se heurter en pratique aux limites de la méthode — un premier regard concret sur le fonctionnement d'un système de recherche, au moment où l'IA devenait un sujet grand public.",
        "C'était mon premier projet avec Git et la première fois que j'avais à écrire et organiser autant de code à deux. L'algorithme TF-IDF nous a été fourni et expliqué ; il fallait le transcrire en Python pur — sans aucune librairie — et trouver nous-mêmes comment câbler les fonctions entre elles. J'ai surtout piloté les décisions : répartir le travail selon les forces de chacun, garder nos structures de données compatibles, et fusionner nos branches respectives dans la branche principale.",
      ],
      en: [
        "A first-year team project for EFREI's Programming in Python module (late 2023). The teachers set it deliberately: rank and answer questions over a corpus of French presidential inauguration speeches with TF-IDF, and hit the method's limits first-hand — a concrete first look at how a simple retrieval system works, just as AI was becoming a mainstream topic.",
        "It was my first project with Git and the first time I had to write and organise this much code with someone else. We were handed the TF-IDF algorithm and had to transcribe it to pure Python — no libraries — and work out how to wire the functions together ourselves. I mostly drove the decisions: splitting the work by each person's strengths, keeping our data structures compatible, and merging our separate branches into main.",
      ],
    },
    built: {
      fr: [
        "Un classement des mots par TF-IDF, la mise en évidence des thèmes communs et distinctifs, et des réponses tirées du corpus — une phrase, un paragraphe ou un score selon l'option choisie dans le menu.",
        "Le tout construit avec un binôme sur plus de 180 commits — branches séparées et historique partagé.",
      ],
      en: [
        "Word ranking by TF-IDF, surfacing of shared and distinctive themes, and answers drawn from the corpus — a sentence, a paragraph, or a score depending on the menu option.",
        "All built with a classmate across 180+ commits — separate branches and a shared history.",
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
        "Le TF-IDF capte la fréquence des mots, pas le sens : synonymes et paraphrases passent à travers, et chaque réponse reste bornée au petit corpus fourni et à la pondération choisie. Le temps de calcul croît aussi avec la longueur du texte. Son déterminisme est à la fois une force et une limite : la sortie est entièrement prévisible — précisément ce qu'un LLM abandonne.",
        "Les délais étaient serrés : nous avons livré la méthode de base et laissé de côté les objectifs bonus (un menu plus riche et une fonctionnalité au-delà du TF-IDF), sans le temps de tester d'autres approches ; même préparer le texte brut pour le rendre exploitable a demandé un vrai travail en amont.",
        "C'est un projet de début de parcours — l'affichage des résultats en est le point le plus faible, et certaines parties du code, je les écrirais autrement aujourd'hui. Je le garde comme un repère honnête de mes débuts.",
      ],
      en: [
        "TF-IDF captures word frequency, not meaning: synonyms and paraphrase slip straight through, and every answer stays bounded to the small provided corpus and the weighting we chose. Its runtime also grows with the length of the text. Its determinism is a strength and a limit at once: the output is entirely predictable — exactly what an LLM trades away.",
        "The deadline was tight: we shipped the core method and set aside the bonus objectives (a richer menu and a feature beyond TF-IDF), with no time to test alternative approaches; even preparing the raw text into a usable form took real work up front.",
        "It's an early project — the result display is its weakest part, and some of the code I'd write differently today. I keep it as an honest marker of where I started.",
      ],
    },
    learned: {
      fr: [
        "La mécanique de la vectorisation de texte, et surtout ses limites : ce que TF-IDF capte bien, ce qu'il rate, et pourquoi une réponse peut sembler juste sans vraiment l'être.",
        "L'interprétation des boucles pour remonter à la source d'un problème, puis le débogage en binôme avec un historique git propre pour garder une progression lisible.",
        "Et la discipline d'une vraie collaboration git : branches, arbitrages, et le réflexe de documenter ce qu'on change pour pouvoir l'expliquer ensuite.",
      ],
      en: [
        "The mechanics of text vectorisation, and especially its limits: what TF-IDF captures well, what it misses, and why an answer can look right without truly being right.",
        "Interpreting loops to trace a problem back to its source, then pair debugging with a clean git history so the work stays readable.",
        "And the discipline of real git collaboration: branches, trade-offs, and the habit of documenting changes so they can be explained later.",
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
    year: "2022",
    theme: "creative",
    complexity: "foundational",
    repo: "Cyberpix",
    tags: ["Python", "Pygame", "2D game", "Packaging"],
    featured: true,
    credit: {
      name: "William Miserolle",
      url: "https://www.linkedin.com/in/william-miserolle/",
    },
    tagline: {
      fr: "Un jeu de plateforme et de tir cyberpunk 2D en Python, inachevé, réalisé pour un cours de NSI — empaqueté et fonctionnel, que je veux encore terminer.",
      en: "An unfinished 2D cyberpunk platformer-shooter in Python, made for an NSI class — packaged and running, and one I still want to finish.",
    },
    context: {
      fr: [
        "Un jeu que nous avons commencé en décembre 2022 pour notre cours de NSI en terminale — la consigne était simplement « faire un jeu ». Nous sommes partis sur un univers cyberpunk en 2D (pixel-art, néon, tons bleutés), inspiré de Cyberpunk, de Mario et des jeux de plateforme classiques, que nous avons appelé Cyberpix.",
        "Le pitch : on incarne un mercenaire qui s'attaque aux mégacorpos — lesquelles lui envoient d'autres mercenaires — tout en cherchant à découvrir ce qui est arrivé à sa famille, avant de rejoindre les rebelles. Mon ami William Miserolle a eu l'idée du genre et a écrit la majeure partie du code ; j'étais ravi de faire un jeu mais plus faible en programmation, alors j'ai piloté le design, l'histoire et la direction visuelle, et j'ai repris un peu la partie développement l'année suivante. Le mérite du code lui revient en grande partie.",
      ],
      en: [
        "A game we started in December 2022 for our NSI class in terminale — the brief was simply 'make a game.' We went for a 2D cyberpunk world (pixel-art, neon, blue-lit), inspired by Cyberpunk, Mario and classic platformers, and named it Cyberpix.",
        "The premise: you play a mercenary taking on the megacorps that keep sending others after you, while trying to uncover what happened to your family — eventually joining the rebels. My friend William Miserolle came up with the genre and wrote most of the code; I was thrilled to be making a game but weaker at coding, so I led the design, the story and the visual direction, and picked up a little of the dev myself the year after. Credit for the build is mostly his.",
      ],
    },
    built: {
      fr: [
        "Un jeu de plateforme et de tir cyberpunk 2D — néon, pixelisé, tons bleutés. Ce qui tourne aujourd'hui, c'est le personnage principal qui se déplace dans la scène (déplacement, saut, dash, coup de pied, frappe) avec des sprites animés, sur pygame et tkinter, avec une boucle de jeu basée sur les images, une animation par feuilles de sprites et une classe par entité.",
        "Le tout est empaqueté en exécutable Windows autonome qui tourne proprement sur une autre machine. Les sprites pixel-art proviennent d'itch.io, ils ne sont pas de nous. William Miserolle a écrit la majeure partie du code et assuré le débogage — dont la synchronisation de l'horloge de jeu, la partie la plus délicate ; j'ai piloté le design, l'histoire et la direction visuelle, et repris un peu le développement l'année suivante.",
      ],
      en: [
        "A 2D cyberpunk platformer-shooter — neon, pixelated, blue-lit. What runs today is the player character moving across the scene (move, jump, dash, kick, hit) with animated sprites, built on pygame and tkinter with a frame-based game loop, sprite-sheet animation, and a class per entity.",
        "It's bundled into a standalone Windows executable that runs cleanly on another machine. The pixel-art sprites are sourced from itch.io, not made by us. William Miserolle wrote most of the code and handled the debugging — including the game-clock timing, the hardest part; I led the design, the story and the visual direction, and picked up a little of the dev the following year.",
      ],
    },
    challenges: {
      fr: [
        "Obtenir une boucle de jeu et un timing d'images corrects — la synchronisation de l'horloge de jeu a été le problème le plus difficile, résolu par William —, gérer les entrées clavier-souris, câbler l'animation par feuilles de sprites, puis empaqueter Python et ses dépendances en un seul exécutable.",
      ],
      en: [
        "Getting the game loop and frame timing right — the game-clock sync was the single hardest problem, which William cracked — handling keyboard-and-mouse input, wiring sprite-sheet animation, then bundling Python and its dependencies into a single executable.",
      ],
    },
    limits: {
      fr: [
        "Il est inachevé — vraiment une première version. Aujourd'hui, on le lance et le personnage principal bouge (déplacement, saut, dash, coup de pied, frappe) avec des sprites animés, mais il n'y a encore ni ennemis, ni niveaux, ni armes, ni plateformes, ni menu, et le jeu démarre dézoomé et brut.",
        "Le seul vrai mur technique a été la performance : le mouvement aléatoire de chaque asset utilisait un random.randint sur un très grand intervalle à chaque image, à 60 fps ; ajouter des assets faisait exploser les calculs par image, saturant la RAM et faisant chuter le framerate. Le correctif propre — que je ferais lors d'une reprise — est de pré-générer ces nombres dans un fichier et de simplement les lire à l'exécution. Il n'y avait pas non plus d'architecture formelle : une classe par entité, mais beaucoup de code entassé dans un même fichier, développé de façon organique.",
        "C'était un projet scolaire sans Git (on le partageait via un Drive et on suivait les tâches sur un tableau kanban), tournant sur l'ordinateur de William. Ce qui l'a vraiment arrêté, c'est que le finir ne dépend plus que de moi — et le niveau, le temps, l'expérience et la motivation ont manqué. J'aimerais quand même le terminer correctement un jour.",
      ],
      en: [
        "It's unfinished — very much a first version. Today you launch it and the main character moves (move, jump, dash, kick, hit) with sprites animating, but there are no enemies, levels, weapons, platforms or menu yet, and it starts un-zoomed and rough.",
        "The one real technical wall was performance: each asset's random motion used a random.randint over a huge range every frame at 60 fps, so adding assets made the per-frame maths explode, saturating RAM and dropping the frame-rate. The clean fix — which I'd do on a rebuild — is to pre-generate those numbers into a file and just read them at runtime. There was no formal architecture either: a class per entity, but a lot of code piled into one file, grown organically.",
        "It was a school project with no Git (we shared it over a Drive and tracked tasks on a kanban board) and it ran on William's computer. What really stalled it is that finishing it now rests on me alone — and skill, time, experience and motivation all ran short. I'd still like to finish it properly one day.",
      ],
    },
    learned: {
      fr: [
        "Comment une boucle de jeu et le rendu s'emboîtent réellement, puis comment synchroniser l'animation à partir de sprites PNG sans casser la logique de mouvement.",
        "Que livrer un artefact exécutable est une compétence à part entière : empaqueter proprement les dépendances, tester le résultat final et garder une distribution utilisable.",
      ],
      en: [
        "How a game loop and rendering actually fit together, then how to sync animation from PNG sprites without breaking the movement logic.",
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
