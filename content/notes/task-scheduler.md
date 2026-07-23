---
tags: [orchestration, built]
created: 2026-04-28
updated: 2026-05-15
status: built
---


> Cron-style recurring job runner — fires orchestrator tasks and DAG pipelines automatically.
> Implemented in Task 24 — `orchestrator/scheduler/`.

---

## Design

| Setting | Value |
|---|---|
| Schedule formats | Cron (5-field) + human intervals (`every monday at 9am`, `every 30m`) |
| Storage | SQLite — `logs/scheduler/jobs.db` |
| Missed job recovery | Fires immediately on restart (if resources allow) |
| Concurrency cap | `SCHED_MAX_CONCURRENT` (default 3) |
| Resource gating | CPU / RAM / VRAM — skips job if any threshold exceeded |
| Notifications | Discord + Telegram on fire / complete / fail |
| Approval gates | Same human-in-the-loop gate as manual tasks |
| DAG support | Optional — set `dag_pipeline: true` per job |
| Pre-built jobs | Weekly cost report · Hourly health check · Daily research digest |

---

## Resource Thresholds (env vars)

| Variable | Default | Effect |
|---|---|---|
| `SCHED_CPU_MAX_PCT` | 80 | Skip job if CPU above this |
| `SCHED_RAM_MAX_PCT` | 85 | Skip job if RAM above this |
| `SCHED_VRAM_MAX_PCT` | 90 | Skip job if VRAM above this |
| `SCHED_MAX_CONCURRENT` | 3 | Max simultaneous scheduled jobs |

---

## Supported Schedule Formats

```
# Cron (5 fields)
0 9 * * 1 Every Monday at 9am
0 */2 * * * Every 2 hours
*/15 * * * * Every 15 minutes

# Human intervals
every 30m Every 30 minutes
every 2h Every 2 hours
every day Daily (midnight)
daily at 9am Daily at 9:00
every monday at 8am Weekly Monday at 8:00
hourly Every hour
```

---

## Control

| Interface | Commands |
|---|---|
| Discord | `/schedule list\|add\|toggle\|delete\|run` |
| Dashboard | Schedules view — table, add form, inline buttons |
| Config file | `schedules.yaml` in project root — seeded on first boot |
| REST API | `GET/POST /schedules`, `POST /schedules/{id}/toggle\|run`, `DELETE /schedules/{id}` |

---

## Pre-built Jobs (disabled by default)

Defined in `schedules.yaml` at the project root. All are seeded into the SQLite job store on first boot if the store is empty. All are disabled by default.

| Job name | Schedule | Agent | Purpose |
|---|---|---|---|
| Weekly Briefing | every monday at 8am | analyst | LLM analyst summary (separate from the automatic stats briefing) |
| Weekly Cost Report | every monday at 8am | analyst | Token usage, per-agent cost breakdown, burn rate |
| Hourly Health Check | every 1h | devops | Component reachability, error log scan |
| Daily Research Digest | daily at 7am | researcher | AI ecosystem news, new MCP servers, Anthropic updates |

Enable any of these in `schedules.yaml` by setting `enabled: true`.

### schedules.yaml Job Fields

```yaml
jobs:
 - name: "Job name" # display name in UI
 schedule: "cron or human" # cron string or human-readable interval
 agent_type: analyst # which agent type handles the task
 priority: NORMAL # LOW / NORMAL / HIGH / CRITICAL
 instruction: > # multi-line text instruction for the agent
 ...
 enabled: false # true to activate on next restart
```

---

## Note: Weekly Briefing vs Scheduled Briefing

The automatic Monday 08:00 UTC Telegram stats briefing (Task 33) fires via an internal background thread (`_weekly_briefing_monitor`) in `orchestrator.py` — independent of this scheduler. It does not appear in the scheduler job list.

The "Weekly Briefing" entry in `schedules.yaml` is an optional additional LLM-generated analyst report that can run alongside the stats briefing if enabled. They are separate features.

---

## Related Nodes

- [Orchestration](/notes/orchestration) — receives tasks submitted by the Scheduler
- Features/Implemented/Weekly Briefing — most prominent scheduled task (auto-fires independently of scheduler)
- [Integrations/Telegram](/notes/telegram-integration) — Scheduler fires Telegram alerts on job completion / failure
- [Review/Architecture Decision Records](/notes/architecture-decision-records) — ADR-001 (SQLite for job store)

### [--] Skills Scan
- **Time:** 2026-07-20 14:37
- **Job ID:** `bd67fe4a` **Task ID:** `0f23ed5b`
- **Schedule:** `0 9 * * 0` **Agent:** `researcher`
- **Status:** fired

### [--] Knowledge Scout
- **Time:** 2026-07-20 14:37
- **Job ID:** `a628dcb8` **Task ID:** `e646d75f`
- **Schedule:** `daily at 6am` **Agent:** `analyst`
- **Status:** fired
