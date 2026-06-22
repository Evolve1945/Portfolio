# Portfolio — your task list

Things only you can do, or should decide. Each says **which file** to edit and **how to apply** it.
After editing data/config, re-run the relevant command and refresh the dev server (`npm run dev`).

---

## 1. GitHub repos (unlocks live data)
- [ ] Make **`Ecosystem`** public (Settings → General → Danger Zone → Change visibility). History is clean — verified, no secrets. `web-done` is already public.
- [ ] (Optional, if you keep any repo private) create a fine-grained **read-only PAT** and add it as repo secret `PORTFOLIO_GH_TOKEN`.
- [ ] Then run: `npm run fetch:github` — pulls fresh repo data into `src/data/github.json`. Once Ecosystem (Python) is in, "primary language" stops showing HTML.
- [ ] Confirm the repo list in **`scripts/fetch-github.mjs`** (`REPOS = [...]`) is the set you want counted.

## 2. Digital garden (which vault notes are public)
- [ ] Review the publish list in **`content/garden.config.json`** → `notes[]`. Right now 8 notes are published. **Remove any you don't want**, or **add** a note by writing its vault-relative path (e.g. `Claude-Ecosystem/Components/Watchdog.md`).
- [ ] Never add anything from `Income-Plan/`, `Security/`, `sessions/`, `Audits/` (kept private by design).
- [ ] Then run: `npm run sync:notes` — regenerates `content/notes/` (strips emojis, resolves `[[links]]`, builds backlinks). Commit `content/notes/` (Vercel can't see your vault).

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
- [ ] Confirm public email in **`src/data/site.ts`** (`rudolfkrylov.pro@gmail.com` vs `rudolfkrylov1604@gmail.com`).
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
