// Builds src/data/github.json for the self-updating layer.
//
// PUBLIC repos: pulled from the GitHub API (works in CI daily).
// LOCAL/PRIVATE repos (e.g. Ecosystem): stats computed from the local git clone,
//   so the repo can stay PRIVATE and never be exposed. Run `npm run fetch:github`
//   locally to refresh these; in CI (no local clone) their last snapshot is preserved
//   from the committed github.json, so public repos still auto-update daily.
//
// "Primary language" prefers actual programming languages over markup/data, so a
// Python project that also ships HTML/JSON still reads as Python.

import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "Evolve1945";
const PUBLIC_REPOS = ["Portfolio", "Chatbot", "Cyberpix", "web-done"];
const LOCAL_REPOS = [
  {
    name: "Ecosystem",
    path: "C:\\Users\\rudol\\Documents\\Claude\\Projects\\Ecosystem",
    private: true,
    url: "https://github.com/Evolve1945/Ecosystem",
  },
];

const token = process.env.GITHUB_TOKEN || process.env.PORTFOLIO_GH_TOKEN || "";
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-fetch",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const EXT_LANG = {
  ".py": "Python", ".js": "JavaScript", ".jsx": "JavaScript",
  ".ts": "TypeScript", ".tsx": "TypeScript", ".c": "C", ".h": "C",
  ".cpp": "C++", ".cs": "C#", ".java": "Java", ".go": "Go", ".rs": "Rust",
  ".rb": "Ruby", ".php": "PHP", ".html": "HTML", ".css": "CSS", ".scss": "CSS",
  ".ps1": "PowerShell", ".sh": "Shell", ".sql": "SQL",
};
// Excluded from the "primary language" pick (kept in the languages map though).
const MARKUP_DATA = new Set(["HTML", "CSS", "TeX", "Markdown", "JSON", "YAML", "Shell"]);
const DATA_DIRS = new Set([
  "logs", "data", "rag_store", "graphify-out", "__pycache__", "node_modules",
  ".git", "dist", "build", ".next", ".claude", "ethi-clo-audit",
  ".pytest_cache", "venv", ".venv",
]);
const DATA_EXT = new Set([
  ".json", ".md", ".lock", ".csv", ".txt", ".ipynb", ".yaml", ".yml",
  ".toml", ".ini", ".cfg", ".log", ".tex", ".map",
]);

function topLang(map) {
  const e = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const prog = e.find(([l]) => !MARKUP_DATA.has(l));
  return (prog || e[0] || [null])[0];
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res;
}

async function commitCount(repo, branch) {
  const res = await gh(`/repos/${OWNER}/${repo}/commits?per_page=1${branch ? `&sha=${branch}` : ""}`);
  const link = res.headers.get("link");
  if (link) {
    const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (m) return Number(m[1]);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

async function fetchPublic(repo) {
  const meta = await (await gh(`/repos/${OWNER}/${repo}`)).json();
  const languages = await (await gh(`/repos/${OWNER}/${repo}/languages`)).json();
  let commits = 0;
  try { commits = await commitCount(repo, meta.default_branch); } catch {}
  return {
    name: meta.name, description: meta.description ?? null, url: meta.html_url,
    private: false, stars: meta.stargazers_count ?? 0, forks: meta.forks_count ?? 0,
    pushedAt: meta.pushed_at ?? null, topics: meta.topics ?? [],
    languages, topLanguage: topLang(languages), commits,
  };
}

function git(path, args) {
  return execSync(`git -C "${path}" ${args}`, { encoding: "utf8", maxBuffer: 1 << 26 }).trim();
}

function localLanguages(path) {
  const files = git(path, "ls-files").split(/\r?\n/).filter(Boolean);
  const bytes = {};
  for (const f of files) {
    if (f.split("/").some((s) => DATA_DIRS.has(s))) continue;
    const ext = extname(f).toLowerCase();
    if (DATA_EXT.has(ext)) continue;
    const lang = EXT_LANG[ext];
    if (!lang) continue;
    try { bytes[lang] = (bytes[lang] || 0) + statSync(join(path, ...f.split("/"))).size; } catch {}
  }
  return bytes;
}

function fetchLocal(r) {
  const commits = Number(git(r.path, "rev-list --count HEAD")) || 0;
  const pushedAt = git(r.path, "log -1 --format=%cI") || null;
  const languages = localLanguages(r.path);
  return {
    name: r.name, description: null, url: r.url, private: true,
    stars: 0, forks: 0, pushedAt, topics: [],
    languages, topLanguage: topLang(languages), commits,
  };
}

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const dest = join(here, "..", "src", "data", "github.json");
  const prev = existsSync(dest) ? JSON.parse(readFileSync(dest, "utf8")).repos ?? {} : {};

  const repos = {};
  const errors = [];

  for (const repo of PUBLIC_REPOS) {
    try {
      repos[repo] = await fetchPublic(repo);
      console.log(`ok (public): ${repo} (${repos[repo].commits} commits, ${repos[repo].topLanguage})`);
    } catch (e) {
      if (prev[repo]) { repos[repo] = prev[repo]; console.log(`kept previous: ${repo}`); }
      else errors.push(`${repo}: ${e.message}`);
    }
  }

  for (const r of LOCAL_REPOS) {
    if (existsSync(r.path)) {
      try {
        repos[r.name] = fetchLocal(r);
        console.log(`ok (local): ${r.name} (${repos[r.name].commits} commits, ${repos[r.name].topLanguage})`);
      } catch (e) {
        if (prev[r.name]) { repos[r.name] = prev[r.name]; console.log(`kept previous: ${r.name}`); }
        else errors.push(`${r.name}: ${e.message}`);
      }
    } else if (prev[r.name]) {
      repos[r.name] = prev[r.name];
      console.log(`kept previous (no local clone): ${r.name}`);
    } else {
      errors.push(`${r.name}: local clone not found at ${r.path}`);
    }
  }

  const list = Object.values(repos);
  const langTotals = {};
  for (const r of list) for (const [l, b] of Object.entries(r.languages || {})) langTotals[l] = (langTotals[l] || 0) + b;

  const totals = {
    repos: list.length,
    commits: list.reduce((s, r) => s + (r.commits || 0), 0),
    topLanguage: topLang(langTotals),
    lastActive: list.map((r) => r.pushedAt).filter(Boolean).sort().at(-1) ?? null,
  };

  const out = { generatedAt: new Date().toISOString(), user: OWNER, authenticated: Boolean(token), totals, repos, errors };
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nwrote ${dest}\n  ${totals.repos} repos · ${totals.commits} commits · primary ${totals.topLanguage}`);
  if (errors.length) for (const e of errors) console.log(`  ! ${e}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
