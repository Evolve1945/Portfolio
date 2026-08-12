// Single source of truth for profile constants used across the site.
// NOTE: public email defaulted to the address in Rudolf's profile drafts — change if preferred.
export const site = {
  name: "Rudolf Krylov",
  initials: "RK",
  role: {
    fr: "Étudiant ingénieur · EFREI Paris",
    en: "Computer-engineering student · EFREI Paris",
  },
  email: "rudolfkrylov.pro@gmail.com",
  github: "Evolve1945",
  githubUrl: "https://github.com/Evolve1945",
  linkedin: "https://www.linkedin.com/in/rudolf-krylov",
  // Portfolio repo URL — update once the repo is pushed.
  repoUrl: "https://github.com/Evolve1945",
  // Public site URL — change to your custom domain when you have one.
  url: "https://rudolf-krylov.vercel.app",
} as const;
