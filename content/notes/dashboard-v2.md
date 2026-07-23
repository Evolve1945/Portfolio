> Built 2026-07-17; **fully re-skinned + brought to feature-parity 2026-07-19**. The single-file
> UI at `dashboard/v2.html` is now the **default** at `/` (`DASHBOARD_V2_DEFAULT=1`); the classic UI
> stays reachable at `/?classic=1`. Visual language: [Dashboard Design System](/notes/dashboard-design-system-factory-dark-cursor-light) — **Factory** (dark,
> default) / **Cursor** (light).

## What it is

The plain-language, public-ready face of the dashboard — but no longer a cut-down one. After a gap
audit found the first v2 covered only 8 of the classic UI's ~34 views, it was rebuilt to **full
parity**: **35 nav destinations** across six groups (Overview / Agents / Tasks / Intelligence / Build
/ System), wired to the **same local APIs** as the classic UI, in the new two-theme design.

## History
- **2026-07-17** — first cut: 6 plain-language sections (Home / Tasks / Agents+Skills / Memory /
 Observability / Settings) from `docs/mockups/dashboard-v2.html`. Live at `/v2`.
- **2026-07-19 (rebuild)** — re-authored to the Claude visual language (Factory-dark / Cursor-light,
 Geist/EB-Garamond, `--s0…--btntx` variable contract). Ported every classic view to parity (see below),
 set `DASHBOARD_V2_DEFAULT=1`, added the mesh-health proxy. ~950 ~2260 lines.
- **2026-07-19 (responsive pass)** — adaptive centering (`--content-max` set by JS from the viewport —
 1960px centered on a 2560/2K screen instead of glued-left at 1240), chart overflow fix
 (`maintainAspectRatio:false`), grid-collapse breakpoints, in-card horizontal table scroll, mobile
 sidebar. See [Dashboard Design System](/notes/dashboard-design-system-factory-dark-cursor-light) §5.
- **2026-07-19 (content deep-fix, 10 tabs)** — Evo screenshot review #2 ("not raw ... structured,
 comfortable, intuitive"): Tasks drawer shows the parsed task *result* (light-markdown, not JSON) +
 pagination; Fleet per-column scroll; Time hour-bars + timeline; Pipelines clickable task list;
 Memory rebuilt off `/api/memory`; Self-Model formatted facts; Knowledge-Graph iframe fix; Prompts
 robust wiring; TikToks VRAM bar + collection; NL-Query/Research verified.
- **2026-07-20 (vault-parity audit)** — cross-checked every view against [Dashboard](/notes/dashboard) (the 29-view
 classic spec). Confirmed `/api/errors/{id}/fix` + `/api/plugins/{id}/install` don't exist (so no dead
 Fix/Install buttons) and `/api/capabilities` is per-agent only. Wired 5 documented gaps: Credentials
 Rescan (`POST /api/env/scan`) + status badges; NL-Query Save-to-Vault; Converter Copy + Send-to-queue
 + engine badge; Projects clickdetail; Memory Entities-search + Similar-notes + Save-a-note.
