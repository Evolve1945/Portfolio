# Portfolio — your task list

Things only you can do, or should decide. Each says **which file** to edit and **how to apply** it.
After editing data/config, re-run the relevant command and refresh the dev server (`npm run dev`).

---

## 1. GitHub repos (live data)
- DONE: `Ecosystem` stays **private** — its stats (commits, Python, last-active) are read from your **local clone**, never the public API. `web-done` / `Chatbot` / `Cyberpix` are public. Primary language now reads **Python**.
- [ ] To refresh Ecosystem's numbers after you work on it, run `npm run fetch:github` **locally** (daily CI keeps the public repos fresh and preserves Ecosystem's last local snapshot).
- [ ] Repos counted live in **`scripts/fetch-github.mjs`** (`PUBLIC_REPOS` / `LOCAL_REPOS`) — edit if you add projects.

## 2. Digital garden (which vault notes are public)
- DONE: **18 curated** feature/guide/architecture notes published. Sensitive folders (`Income-Plan`, `Security`, `sessions`, `errors`, `Audits`) are excluded; a content scan also skips anything with credentials or personal/financial keywords.
- [ ] **Before deploy, skim the list** in `content/notes/_index.json`. To change it, edit `includeFiles` in **`content/garden.config.json`** (remove a path, or add from the ~100 vault feature notes), then `npm run sync:notes` and commit `content/notes/`.

## 3. Skills / RNCP
- [ ] Drop your **EFREI RNCP sheet** in `content/intake/rncp/` (PDF/DOCX/image/text) and tell me — I'll fill the competency blocks. OR
- [ ] Fill them yourself in **`src/data/skills.ts`**: replace each `rncpBlock: null` with the real block name, and adjust `level` / `source` / `evidence` per sub-skill.

## 4. Project case studies (review my drafts)
- [ ] Edit **`src/data/projects.ts`**. For each project, the prose I wrote for **`challenges`** (problems you hit), **`limits`**, and **`consolidate`** (next steps) are my best guess — **correct them to what actually happened**. Each is just `{ fr: [...], en: [...] }` arrays of paragraphs.
- [ ] Confirm the approximate **`year`** on each project (used to order the Journey timeline).
- [ ] Confirm the `Cyberpix` repo really is the pixel-art game (its GitHub languages read HTML/TeX, not Python — worth a look).

## 5. About page
- [ ] Read **`src/app/[locale]/about/page.tsx`** — the bio, the 3 "how I work" principles, and the facts panel. Tell me any professional detail to add (I'm not pulling from the private Income-Plan).

## 6. Identity details
- DONE: public email = `rudolfkrylov.pro@gmail.com` (the pro one), in `src/data/site.ts`.
- [ ] Photo (later): drop `rudolf.jpg` in **`public/`** and tell me — I'll wire it into the hero/About.

## 7. Design (optional tweaks)
- [ ] Background: change `BACKGROUND` in **`src/components/systems/site-background.tsx`** (`soft` | `dots` | `grid` | `glow` | `none`).
- [ ] Admired portfolios: paste links in chat or add to `content/intake/inspiration.md` so I can tune polish.

## 8. Deploy (when you're ready — I'll drive this)
- [ ] Push the repo to GitHub, import it on Vercel (free). Add `PORTFOLIO_GH_TOKEN` there if any repo stays private. The daily refresh workflow (`.github/workflows/refresh.yml`) keeps data fresh.

---

### Quick command reference
| Do this | Run |
|---|---|
| Refresh GitHub data | `npm run fetch:github` |
| Re-sync garden notes | `npm run sync:notes` |
| Preview locally | `npm run dev` → http://localhost:3000 |
| Production build check | `npm run build` |
