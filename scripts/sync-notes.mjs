// Curated digital-garden sync. Publishes every .md under the `include` folders in
// content/garden.config.json, MINUS excluded dirs/files and anything flagged by the
// content scan (credentials or personal/financial keywords). Sanitises notes
// (frontmatter + emojis), resolves [[wikilinks]], builds backlinks, and writes them
// to content/notes/. The vault stays the source of truth.
//
// Run locally with `npm run sync:notes`, then commit content/notes/ (the Vercel build
// has no access to the vault).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const config = JSON.parse(readFileSync(join(root, "content", "garden.config.json"), "utf8"));
const outDir = join(root, "content", "notes");

const SECRET = /sk-(ant|proj)-[A-Za-z0-9_-]{20}|AIza[0-9A-Za-z_-]{30}|xox[baprs]-[A-Za-z0-9-]{20}/;
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu;

const excludeDirs = new Set((config.excludeDirs || []).map((s) => s.toLowerCase()));
const excludeFiles = new Set((config.excludeFiles || []).map((s) => s.toLowerCase()));
const sensitive = (config.sensitiveKeywords || []).map((s) => s.toLowerCase());

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Strip local machine/user paths so the garden never leaks a username or the
// on-disk layout. Escaped (JSON/code `C:\\Users\\name\\`) is handled before the
// raw form; POSIX home paths collapse too. The rest of the path (project names)
// is kept for readability.
// Drop internal task-tracking codes from note titles so the public garden reads
// cleanly (e.g. "Dashboard V2 (P91)" -> "Dashboard V2", "Schema Models (Task 103)"
// -> "Schema Models"). Descriptive parentheticals like "(Obsidian)" are kept.
function cleanTitle(t) {
  return t
    .replace(/\s*\((?:P\d+|Task\s*\d+)(?:\s*[·,•]\s*[A-Za-z]*\d+)*\)/gi, "")
    .replace(/\s*\+\s*Karpathy rules/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizePaths(s) {
  return s
    .replace(/[A-Za-z]:\\{2}Users\\{2}[^\\"\s]+\\{2}/g, "~\\\\")
    .replace(/[A-Za-z]:\\Users\\[^\\/"\s]+\\/g, "~\\")
    .replace(/\/(?:home|Users)\/[^/"\s]+\//g, "~/");
}

function stripFrontmatter(raw) {
  if (!raw.startsWith("---")) return { body: raw, tags: [] };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { body: raw, tags: [] };
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  const m = fm.match(/tags:\s*\[([^\]]*)\]/);
  const tags = m
    ? m[1].split(",").map((t) => t.trim().replace(/['"]/g, "")).filter(Boolean)
    : [];
  return { body, tags };
}

// 1. Collect candidates from include folders + explicit includeFiles (deduped).
const seen = new Set();
const candidates = [];
const add = (rel, full) => {
  const key = rel.toLowerCase();
  if (!seen.has(key) && existsSync(full)) { seen.add(key); candidates.push({ rel, full }); }
};
for (const inc of config.include || []) {
  const base = join(config.vaultPath, ...inc.split(/[\\/]/));
  if (!existsSync(base)) continue;
  for (const rel of readdirSync(base, { recursive: true })) {
    const relStr = String(rel);
    if (extname(relStr).toLowerCase() !== ".md") continue;
    add(`${inc}/${relStr.replace(/\\/g, "/")}`, join(base, relStr));
  }
}
for (const rel of config.includeFiles || []) {
  add(rel.replace(/\\/g, "/"), join(config.vaultPath, ...rel.split(/[\\/]/)));
}

// 2. Filter by excludes + content scan.
const resolved = [];
const skipped = [];
for (const c of candidates) {
  const segs = c.rel.split("/");
  if (segs.some((s) => excludeDirs.has(s.toLowerCase()))) continue;
  if (excludeFiles.has(basename(c.rel).toLowerCase())) continue;

  const raw = readFileSync(c.full, "utf8");
  const lower = raw.toLowerCase();
  if (SECRET.test(raw)) { skipped.push(`${c.rel} — possible credential`); continue; }
  const hit = sensitive.find((k) => lower.includes(k));
  if (hit) { skipped.push(`${c.rel} — sensitive keyword "${hit}"`); continue; }

  const { body, tags } = stripFrontmatter(raw);
  if (body.replace(EMOJI, "").trim().length < 600) { skipped.push(`${c.rel} — too short (stub)`); continue; }
  const fileName = basename(c.rel).replace(/\.md$/i, "");
  const h1 = body.match(/^#\s+(.+)$/m);
  const title = cleanTitle((h1 ? h1[1] : fileName).replace(EMOJI, "").trim());
  const group = segs[0] === "Claude-Ecosystem" ? segs[1] : segs[0];
  resolved.push({ rel: c.rel, fileName, title, group, tags, body });
}

// 3. Assign unique slugs; build lookup maps for wikilinks.
const used = new Set();
for (const n of resolved) {
  let slug = slugify(n.title) || slugify(n.fileName);
  let i = 2;
  while (used.has(slug)) slug = `${slugify(n.title)}-${i++}`;
  used.add(slug);
  n.slug = slug;
}
const byFile = new Map();
const byTitle = new Map();
for (const n of resolved) {
  if (!byFile.has(n.fileName.toLowerCase())) byFile.set(n.fileName.toLowerCase(), n.slug);
  if (!byTitle.has(n.title.toLowerCase())) byTitle.set(n.title.toLowerCase(), n.slug);
}

function processBody(n) {
  const links = new Set();
  let body = n.body.replace(/^#\s+.+$/m, "").replace(EMOJI, "");
  body = body.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, alias] = inner.split("|");
    const label = (alias || target).trim();
    const tail = target.split(/[/#]/).pop().trim().toLowerCase();
    const slug = byFile.get(tail) || byTitle.get(tail);
    if (slug && slug !== n.slug) { links.add(slug); return `[${label}](/notes/${slug})`; }
    return label;
  });
  body = sanitizePaths(body);
  body = body.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const firstPara =
    body.split("\n").map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("|") && !l.startsWith("-")) || "";
  const summary = firstPara.replace(/[*_`[\]]/g, "").slice(0, 180) + (firstPara.length > 180 ? "…" : "");
  return { body, links: [...links], summary };
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const index = [];
for (const n of resolved) {
  const { body, links, summary } = processBody(n);
  writeFileSync(join(outDir, `${n.slug}.md`), body + "\n");
  index.push({ slug: n.slug, title: n.title, summary, group: n.group, tags: n.tags, links, backlinks: [] });
}
for (const note of index) {
  note.backlinks = index.filter((o) => o.links.includes(note.slug)).map((o) => o.slug);
}
index.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
writeFileSync(join(outDir, "_index.json"), JSON.stringify(index, null, 2) + "\n");

console.log(`Published ${index.length} note(s):`);
const byGroup = {};
for (const n of index) (byGroup[n.group] = byGroup[n.group] || []).push(n.title);
for (const [g, list] of Object.entries(byGroup)) console.log(`  [${g}] ${list.length}`);
if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} (review if any should be public):`);
  for (const s of skipped) console.log(`  ! ${s}`);
}
