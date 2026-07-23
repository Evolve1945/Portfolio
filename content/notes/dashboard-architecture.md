> The **mission control center** of the Claude Ecosystem — a real-time, full-featured application that shows every agent, task, pipeline, project, error, correction, and capability in one unified interface. Always live, always synced.

---

## Status: BUILT 

All core components implemented and running. See internal notes for the full build log.

---

## Design Philosophy

| Principle | Implementation |
|---|---|
| **Always live** | WebSocket push — zero polling, instant updates |
| **Zero install** | Single HTML file, opens in any browser |
| **Per-project context** | Every view scoped to selected project |
| **Audit-grade history** | Every error, fix, and verification permanently logged |
| **Self-expanding** | Skills Marketplace + Credential Vault grow the system in-app |
| **Obsidian sync** | Significant events auto-written to vault |
| **Auto key detection** | .env + os.environ + Windows Credential Manager scanned on startup |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI + Python (async) |
| **Real-time** | WebSocket (native FastAPI) |
| **Database** | SQLite (aiosqlite) |
| **Frontend** | Single HTML file — no build step |
| **Charts** | Chart.js (CDN) |
| **Styling** | CSS custom properties — liquid glass purple theme |
| **Obsidian sync** | Direct file write every 60s |
| **Key detection** | `env_scanner.py` — stdlib only |

---

## Design System

### Color Tokens

| Token | Value | Role |
|---|---|---|
| `--acc` | `#c084fc` | Primary accent (purple) |
| `--acc2` | `#a855f7` | Accent darker |
| `--green` | `#4ade80` | Success / active |
| `--amber` | `#fbbf24` | Warning |
| `--red` | `#f87171` | Error / DLQ |
| `--tx` | `#f0e8ff` | Primary text |
| `--tx2` | `#c4b5d4` | Secondary text |
| `--tx3` | `rgba(196,181,212,.55)` | Tertiary / muted text |
| `--bd` | `rgba(200,120,255,.18)` | Card border |
| `--bd-hi` | `rgba(230,170,255,.38)` | Top border highlight (glass effect) |
| `--glass` | `rgba(60,0,90,.45)` | Sidebar / nav background |
| `--card` | `rgba(80,10,110,.22)` | Card background base |
| `--hover` | `rgba(160,80,255,.12)` | Hover state overlay |
| `--active-nav` | `rgba(192,132,252,.15)` | Active nav item background |
| `--input-bg` | `rgba(30,0,50,.5)` | Input / textarea background |

### Background

Three radial gradients, anchor `#3a0040` `#05000a`:
- Top-left bloom: `ellipse 140% 90% at 15% -5%`
- Bottom-right bloom: `ellipse 70% 60% at 85% 110%`
- Center glow: `ellipse 50% 50% at 50% 50%`

### Liquid Glass Card

```css
background: linear-gradient(135deg, rgba(130,45,170,.18), rgba(80,10,110,.12));
backdrop-filter: blur(20px) saturate(1.6);
border: 1px solid rgba(200,120,255,.22);
border-top-color: rgba(230,170,255,.38);
box-shadow: inset 0 1px 0 rgba(255,200,255,.07), 0 4px 24px rgba(80,0,120,.3);
```