- **2026-07-20 (screenshot review #3, 19 fixes)** — alignment (fixed-width agent-chip 112px / status 60px
 columns so activity rows line up); **Activity-Log + Trust-write-log** rebuilt as a dense `.logline`
 grid (kills doom-scroll); **vault file view now shows a GitHub-style +/− git diff** (vault is a git
 repo — new endpoint below) with content fallback; **corrections dropdowns** replaced with a themed
 custom `.dd` combobox (native `<select>`/`<datalist>` can't be styled); task-drawer instruction
 mdLite-formatted + upstream output collapsed; **Fleet re-done from kanban Trust-style tab bar + one
 aligned list**; Pipelines task-open fixed (`openPipelineTask`); NL-Query 32 boxes; Capabilities
 static fallback; **Observability real charts** (cost-by-agent bar + status doughnut); **Projects
 Allone tab switch** (v1 parity); Credentials Reveal is now a show/hide toggle; **Power live/daily/
 weekly/monthly charts**; Files one-level breadcrumb navigation; Scout shows full proposal data;
 **Logout** button (topbar + Settings). `node --check` PASS (~146k script chars), 0 console errors.

## The 35 views (all on real APIs, all fail-open)
- **Overview:** Home (health/budget/autonomy/fleet + approval gates, token caps, 7-day briefing,
 orchestrator status, finance, **live WebSocket**), Analytics (health score, ROI, hourly/cost/duration
 charts, latency, failure heatmap), Activity Log (all + live tabs).
- **Agents:** Agents & Skills (+ skill forge), Agent Mesh, Trust Monitor, Eval Quality, Corrections.
- **Tasks:** Tasks (+ new-task modal), Fleet (tabbed board — Pending/Running/Awaiting/Completed/Failed
 tabs + one aligned list, redesigned from kanban 2026-07-20), Time, Pipelines (+ create), Schedule &
 DLQ & Checkpoints (panels under Tasks).
- **Intelligence:** Memory (+ vault chat), NL Query, Research, Self-Model, Knowledge Graph, Prompts (+A/B),
 TikToks.
- **Build:** Code (+ sandbox run), Converter, Capabilities, Plugins, Benchmarks.
- **System:** Observability, Governance (new — orchestrator endpoints that had no UI in either version),
 Projects (+ create), Credentials, Power, Webhooks, Errors, API Explorer, Files, Scout, Settings.

Three classic views are folded in as **sub-panels** rather than standalone nav items (Schedule Tasks,
Vault Chat Memory, Skills Agents & Skills) — verified still present, not dropped.

## Backend changes
`dashboard/main.py` new endpoints added for v2:
- **`GET /api/mesh/health`** — server-side fan-out poll of all 23 mesh ports (8770–8792) via a
 `ThreadPoolExecutor`. The mesh servers set no CORS headers, so the classic UI's browser-side port
 polling was silently CORS-blocked; this proxies it server-side so **Agent Mesh works in both UIs**.
- **`GET /api/agents/usage`** — per-agent-type token/cost aggregation from `budget.db` `task_tokens`
 (feeds the usage stats on the Agents & Mesh cards).
- **`GET /api/git/diff?path=`** — unified `git diff HEAD` of one workspace file the Code-tab +/− viewer.
- **`GET /api/trust/vault-file-diff?path=`** (2026-07-20) — same, for a single vault `.md` (the vault is
 its own git repo); powers the GitHub-style +/− view when a vault-activity file has uncommitted edits,
 with a content fallback. `.md`-only + traversal-guarded, read-only.

All other v2 fixes are frontend-only (`dashboard/v2.html`) against pre-existing endpoints.

## Serving
`GET /` (default) and `GET /v2` both serve v2 via `_serve_injected()` (same `_session_user` gate +
`window.__ECOSYSTEM_API_KEY__` injection as before). `DASHBOARD_V2_DEFAULT=1` in `.env` makes `/`
serve v2; `/?classic=1` still serves the classic `index.html` (untouched).

## Verified
All 35 nav ids render (0 errors, 0 missing, 0 duplicate DOM ids) via JS sweeps; graceful fail-open on
every card when APIs are unreachable; responsive checked at 2560 / 1440 / 600px (no body-level
horizontal overflow, charts contained). Since 2026-07-19 Evo has been running it live and reviewing by
screenshot — the deep-fix batches (10-tab, vault-parity, 19-fix) were driven by real payloads, so the
earlier field-name guesses (`/power/*`, `/scout/proposals`, `/prompts/{agent}`, task `result` shape) are
now confirmed/adjusted. Each batch re-verified with `node --check` + a static-preview console sweep (0 errors).

## 2026-07-20 — parity gap-fill + full live 40-tab verification
- **5 panels added** (nav 3540), fail-open in the v2 card idiom: **Goal Surface** (`/goal/run`),
 **Model Profiles** (`/profiles`+`/recommend`), **CLI Tools** (`/tools/wrap`, rec #24), **Vault Ops**
 (`/vault/tasks`+`/vault/refactor`), **OCR** (`/ocr/image`jobs). Every v1 feature area now has a v2 surface.
- **Full live check via Claude-in-Chrome** (real browser, logged-in session; stack was down restarted `watchdog.py`):
 drove **all 40 tabs** — render + live data + console + buttons. **40/40 functional, zero uncaught console errors.**
 Buttons confirmed: nav, Tasks filters, Trust sub-tabs, Profiles Recommend, Memory Search, Prompts drill-down,
 Converter Convert, API Explorer Send (HTTP 200), Files tree, Settings theme. Costly actions confirmed wired, not fired.
- **2 bugs found + fixed + verified live:** **FIX-1** Model Profiles Recommend printed raw JSON (fallback missed
 `agent_type`/`display_name`); **FIX-2** Prompts drill-down hung on "Loading…" forever (`/prompts/{agent}` returns
 `{active:null,history:[]}`; loader had no else) now reads `active`/`history` + shows a clear "no stored version" note.
- **Display fix:** `TIER_MODEL` S-tier `claude-sonnet-4-6` `claude-sonnet-5` (was inconsistent with the backend).

## Key files
- `dashboard/v2.html` — the entire v2 UI (single file, ~3090 lines, **40 tabs**)
- `dashboard/main.py` — `/` + `/v2` routes, `_serve_injected()`, `DASHBOARD_V2_DEFAULT`, `/api/mesh/health`
- [Dashboard Design System](/notes/dashboard-design-system-factory-dark-cursor-light) — the visual language every new feature must follow
- `Components/Interface/design-system-source/` — raw Factory/Cursor source specs (DESIGN.md, theme.css,
 tokens.json, variables.css)

## Related
- [Dashboard Design System](/notes/dashboard-design-system-factory-dark-cursor-light) · [Dashboard Architecture](/notes/dashboard-architecture) · 100 Propositions (top-20 COMPLETE)
- [Agent Command Center](/notes/agent-command-center-fleet-view) (the Fleet kanban) · [Goal Surface](/notes/goal-surface-one-goal-loop) · [Safety Floor](/notes/safety-cost-floor) (kill switch)
