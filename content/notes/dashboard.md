> Real-time visibility into **every agent, every task, every error** — the control tower of the ecosystem.

**Status: BUILT.** Running on `http://localhost:8766`. See [Dashboard Architecture](/notes/dashboard-architecture) for the full technical spec and sessions/session-2026-04-26-tasks-12-13 for the build log.

---

## What It Is

A single-file SPA (`dashboard/index.html`) backed by a FastAPI server (`dashboard/main.py`) on port 8766. WebSocket push for all real-time updates — zero polling.

**29 views** across navigation groups (expanded from original 12 in Task 139/140/audit rounds 2026-05-15 and 2026-05-19):
- **Home** — Command Center (drag-and-drop widget grid), Briefing (7-day summary)
- **Monitor** — Agents, Tasks (Kanban + Checkpoints + DLQ), Time (ETAs)
- **Intelligence** — Analytics (Chart.js), Memory (Entities + Similar Notes + Save to Vault), NL Query, Vault Chat, TikToks, Code (+ Git Status), Activity log, Corrections, Eval Quality, Benchmarks, Errors, Prompts, Capabilities
- **System** — Projects, Credentials, Skills, Pipelines, Schedule, Trust (+ Privacy Policy), Config, Agent Mesh, Logs, API

---

## Design

Dark glassmorphism with a purple gradient background anchored to `#3a0040`. Cards use `backdrop-filter: blur(20px)` with semi-transparent rgba purple backgrounds — the "liquid glass" effect with a bright top border highlight.

Fully responsive: sidebar navigation on desktop, bottom tab bar on mobile (≤640px).

SVG icons used everywhere — no emoji or unicode symbols in the UI.

---

## URL Hash Routing

Every view has a stable URL hash so `Ctrl+R` stays on the current section. No page reload needed.

```javascript
// Navigate to any view
history.replaceState(null, '', '#' + viewId);

// On boot — restore the view from URL
const hashView = location.hash.slice(1);
if (hashView && VIEW_TITLES[hashView]) {
 state.view = hashView;
 // restore nav highlight + page title
}

// Browser back/forward button support
window.addEventListener('popstate', () => {
 const v = location.hash.slice(1);
 if (v && VIEW_TITLES[v]) switchView(v);
});
```

Supported hashes: `#cmd`, `#agents`, `#tasks`, `#time`, `#analytics`, `#code`, `#activity`, `#corrections`, `#projects`, `#credentials`, `#skills`, `#pipelines`, `#mesh`, `#logs`, `#config`, `#api`, `#memory`, `#schedule`, `#trust`, `#nlquery`, `#vaultchat`, `#tiktoks`, `#memory`, `#evalquality`, `#benchmarks`, `#errors`, `#prompts`, `#capabilities`, `#converter`, `#plugins`, `#briefing`.

---

## Tab Persistence (localStorage)

`switchView()` writes the active view id to localStorage on every navigation:

```javascript
localStorage.setItem('evo_last_view', id);
```

Boot sequence priority:
1. URL hash (if present and valid)
2. `localStorage.getItem('evo_last_view')` (if no URL hash)
3. Default: `'cmd'`

Widget order (KPI cards) persists separately under `localStorage` key `ecosystemWidgetOrder`.

---

## Widget Order Persistence (localStorage)

The Command Center KPI card grid is drag-and-drop reorderable. Layout persists across page reloads and `Ctrl+R` via `localStorage`.

```javascript
const STORAGE_KEY = 'ecosystemWidgetOrder';
const DEFAULT_WIDGET_ORDER = ['kpi-tasks', 'kpi-running', 'kpi-cost', 'kpi-sla'];

// Load on boot
function loadWidgetOrder() {
 try {
 const s = localStorage.getItem(STORAGE_KEY);
 if (s) return JSON.parse(s);
 } catch (_) {}
 return [...DEFAULT_WIDGET_ORDER];
}

// Save on drop
function saveWidgetOrder() {
 const order = Array.from(
 document.querySelectorAll('#widget-grid [draggable="true"]')
 ).map(c => c.id).filter(Boolean);
 state.widgetOrder = order;
 localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}
```

Drag events: `dragstart`, `dragover`, `dragleave`, `drop`. Cards get a visual `.drag-over` highlight during hover.

---

## Views — Detailed Reference (29 total)

### 1. Command Center (`#cmd`)

**Home view.** Overview of the entire ecosystem at a glance.