### Typography

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
/* Headings use letter-spacing: -0.02em for Apple-like tight spacing */
```

### Icons

All icons are **inline SVG** — no emoji, no unicode symbols, no icon font. Each icon is a `<svg viewBox="0 0 24 24">` element with `stroke="currentColor"` and `stroke-width="1.5"`. This ensures crisp rendering at all DPIs and supports CSS colour inheritance.

### New CSS Component Classes (added in redesign + subsequent sessions)

| Class | Purpose |
|---|---|
| `.code-editor-wrap` | Container for code runner panel |
| `.code-area` | Monospace `<textarea>` editor |
| `.code-output` | Scrollable stdout/stderr display |
| `.correction-item` | Single correction entry card |
| `.correction-sev` | Severity badge (critical/high/medium/low) |
| `.correction-diff` | Before/after diff display |
| `.project-grid` | 3-column project card grid |
| `.project-card` | Individual project card with colour accent |
| `.cred-item` | Credential row (name + mask + badge + reveal) |
| `.cred-reveal` | Reveal button for masked credential value |
| `.skills-grid` | 3-column skills card grid |
| `.skill-card` | Individual skill card with toggle |
| `.pipeline-item` | Pipeline summary row; `cursor:pointer` + hover highlight |
| `.pipeline-steps` | Horizontal DAG node sequence container |
| `.pipeline-node` | Single DAG step node (colour-coded by status) |
| `.pipeline-arrow` | `` connector between DAG nodes |
| `#pipeline-drawer` | 500px right-side detail drawer (slides in on pipeline card click) |
| `#pipe-backdrop` | Full-viewport backdrop behind pipeline drawer; click to close |
| `.pipe-stage-head` | Sticky stage group header inside pipeline drawer |
| `.pipe-task-row` | Expandable task row inside pipeline drawer |
| `.drag-over` | Drag-and-drop hover highlight on KPI cards |
| `.kpi-card[draggable]` | Draggable KPI widget container |
| `.ni` | Nav item: `margin:0 -8px; padding:7px 16px; border-radius:0` (full sidebar width) |
| `.ni.active::before` | Active indicator bar: `left:0` (was `-8px`) |

---

## Navigation Structure (29 views)

```
Home
 ● Command Center drag-and-drop widget grid, briefing, gates

Monitor
 ○ Agents per-agent card, token bar, circuit state
 ○ Tasks Kanban board, DLQ card, Checkpoints card
 ○ Time per-task duration + ETA, global time view

Intelligence
 ○ Analytics Chart.js (real DB data): cost, SLA, ROI
 ○ Memory entities, similar notes, vault refactor, save
 ○ NL Query plain-English SQL results
 ○ Vault Chat conversational RAG over vault
 ○ TikToks TikTok knowledge processor
 ○ Code inline runner, git status, file browser
 ○ Activity full event log with level/agent filter
 ○ Corrections errordiagnosisdiffverify workflow
 ○ Eval Quality per-agent eval pass rates
 ○ Benchmarks agent leaderboard + recent runs
 ○ Errors error tracker + fix buttons
 ○ Prompts prompt version store (promote/rollback)
 ○ Capabilities live capability map

System
 ○ Projects DB-backed projects; New Project creates vault folder
 ○ Credentials API key vault, masked reveal, Rescan, expiry badges
 ○ Skills DB-backed toggle marketplace
 ○ Pipelines DAG visualiser + detail drawer
 ○ Schedule cron job list + Run/Pause/Delete
 ○ Trust Monitor quarantine, write log, vault activity, privacy policy
 ○ Config settings (WS URL, theme)
 ○ Agent Mesh mesh health per agent server
 ○ Logs raw log file viewer
 ○ API API explorer
```

Responsive: sidebar collapses to **bottom nav** at ≤640px.

---

## Application Views (29)

