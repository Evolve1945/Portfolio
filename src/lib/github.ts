import data from "@/data/github.json";

export interface RepoStats {
  name: string;
  description: string | null;
  url: string;
  private?: boolean;
  stars: number;
  forks: number;
  pushedAt: string | null;
  topics: string[];
  languages: Record<string, number>;
  topLanguage: string | null;
  commits: number;
}

export interface GithubData {
  generatedAt: string | null;
  user: string;
  authenticated: boolean;
  totals: {
    repos: number;
    commits: number;
    topLanguage: string | null;
    lastActive: string | null;
  };
  repos: Record<string, RepoStats>;
  errors: string[];
}

// Static import — regenerated daily by scripts/fetch-github.mjs and committed in CI,
// so pages are fast and never hit the GitHub API at request time.
const github = data as GithubData;

export function getGithub(): GithubData {
  return github;
}

export function getRepoStats(repo?: string): RepoStats | null {
  if (!repo) return null;
  return github.repos[repo] ?? null;
}