- **KPI Cards** — 4 draggable stat cards: Total Tasks, Running Agents, Cost Today (USD), SLA Compliance (%). Reorder by drag-and-drop; layout saved to localStorage.
- **7-Day Briefing card** — tasks done/failed, cost, eval pass rate, top agent.
- **Active Agents panel** — live token progress bars, circuit state badge (closed / open / half-open), last heartbeat timestamp.
- **Approval Gates panel** — pending gates with Approve/Reject buttons; works without Discord.
- **Event Feed** — scrolling log of recent WebSocket events with level badges (INFO / WARN / ERROR) and timestamps.
- **Backend Status** — heartbeat indicator showing `Connected` (green) or `Disconnected` (red) based on WebSocket state.
- **Orchestrator Status widget** — `#orch-status-card` shows online/offline badge, queue depth, running tasks, uptime; polls `/api/orchestrator/status` on view load and every 30s. Proxy route pings port 8765 `/health`. (session 31)
- **Task detail drawer** — clicking any task card opens a slide-in panel (`#task-drawer`) showing full instruction, result, error, timeline pills (created/started/completed/duration), tokens, cost, model_used, pipeline. (session 31)

Data source: `GET /api/tasks`, `GET /api/agents`, `GET /api/briefing`, `GET /api/gates`, `GET /api/orchestrator/status`, plus `task_update` / `agent_heartbeat` WebSocket events.

---

### 2. Agents (`#agents`)

Per-agent monitoring cards. One card per registered agent in the mesh.

- Agent name + type badge
- Token usage bar: `tokens_used / token_budget` with colour coding (green amber red)
- Circuit breaker state badge: `CLOSED` (normal), `OPEN` (tripped), `HALF-OPEN` (testing)
- Current task name and status
- Error count + last heartbeat relative time
- Cost accumulated (USD)

Data source: `GET /api/agents` + `agent_heartbeat` WebSocket events.

---

### 3. Tasks — Kanban Board (`#tasks`)

Four-column Kanban with click-to-open task detail modal.

**Columns:** `Queued` `Running` `Done` `Failed`

Each task card shows:
- Task name (truncated)
- Agent type badge
- Pipeline stage
- Token cost and duration

**Task detail modal** (click any card):
- Full instruction text
- Result or error output
- Token count, cost, timestamps
- Link to correction log if errored

**DLQ card** — auto-hides when empty; shows dead-letter queue tasks with Retry button.

**Checkpoints card** — lists active task checkpoints; per-task Replay button (`POST /api/checkpoints/{task_id}/replay`). Auto-hides when empty.

Data source: `GET /api/tasks`, `GET /api/dlq`, `GET /api/checkpoints` + `task_update` WebSocket events.

---

### 4. Time Tracker (`#time`)

Per-task duration and ETA display.

- List of all in-progress and completed tasks with durations
- ETA formatting: `< 60 min "~Xm"`, `≥ 60 min "~Xh Ym"`
- Global stats: average task duration, longest running task, total compute time
- Colour coding: green (on track), amber (slow), red (exceeded estimate)

---

### 5. Analytics (`#analytics`)

Chart.js visualisations for trend analysis — all charts use real DB data (Task 139, 2026-05-15).

- **Daily Task Volume** — bar chart, last 14 days, from `/api/analytics` `.daily[]`
- **Daily Cost** — line chart, cost per day from same payload
- **Cost by Agent** — bar chart from `/api/analytics` `.by_agent[]`
- **SLA Compliance** — doughnut chart, compliant vs non-compliant task count
- **ROI summary** — `roi_multiplier`, `value_created_usd`, `net_value_usd`, `time_saved_hours` injected into DOM elements
- Charts are destroyed and re-initialised on every view switch to prevent canvas conflicts

Data source: `GET /api/analytics` — queries `tasks` table live on each request.

---

### 6. Memory (`#memory`)

Obsidian vault brain interface.

- **Memory overview** — recent session notes, agent KV pairs, memory events, task summary
- **Entities section** — search entities by type, list with type colour badges; `loadEntities()` / `searchEntities()` wired to `GET /api/entities`
- **Similar Notes** — input a vault path, get top-8 semantically similar notes (score >= 0.30), rendered as chips
- **Save to Vault** — `_vaultSave()` modal: title + content `POST /api/memory/save`
- **Vault Refactor** — folder / max-notes / dry-run inputs; `POST /api/vault/refactor`; log stream + stats counters; polls `GET /api/vault/refactor/{job_id}` every 2s