| # | View | Hash | Key Capability |
|---|---|---|---|
| 1 | Command Center | `#cmd` | KPIs (draggable), 7-day briefing, gates, agents, event feed |
| 2 | Agents | `#agents` | Token bar, circuit breaker badge, per-agent status card |
| 3 | Tasks | `#tasks` | Kanban 4-column, DLQ card, Checkpoints card, task detail modal |
| 4 | Time | `#time` | Per-task ETA (`~Xm` / `~Xh Ym`), global compute stats |
| 5 | Analytics | `#analytics` | Daily bar + cost line + by-agent + SLA doughnut (Chart.js), real DB data |
| 6 | Memory | `#memory` | Entities, similar notes, vault refactor, save to vault |
| 7 | NL Query | `#nlquery` | Plain-English safety-gated SQL results table |
| 8 | Vault Chat | `#vaultchat` | Conversational RAG over vault (Haiku + ChromaDB top-8) |
| 9 | TikToks | `#tiktoks` | TikTok processor (Ollama/API/rules), dry-run, log stream |
| 10 | Code | `#code` | Git status card, inline editor, sandbox runner, file browser |
| 11 | Activity Log | `#activity` | Full event log, level/agent filter, keyword search |
| 12 | Corrections | `#corrections` | Errordiagnosisdiffverify, Obsidian vault export |
| 13 | Eval Quality | `#evalquality` | Per-agent pass rates, fail counts, health alerts |
| 14 | Benchmarks | `#benchmarks` | Agent leaderboard, KPI strip, recent runs table |
| 15 | Errors | `#errors` | Error tracker, Fix button per error, aggregate stats |
| 16 | Prompts | `#prompts` | Prompt version store: promote / rollback per agent |
| 17 | Capabilities | `#capabilities` | Live capability map (features grid + agents grid) |
| 18 | Converter | `#converter` | Prompt rewrite: Haiku / Ollama (qwen3:8b) / Template |
| 19 | Plugins | `#plugins` | Plugin discovery: Install / Dismiss per plugin |
| 20 | Projects | `#projects` | DB-backed; New Project creates vault folder |
| 21 | Credentials | `#credentials` | Key vault, masked reveal, Rescan, expiry badges |
| 22 | Skills | `#skills` | DB-backed toggle marketplace, category filter |
| 23 | Pipelines | `#pipelines` | DAG visualiser + 500px detail drawer with task expand |
| 24 | Schedule | `#schedule` | Cron job list: Run / Pause / Resume / Delete |
| 25 | Trust Monitor | `#trust` | Quarantine, write log, vault activity, privacy policy |
| 26 | Config | `#config` | Settings (WS URL reconnect, theme) |
| 27 | Agent Mesh | `#mesh` | Mesh health per agent server port |
| 28 | Logs | `#logs` | Raw log file viewer |
| 29 | API | `#api` | API explorer |
| 30 | Power | `#power` | Electricity cost tracking — GPU watts, EUR/kWh, monthly aggregates, session history |
| 31 | Research | `#research` | Research loop jobs — start/abort/resume, step progress, synthesis output |
| 32 | Webhooks | `#webhooks` | Webhook ingestion log — recent calls, HMAC status, forwarded task IDs |

### JS View Registry

```javascript
const VIEW_TITLES = {
 cmd: 'Command Center',
 agents: 'Agents',
 tasks: 'Tasks',
 time: 'Time Tracker',
 analytics: 'Analytics',
 memory: 'Memory',
 nlquery: 'NL Query',
 vaultchat: 'Vault Chat',
 tiktoks: 'TikToks',
 code: 'Code',
 activity: 'Activity Log',
 corrections: 'Corrections',
 evalquality: 'Eval Quality',
 benchmarks: 'Benchmarks',
 errors: 'Errors',
 prompts: 'Prompts',
 capabilities: 'Capabilities',
 converter: 'Converter',
 plugins: 'Plugins',
 projects: 'Projects',
 credentials: 'Credentials',
 skills: 'Skills',
 pipelines: 'Pipelines',
 schedule: 'Schedule',
 trust: 'Trust Monitor',
 config: 'Settings',
 mesh: 'Agent Mesh',
 logs: 'Logs',
 api: 'API Explorer',
};
```

---

## Routing & Persistence

### URL Hash Routing

```javascript
function switchView(id, el) {
 // Destroy all Chart.js instances to prevent canvas conflict
 Object.values(state.charts).forEach(c => { try { c.destroy() } catch(_) {} });
 state.charts = {};
 state.view = id;
 document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
 document.getElementById('view-' + id)?.classList.add('active');
 document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
 (el || document.querySelector(`[data-view="${id}"]`))?.classList.add('active');
 document.getElementById('page-title').textContent = VIEW_TITLES[id] || id;
 history.replaceState(null, '', '#' + id);
 // Tab persistence — write last view so next boot restores it
 try { localStorage.setItem('evo_last_view', id); } catch(_) {}
 loadAndRender();
}

// Boot — priority: URL hash > localStorage > default 'cmd'
(async () => {
 const hashView = location.hash.slice(1);
 const storedView = (() => { try { return localStorage.getItem('evo_last_view'); } catch(_) { return null; } })();
 if (hashView && VIEW_TITLES[hashView]) {
 state.view = hashView; // URL hash wins
 } else if (storedView && VIEW_TITLES[storedView]) {
 state.view = storedView; // localStorage second
 }
 // else: default 'cmd' remains
 connectWS(); await loadAndRender(); checkHealth(); setInterval(checkHealth, 30000);
 window.addEventListener('popstate', () => {
 const v = location.hash.slice(1); if (v && VIEW_TITLES[v]) switchView(v);
 });
})();
```

### localStorage Keys

