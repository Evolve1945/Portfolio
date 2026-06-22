// Curated digital-garden sync. Reads ONLY the notes listed in
// content/garden.config.json from the Obsidian vault, sanitises them, resolves
// [[wikilinks]], builds backlinks, and writes them to content/notes/ for the site.
// The vault stays the source of truth; nothing else is published.
//
// Run locally with `npm run sync:notes` after editing the list, then commit the
// generated content/notes/ (the Vercel build has no access to the vault).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const config = JSON.parse(
  readFileSync(join(root, "content", "garden.config.json"), "utf8"),
);
const outDir = join(root, "content", "notes");

// Defensive: never publish a note that looks like it contains a credential.
const SECRET = /sk-(ant|proj)-[A-Za-z0-9_-]{20}|AIza[0-9A-Za-z_-]{30}|xox[baprs]-[A-Za-z0-9-]{20}/;
// Strip emojis to honour the site's no-emoji / icons-only rule.
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{200D}]/gu;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const stripFrontmatter = (raw) => {
  if (!raw.startsWith("---")) return { body: raw, tags: [] };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { body: raw, tags: [] };
  const fm = raw.slice(3, end);
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  const tagMatch = fm.match(/tags:\s*\[([^\]]*)\]/);
  const tags = tagMatch
    ? tagMatch[1].split(",").map((t) => t.trim().replace(/['"]/g, "")).filter(Boolean)
    : [];
  return { body, tags };
};

function resolveNote(relPath) {
  const full = join(config.vaultPath, ...relPath.split(/[\\/]/));
  if (!existsSync(full)) return { error: `not found: ${relPath}` };
  const raw = readFileSync(full, "utf8");
  if (SECRET.test(raw)) return { error: `SKIPPED (possible secret): ${relPath}` };

  const { body, tags } = stripFrontmatter(raw);
  const fileName = basename(relPath).replace(/\.md$/i, "");
  const h1 = body.match(/^#\s+(.+)$/m);
  const title = (h1 ? h1[1] : fileName).replace(EMOJI, "").trim();
  const parts = relPath.split(/[\\/]/);
  const group = parts.length > 1 ? parts[parts.length - 2] : "Notes";

  return { relPath, fileName, title, slug: slugify(title), group, tags, body };
}

// Pass 1 — resolve all notes and build lookup maps for wikilink resolution.
const resolved = [];
const errors = [];
for (const rel of config.notes) {
  const r = resolveNote(rel);
  if (r.error) errors.push(r.error);
  else resolved.push(r);
}

const byFile = new Map();
const byTitle = new Map();
for (const n of resolved) {
  byFile.set(n.fileName.toLowerCase(), n.slug);
  byTitle.set(n.title.toLowerCase(), n.slug);
}

// Pass 2 — sanitise bodies, resolve [[wikilinks]], collect outbound links.
function processBody(n) {
  const links = new Set();
  let body = n.body
    .replace(/^#\s+.+$/m, "") // drop the leading H1 (rendered as the page title)
    .replace(EMOJI, "");

  body = body.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const [target, alias] = inner.split("|");
    const label = (alias || target).trim();
    const tail = target.split(/[/#]/).pop().trim().toLowerCase();
    const slug = byFile.get(tail) || byTitle.get(tail);
    if (slug) {
      links.add(slug);
      return `[${label}](/notes/${slug})`;
    }
    return label; // not published → plain text, no dead link
  });

  // Collapse whitespace left by stripped emojis.
  body = body.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  const firstPara =
    body
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("|")) || "";
  const summary =
    firstPara.replace(/[*_`[\]]/g, "").slice(0, 180) +
    (firstPara.length > 180 ? "…" : "");

  return { body, links: [...links], summary };
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const index = [];
for (const n of resolved) {
  const { body, links, summary } = processBody(n);
  writeFileSync(join(outDir, `${n.slug}.md`), body + "\n");
  index.push({
    slug: n.slug,
    title: n.title,
    summary,
    group: n.group,
    tags: n.tags,
    links,
    backlinks: [],
  });
}

// Backlinks.
for (const note of index) {
  note.backlinks = index.filter((o) => o.links.includes(note.slug)).map((o) => o.slug);
}

writeFileSync(join(outDir, "_index.json"), JSON.stringify(index, null, 2) + "\n");

console.log(`Published ${index.length} note(s) to content/notes/`);
for (const n of index) console.log(`  - ${n.title}  (/notes/${n.slug})`);
if (errors.length) {
  console.log(`\n${errors.length} skipped:`);
  for (const e of errors) console.log(`  ! ${e}`);
}