Data source: `GET /api/memory`, `GET /api/entities`, `GET /api/entities/search`, `GET /api/memory/similar`, `POST /api/memory/save`.

---

### 7. NL Query (`#nlquery`)

Natural-language SQL interface over the task database.

- Textarea for plain-English question; `POST /api/nl-query` translates via Haiku safety-gated SQL aiosqlite
- Results rendered as a dynamic table
- "Save to Vault" button pre-fills title/content with query + results `POST /api/memory/save`

---

### 8. Vault Chat (`#vaultchat`)

Conversational RAG chat over the Obsidian vault.

- `#vc-history` scrollable chat area; `#vc-input` textarea (Enter = send, Shift+Enter = newline)
- `POST /api/rag/chat` retrieves top-8 ChromaDB chunks (score >= 0.30), calls Haiku, returns `{answer, sources, context_chunks}`
- Source chips shown below each assistant message
- `_mdToHtml()` renders minimal markdown in assistant bubbles

---

### 9. TikToks (`#tiktoks`)

TikTok Knowledge Processor UI.

- Backend badge: green = Ollama (qwen3:8b), yellow = API, grey = rule-based
- API fallback checkbox, dry-run toggle, max-notes input
- `POST /api/tiktok/process` starts background job; polls `GET /api/tiktok/process/{job_id}` every 2s
- Stat bar: processed / discarded / categories; log stream

---

### 10. Analytics (`#analytics`)

See section 5 above.

---

### 11. Code (`#code`)

Inline code runner and agent-generated file browser.

- **Git Status card** — first card in view; shows branch, staged/modified/untracked counts, recent commits. Data: `GET /api/git/status`.
- **Code Editor** — `<textarea>` with monospace font
- **Language selector** — dropdown (Python, JavaScript, Bash, SQL)
- **Run button** — `POST /api/code/run {code, lang, timeout}` proxied to orchestrator sandbox at `:8765/sandbox/run`
- **Output panel** — scrollable pre-formatted output with error highlighting
- **File browser** — `GET /api/files?type=generated` lists workspace files; `GET /api/files/read?path=` loads file into editor; path traversal is prevented

---

### 12. Activity Log (`#activity`)

Full chronological event log with filtering.

- Scrollable event list with timestamp, level badge (INFO / WARN / ERROR / DEBUG), and event message
- Filter bar: by level, by agent, by keyword search
- Each event shows structured data payload on expand
- Auto-scrolls to latest event on new WebSocket push

Data source: `GET /api/logs` (alias for `GET /api/events`) + all `*_update` WebSocket events.

---

### 13. Corrections (`#corrections`)

Full error diagnosis fix verify workflow. Also pushes to Obsidian vault.

Each correction item shows:
- **Severity badge**: `critical` / `high` / `medium` / `low`
- **Error message** (original error text)
- **Diagnosis** (root cause analysis)
- **Before/After diff** — inline code diff showing what changed
- **Verification status**: `verified` or `pending`
- **Export button** — writes correction to `corrections/<id>.md` in Obsidian vault

Data source: `GET /api/corrections` + `correction_event` WebSocket.

---

### 14. Eval Quality (`#evalquality`)

Per-agent evaluation scores and health.

- Agent eval rows: agent type, pass rate %, fail count, last run
- Loading state in `#eval-agent-tbody` while data loads
- `GET /api/evals` — queries `logs/prompt_stats.json`; `GET /api/evals/summary` for aggregate pass rate

---

### 15. Benchmarks (`#benchmarks`)

Benchmark leaderboard and recent runs.

- KPI strip: best agent, avg latency, total runs
- `#bm-leaderboard-tbody` — ranked by score per agent
- `#bm-recent-tbody` — most recent runs with timestamps

Data source: `GET /api/benchmarks`, `GET /api/benchmarks/leaderboard`.

---

### 16. Errors (`#errors`)

Aggregated error tracker.

- `#err-recent-tbody` — recent errors with type, agent, timestamp
- Fix button per error: `POST /api/errors/{id}/fix`
- Summary stats from `GET /api/errors/summary`

---

### 17. Prompts (`#prompts`)

Prompt version store UI.

- `#prompts-tbody` — active prompt per agent type, version number, last updated
- Promote / Rollback buttons per row

Data source: `GET /api/prompts/{agent_type}`, `POST /api/prompts/{agent_type}/promote/{version}`, `POST /api/prompts/{agent_type}/rollback`.

---

### 18. Capabilities (`#capabilities`)

Live system capability map.