| Key | Stores |
|---|---|
| `evo_last_view` | Last active view id (tab persistence, 2026-05-19) |
| `ecosystemWidgetOrder` | KPI card drag-and-drop order |

```javascript
const DEFAULT_WIDGET_ORDER = ['kpi-tasks', 'kpi-running', 'kpi-cost', 'kpi-sla', 'kpi-health'];

function loadWidgetOrder() {
 try { const s = localStorage.getItem('ecosystemWidgetOrder'); if (s) return JSON.parse(s); }
 catch(_) {} return [...DEFAULT_WIDGET_ORDER];
}

function saveWidgetOrder() {
 const order = Array.from(document.querySelectorAll('#widget-grid [draggable="true"]'))
 .map(c => c.id).filter(Boolean);
 state.widgetOrder = order;
 try { localStorage.setItem('ecosystemWidgetOrder', JSON.stringify(order)); } catch(_) {}
}
```

---

## Real-time Sync Architecture

```
Backend Event Bus
 │
 ▼
WebSocket Broadcaster (/ws)
 │
 ├──▶ Dashboard Browser (instant UI update)
 │ reconnect: 3s auto-retry
 │ keepalive: ping/pong every 25s
 │
 └──▶ Obsidian Sync Worker
 └──▶ sessions/live-session.md (every 60s)
 corrections/*.md (on new correction)
 agents/status.md (on agent change)

WebSocket Events:
 task_update · agent_heartbeat · stats_update
 env_scan_complete · skill_update · pipeline_event
```

---

## .env Auto-Scanner (`env_scanner.py`)

Runs on startup + on demand via `POST /api/env/scan`.

```
Priority order:
 1. C:\...\Ecosystem\.env
 2. C:\...\Ecosystem\orchestrator\.env
 3. ../dashboard/../.env
 4. dashboard/.env
 + os.environ (current process)
 + Windows Credential Manager (cmdkey /list — read-only)

On key found:
 credentials.status = 'active'
 skills with matching requires_credentials status = 'active'
 broadcast("env_scan_complete", summary)
```

---

## Database Schema

```sql
tasks (id, name, agent_type, pipeline, stage, priority, status,
 instruction, result, error, tokens_used, cost_usd,
 created_at, started_at, completed_at,
 notes TEXT) -- T-NEW-31 migration

corrections (id, task_id, project, error_type, error_message,
 diagnosis, fix_applied, fix_description, verified,
 verification_notes, created_at, verified_at)

projects (id, name, path, rules JSON, created_at)

project_instructions (id, project_id, agent_type, content, version,
 created_at, updated_at)

credentials (key_name, description, status, unlocks_skills JSON,
 added_at, rotation_reminder_days)

skills (id, name, version, description, status,
 requires_credentials JSON, capabilities JSON,
 install_command, installed_at)

events (id, timestamp, level, event, data JSON)

agent_heartbeats (agent_id, agent_type, status, task_id, task_name,
 tokens_used, token_budget, error_count, circuit_state,
 cost_usd, last_seen)
```

---

## File Structure

```
dashboard/
├── main.py FastAPI backend + WebSocket server + env scan endpoints
├── database.py SQLite models + async queries (8 tables)
├── ws_manager.py WebSocket connection manager + broadcaster
├── obsidian_sync.py Vault sync worker (60s interval)
├── env_scanner.py API key auto-detection (stdlib only) NEW
├── config.py Ports, paths, settings
├── index.html Complete frontend SPA — liquid glass purple theme REDESIGNED
└── dashboard.db SQLite database (auto-created on first run)

project root/
└── .env.example Key template (10 keys documented) NEW
```

---

## Ports

| Service | Port |
|---|---|
| Orchestrator API | 8765 |
| Dashboard App + WebSocket | 8766 |

---

## ETA & Duration Formatting

```javascript
fmtETA(minutes) // <60 "~Xm" | ≥60 "~Xh Ym"
fmtDuration(seconds)// s / m s / h m
```

---

## Decisions

### 2026-06-01 — Session I: Open Claw/Hermes improvements
Rate tile: ss-rate-tile in top strip computes (total_cost_usd/uptime_hours)*24*30 -> monthly cost projection.
 Shows "--" if uptime < 60s. loadOrchStatus() stores in state.orchStatus, triggers renderSummaryStrip().
