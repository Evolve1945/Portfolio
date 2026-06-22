// Fetches public GitHub data for the allowlisted repos and writes src/data/github.json.
// No npm dependencies (uses global fetch). Runs locally via `npm run fetch:github`
// and daily in CI (.github/workflows/refresh.yml).
//
// Auth: uses GITHUB_TOKEN or PORTFOLIO_GH_TOKEN if present (higher rate limit and
// access to private-repo metadata). Works unauthenticated for public repos too.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "Evolve1945";
// Curated allowlist — keep in sync with the `repo` fields in src/data/projects.ts.
const REPOS = ["Ecosystem", "Chatbot", "Cyberpix", "web-done"];

const token =
  process.env.GITHUB_TOKEN || process.env.PORTFOLIO_GH_TOKEN || "";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "portfolio-fetch",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${path}`);
  }
  return res;
}

// Trick: with per_page=1, the Link header's rel="last" page number equals the
// total commit count — one request instead of paginating the whole history.
async function commitCount(repo, branch) {
  const res = await gh(
    `/repos/${OWNER}/${repo}/commits?per_page=1${branch ? `&sha=${branch}` : ""}`,
  );
  const link = res.headers.get("link");
  if (link) {
    const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (m) return Number(m[1]);
  }
  const data = await res.json();
  return Array.isArray(data) ? data.length : 0;
}

async function fetchRepo(repo) {
  const meta = await (await gh(`/repos/${OWNER}/${repo}`)).json();
  const languages = await (await gh(`/repos/${OWNER}/${repo}/languages`)).json();

  let commits = 0;
  try {
    commits = await commitCount(repo, meta.default_branch);
  } catch {
    /* leave at 0 if the commits endpoint is unavailable */
  }

  const topLanguage =
    Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    meta.language ??
    null;

  return {
    name: meta.name,
    description: meta.description ?? null,
    url: meta.html_url,
    stars: meta.stargazers_count ?? 0,
    forks: meta.forks_count ?? 0,
    pushedAt: meta.pushed_at ?? null,
    topics: meta.topics ?? [],
    languages,
    topLanguage,
    commits,
  };
}

async function main() {
  const repos = {};
  const errors = [];

  for (const repo of REPOS) {
    try {
      repos[repo] = await fetchRepo(repo);
      console.log(
        `ok: ${repo} (${repos[repo].commits} commits, ${repos[repo].topLanguage})`,
      );
    } catch (e) {
      errors.push(`${repo}: ${e.message}`);
      console.warn(`skip: ${repo} — ${e.message}`);
    }
  }

  const list = Object.values(repos);
  const langTotals = {};
  for (const r of list) {
    for (const [lang, bytes] of Object.entries(r.languages)) {
      langTotals[lang] = (langTotals[lang] || 0) + bytes;
    }
  }
  const topLanguage =
    Object.entries(langTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const totals = {
    repos: list.length,
    commits: list.reduce((s, r) => s + (r.commits || 0), 0),
    topLanguage,
    lastActive:
      list
        .map((r) => r.pushedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
  };

  const out = {
    generatedAt: new Date().toISOString(),
    user: OWNER,
    authenticated: Boolean(token),
    totals,
    repos,
    errors,
  };

  const here = dirname(fileURLToPath(import.meta.url));
  const dest = join(here, "..", "src", "data", "github.json");
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, JSON.stringify(out, null, 2) + "\n");

  console.log(
    `\nwrote ${dest}\n  ${totals.repos} repos · ${totals.commits} commits · top language ${topLanguage}`,
  );
  if (errors.length) console.log(`  ${errors.length} repo(s) skipped`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