- `#cap-features-grid` — feature tiles (loading div while fetching)
- `#cap-agents-grid` — per-agent capability tiles with mesh status
- Data: `GET /api/capabilities`

---

### 19. Converter (`#converter`)

Prompt engineering rewrite engine. See Features/Implemented/Prompt Converter for full documentation.

- Three radio card buttons: **Haiku** (default), **Ollama**, **Template**
- Backend badge shows active engine (Claude Haiku / qwen3:8b / Template)
- Ctrl+Enter shortcut; spinner during AI generation
- Copy button after generation; "Send to Task Queue" pre-fills New Task modal
- 10 prompt engineering rules baked in (role precision, task decomposition, output spec, context injection, hard vs soft constraints, success criteria, uncertainty handling, agent-type heuristics, chain of thought, scope boundary)

Data source: `POST /api/convert-prompt`.

---

### 20. Plugins (`#plugins`)

Plugin auto-discovery marketplace.

- `POST /api/plugins/scan` triggers discovery; `POST /api/plugins/{id}/dismiss` (was 404 before 2026-05-19 fix)
- Cards per discovered plugin with Install / Dismiss buttons

Data source: `GET /api/plugins`.

---

### 21. Projects (`#projects`)

Multi-project context manager — **DB-backed, no hardcoded demo data**.

- **Project grid** — card per project, loaded from `GET /api/projects`
- Each card shows: name, description, status badge, task count, done count, progress bar
- **Task count logic**: Ecosystem project (path matches Ecosystem root) `_count_vault_tasks()` reads vault `Project Progress.md` for vault_built/vault_planned counts; all other projects SQLite task count
- **Add project** — "New Project" modal calls `POST /api/projects`; backend creates `VAULT/Projects/<safe_name>/` folder on disk (`Projects/` parent created with `parents=True, exist_ok=True` if missing); filesystem-safe name strips `< > : " / \ | ? *` and control chars; path stored in `projects.path` SQLite column
- Vault task counts applied only to the project whose resolved path equals the Ecosystem root; all other projects get `vault_built=0, vault_planned=0, vault_total=0`
- Click a project card to see per-agent instructions and fix history

---

### 22. Credentials (`#credentials`)

API key vault with live status.

- **Credential rows** — each shows: key name, masked value (`sk-***...***`), status badge, what skill it unlocks, expiry indicator
- **Reveal button** — calls `GET /credentials/reveal?key=KEY_NAME` to temporarily unmask value
- **Rescan button** — triggers `POST /api/env/scan` to re-detect keys from `.env` / OS / Windows Credential Manager
- **Expiry cards** — amber warnings for keys approaching rotation deadline
- Status badges: `active` (green), `missing` (grey), `expires-soon` (amber), `expired` (red)

---

### 23. Skills (`#skills`)

Skill marketplace with toggle activation — live DB data.

- **Skills grid** — card per skill, 3-column layout on desktop
- Each card: name, plugin identifier, category badge, description, active/inactive toggle
- **Category filter tabs** — All / Research / Coding / Data / Communication / Automation
- Toggle calls `PATCH /api/skills/{id}` with `{status}` and immediately updates card state
- Active skills highlighted with purple border and "ACTIVE" badge
- Skills sourced from `GET /api/skills` DB query; falls back to local array on API failure

---

### 24. Pipelines (`#pipelines`)

Pipeline DAG visualiser, run history, and **detail drawer**.

- **Pipeline list** — each entry shows: name, status badge, last run time, step count, agent; cursor pointer + hover highlight
- **DAG step visualiser** — horizontal node sequence `[Step] [Step] [Step]` with status-coded node colours (green = completed, amber = running, grey = pending, red = failed)
- **Detail drawer** — click any pipeline card 500px right-side drawer slides in over a backdrop:
 - Header: pipeline name, status badge, close button
 - Progress bar with segment colours (green/blue/red/grey)
 - Stat chips: completed / running / failed / pending / cost / tokens
 - Tasks grouped by `stage` field; stage header is sticky (`.pipe-stage-head`)
 - Each task row (`.pipe-task-row`): status dot, name, agent type, duration, cost, token count, timestamp
 - Click task row to expand: error (red left border) + result (purple left border), scrollable, 800/1200 char limits
 - Expand arrow rotates 90/270° to indicate open/closed state
 - Close: backdrop click (`#pipe-backdrop`) or Escape key
- JS functions: `openPipelineDrawer(name)`, `closePipelineDrawer()`, `_renderPipelineDrawer(name, tasks)`, `togglePipeTask(row)`, `fmtDuration(ms)`
- Data source: `GET /api/tasks?pipeline=<name>&limit=500`