Auto-generated skills section: GET /api/skills/auto reads VAULT/Knowledge/Skills/*.md (skips _index.md),
 parses frontmatter, returns [{agent_type, task_slug, created}]. loadAutoSkills() renders Name/Source/Created table
 in auto-skills-section below the skills grid. loadSkills() calls loadAutoSkills() at the end.
Strip preference toggles: all 9 existing tiles given id attributes (ss-tasks-tile ... ss-ping-tile).
 Settings view: "Status Strip" section with toggle rows via renderStripPrefRows().
 applyStripPrefs()/saveStripPref()/_loadStripPrefs() manage strip_prefs localStorage key.
 Prefs applied on toggle change and on every page load.


### 2026-06-01 — Session A: Agent icon system
Replaced single-letter agent avatars with type-specific Lucide SVG icons.
Added `AGENT_ICONS` constant (23 entries: 18 existing + 5 planned new agents) before `renderAgents()`.
Each icon is a 16x16 SVG using `stroke="currentColor"` to inherit the purple accent color.
Applied to: agents-grid cards (line ~6157) and command-center top-agents mini-list.
Fallback: `AGENT_ICONS[role] || escHtml(displayName[0].toUpperCase())` so unknown types still render.
Also fixed: credential fallback removed hardcoded masked key examples; health card port reference made generic.


### 2026-06-01 — T-NEW-61: Project agent rules endpoints
`GET /api/projects/{project_id}/agent-rules/{agent_type}` — returns file content or empty string if file missing.
`POST /api/projects/{project_id}/agent-rules/{agent_type}` (auth-gated) — calls `log_project_agent_rule()`, returns `{ok, path}`.


### 2026-06-01 — T-NEW-51: Agent sessions grid
`GET /api/agents/sessions` proxy added. `state.agentSessions` field. `loadAgentSessions()` + `renderAgentSessions()` functions. Live sessions grid above agent mesh grid in Agents view. Refreshes on `agent_heartbeat` WS events.

### 2026-06-01 — New endpoints (T-NEW-48/50/56/58/59/60/62)
`POST /api/agents/{type}/rule` | `GET /api/agents/sessions` | `POST /api/paperless/sync` | `POST /api/tools/wrap` + `/wrap/confirm` | `POST /api/images/generate` | `POST /api/security/scan-url` | `POST /api/skills/scan` | `POST /api/animations/generate` + `GET /api/animations/{job_id}`

### 2026-06-01 — 8 new endpoints (T-NEW-48/50/56/58/59/60/62)
, , , , , , , , , .

| Date | Decision |
|---|---|
| 2026-05-27 | T-NEW-35: health-score KPI added to DEFAULT_WIDGET_ORDER; composite score from 5 dimensions (success rate 40pt, SLA 20pt, RTT 15pt, budget headroom 15pt, error rate 10pt) |
| 2026-05-27 | T-NEW-33: budget guard in orchestrator not dashboard — avoids dual-write risk; dashboard reads via `_budget_pause_active` flag |
| 2026-05-27 | T-NEW-26: bulk-cancel only hits dashboard DB — does not cancel tasks already in orchestrator memory queue (MVP tradeoff, acceptable) |
| 2026-05-27 | T-NEW-31: notes stored in tasks table (ALTER TABLE migration) rather than separate table — keeps task lookup join-free |
| 2026-05-27 | T-NEW-13 task search: `/api/tasks/search` declared BEFORE `/{task_id}` route — FastAPI matches in declaration order |
| 2026-05-25 | Prompt version management: save/promote/rollback proxied through dashboard orchestrator — dashboard never manages prompt state directly |
| 2026-05-25 | `_orch_hdrs()` helper — centralises `X-API-Key` forwarding; all 13 orchestrator proxy calls updated (session 46 wiring audit) |

---

## Related Nodes

- [Orchestration](/notes/orchestration) — primary data source for tasks and agents
- [Skills Registry](/notes/skills-registry) — skills marketplace data
- Credential Manager — credential vault data
- [Observability](/notes/observability) — events and metrics feed
- Business Intelligence — analytics panel data
- [Pipeline Manager](/notes/pipeline-manager) — pipeline visualizer data
- internal notes — build log for Tasks 12 & 13
