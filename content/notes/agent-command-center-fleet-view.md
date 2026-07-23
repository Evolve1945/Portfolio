> Built 2026-07-16 — the first piece of the 100 Propositions **Surface block**
> (sequencing #5). Dark behind `FLEET_VIEW_ENABLED`, fail-open. Suite **1309 green**.
> P62 (omnibox goal-surface) and P91 (dashboard-v2) remain — both L-effort.

## Why

Watching the system meant tailing task logs. The fleet view replaces that with a
**kanban of every run** at a glance: what's pending, running, parked for approval,
done, or failed — each card carrying its cost, token spend, owning agent, and the
actions you'd take (cancel a live run). (Windsurf command center.)

## The pure aggregator (P61)
`orchestrator/fleet.py` · flag `FLEET_VIEW_ENABLED`

- `build_fleet_board(tasks, active_only=False)` maps raw task rows (the dashboard
 `tasks` table shape) into five kanban columns — **pending running awaiting
 approval completed failed**. `normalize_status()` folds every producer's status
 string (queued, in_progress, done, error, …) into a canonical column key.
- Each card carries `cost_usd`, `tokens`, `agent`, a truncated title, `pending_approval`
 (status == paused — a P02 NodeInterrupt parked for a human), and `pausable`
 (status == running). Columns report count + summed cost; totals report in-flight,
 awaiting-approval, and total cost. `active_only` drops the finished columns.
- Pure and offline-testable (takes plain lists). Fail-open: a malformed row is skipped,
 never fatal. `empty_board()` is the inert board served when the flag is off.

## Dashboard surface
`dashboard/main.py` `GET /api/fleet` · `dashboard/index.html` "Fleet" view

- `GET /api/fleet?active_only=` feeds live `tasks` rows through `build_fleet_board`;
 returns an inert `{enabled:false}` board when the flag is off (the view then shows an
 enable hint).
- A **Fleet** nav item + kanban view renders the columns; running cards get a **Cancel**
 button wired to the existing `/api/tasks/bulk-cancel`. Verified live: the endpoint
 returns correct columns/totals (e.g. pending/completed counts, in-flight + cost totals)
 with the flag on; frontend JS passes `node --check`.

## Key files
- `orchestrator/fleet.py` — build_fleet_board, normalize_status, empty_board
- `dashboard/main.py` — `GET /api/fleet`
- `dashboard/index.html` — Fleet nav + view + `renderFleet()` / `fleetCancel()`
- Tests: `tests/test_fleet.py` (10) — suite 1309

## Flag (OFF — see `.env.example`)
`FLEET_VIEW_ENABLED`

## Related
- 100 Propositions (sequencing #5 — P61 DONE; P62/P91 open) · [Interop + Quality](/notes/interop-quality)
- [Durable Execution](/notes/durable-execution-eval-ratchet) (paused = P02 parked-for-approval) · [Agentic OS Modules](/notes/agentic-os-modules)