---

### 25. Schedule (`#schedule`)

Cron job manager.

- Job list with name, schedule expression, last run, next run, status
- Run / Pause / Resume / Delete buttons per job (all wired: `runScheduleJob()`, `toggleScheduleJob()`, `deleteScheduleJob()`)
- Jobs array passed correctly from `GET /api/schedule/jobs` response

---

### 26. Trust Monitor (`#trust`)

Security and vault integrity dashboard. See Features/Implemented/Trust Monitor for full documentation.

- **Quarantine panel** — notes below trust score threshold; Promote button per entry (`POST /api/trust/promote`)
- **Vault Write Log** — action colour, author, trust badge, size; data from `GET /api/trust/writelog`
- **Privacy Policy panel** — collection level dropdowns (CLOUD_ALLOWED / LOCAL_ONLY / REDACT_REQUIRED) + Reset defaults (`POST /api/privacy/policy/reset`)
- **Recent Vault Activity card** — dropdown filter: 24h / 3 days / 7 days / 30 days; total count badge; table of recently modified vault `.md` files (path, modified time, size_bytes); auto-refresh every 30s when trust view is active
- `loadVaultActivity()` called from `loadTrustData()` automatically
- Data: `GET /api/trust/quarantine`, `GET /api/trust/writelog`, `GET /api/trust/vault-activity?days=7&limit=60`

---

### 27. Config (`#config`)

Settings panel.

- WebSocket URL setting — `let WS_URL` (was `const` before 2026-05-19 fix); `saveSettings()` reads `#setting-ws` input, closes existing WS, reconnects via `connectWS()`
- Theme and other preferences

---

### 28. Agent Mesh (`#mesh`)

Agent mesh health overview.

- Health status per agent server (ports 8770–8792)
- Latency and error rate per endpoint

Data source: `GET /api/mesh/health`.

---

### 29. Logs (`#logs`)

Raw log file viewer.

- File list from `GET /api/logs/files`; content loaded into scrollable pre element
- Refreshes on view switch

---

### Briefing (`#briefing`)

7-day system briefing card. Also embedded in Command Center.

- Tasks done/failed, cost, eval pass rate, top agent
- `GET /api/briefing`

---

## Auto API Key Detection

On every startup, the backend scans:
1. `.env` file (4 candidate paths)
2. `os.environ` (current process)
3. Windows Credential Manager (`cmdkey /list`)

Any key found marks the credential active and auto-activates all skills that require it. The Credentials view shows a manual **Rescan** button (`POST /api/env/scan`).

---

## Navigation — Sidebar Nav Items

Nav items use full-width highlight (CSS added 2026-05-19):

```css
.ni { margin: 0 -8px; padding: 7px 16px; border-radius: 0; }
.ni.active::before { left: 0; } /* active bar flush with sidebar edge */
```

All nav items are `<button>` elements (including Memory, converted 2026-05-19). Mobile: margin reset to 0.

---

## API Endpoints — Complete Reference

| Endpoint | Method | Feature |
|---|---|---|
| `/api/tasks` | GET | Task list (supports `?pipeline=` filter) |
| `/api/agents` | GET | Agent heartbeat status |
| `/api/analytics` | GET | Daily cost, volume, SLA, ROI |
| `/api/logs` | GET | Alias for `/api/events` |
| `/api/events` | GET | Raw event log |
| `/api/corrections` | GET, POST | Error corrections |
| `/api/projects` | GET, POST | Projects list + create (POST creates vault folder) |
| `/api/projects/{id}` | GET, PATCH | Project detail + update |
| `/api/projects/{id}/budget` | GET | Per-project budget spend |
| `/api/credentials` | GET, POST | Credential vault |
| `/api/skills` | GET, POST | Skills list + add |
| `/api/skills/{id}` | PATCH | Toggle skill status |
| `/api/plugins` | GET | Plugin discovery list |
| `/api/plugins/scan` | POST | Re-scan for plugins |
| `/api/plugins/{id}/dismiss` | POST | Dismiss a plugin |
| `/api/plugins/{id}/install` | POST | Install a plugin |
| `/api/gates` | GET | Pending approval gates |
| `/api/gate/decide` | POST | Approve or reject a gate |
| `/api/env/scan` | POST | Re-scan .env / OS / Windows Credential Manager |
| `/api/nl-query` | POST | NL SQL results |
| `/api/rag/chat` | POST | Conversational vault RAG |
| `/api/memory` | GET | Vault memory overview |
| `/api/memory/similar` | GET | Similar notes query |
| `/api/memory/save` | POST | Save AI output to vault |
| `/api/vault/refactor` | GET, POST | Vault refactor jobs |
| `/api/vault/refactor/{job_id}` | GET | Poll refactor job |
| `/api/evals` | GET | Eval scores per agent |
| `/api/evals/summary` | GET | Aggregate eval pass rate |
| `/api/benchmarks` | GET | Benchmark runs |
| `/api/benchmarks/leaderboard` | GET | Agent leaderboard |
| `/api/benchmarks/{agent}` | GET | Per-agent benchmarks |
| `/api/errors` | GET | Error list |
| `/api/errors/summary` | GET | Error aggregate stats |
| `/api/errors/{id}/fix` | POST | Mark error fixed |
| `/api/prompts/{agent_type}` | GET, POST | Prompt version store |
| `/api/prompts/{agent_type}/promote/{version}` | POST | Promote prompt version |
| `/api/prompts/{agent_type}/rollback` | POST | Rollback prompt version |
| `/api/capabilities` | GET | System capability map |
| `/api/convert-prompt` | POST | Convert/rewrite a prompt (Haiku/Ollama/Template) |
| `/api/trust` | GET | Trust overview |
| `/api/trust/quarantine` | GET | Quarantined notes |
| `/api/trust/writelog` | GET | Vault write log |
| `/api/trust/promote` | POST | Promote a quarantined note |
| `/api/trust/pending` | GET | Notes pending promotion |
| `/api/trust/vault-activity` | GET | Recently modified vault files (`?days=&limit=`) |
| `/api/privacy/policy` | GET, POST | Privacy policy (collection cloud/local rules) |
| `/api/privacy/policy/reset` | POST | Reset privacy policy to defaults |
| `/api/checkpoints` | GET | List all active checkpoints |
| `/api/checkpoints/{task_id}` | GET | Get checkpoints for a task |
| `/api/checkpoints/{task_id}/replay` | POST | Replay task from latest checkpoint |
| `/api/entities` | GET | List all named entities |
| `/api/entities/search` | GET | Search entities by query |
| `/api/entities/{type}/{name}` | GET | Get a specific entity |
| `/api/entities` | POST | Create or update an entity |
| `/api/git/status` | GET | Git branch + staged/modified/untracked + recent commits |
| `/api/files` | GET | List workspace files (`?type=generated`) |
| `/api/files/read` | GET | Read a workspace file (`?path=`) |
| `/api/code/run` | POST | Run code (proxied to orchestrator sandbox) |
| `/api/schedule/jobs` | GET | Scheduled job list |
| `/api/mesh/health` | GET | Agent mesh health per port |
| `/api/dlq` | GET | Dead-letter queue tasks |
| `/api/tiktok/process` | POST | Start TikTok processing job |
| `/api/tiktok/process/{job_id}` | GET | Poll TikTok job |
| `/api/tiktok/process/backend` | GET | Active TikTok backend |
| `/api/briefing` | GET | 7-day briefing summary |

---

## WebSocket Events

| Event type | Trigger | Views Updated |
|---|---|---|
| `task_update` | Task status change | Command Center, Tasks, Time |
| `agent_heartbeat` | Agent ping | Command Center, Agents |
| `stats_update` | Periodic stats push | Command Center, Analytics |
| `env_scan_complete` | Key scan done | Credentials |
| `skill_update` | Skill toggle | Skills |
| `pipeline_event` | Pipeline stage change | Pipelines |
| `correction_event` | New correction logged | Corrections, Activity |

---

## Notification Channels

| Channel | Trigger |
|---|---|
| WebSocket push | Every task/agent state change (instant) |
| Obsidian `live-session.md` | Updated every 60s by sync worker |
| Obsidian `corrections/*.md` | On new correction logged |
| Obsidian `agents/status.md` | On agent state change |

---

## Related Nodes

- [Dashboard Architecture](/notes/dashboard-architecture) — full technical spec (views, schema, design system)
- [Orchestration](/notes/orchestration) — source of all task and agent events
- [MCP Layer](/notes/mcp-layer) — dashboard server exposed as MCP tool
- Credential Manager — credential vault backing store
- [Skills Registry](/notes/skills-registry) — skills marketplace data
- [Pipeline Manager](/notes/pipeline-manager) — pipeline visualiser data
