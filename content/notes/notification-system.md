---
tags: [notifications, reliability, built]
created: 2026-05-15
updated: 2026-05-15
status: built
---

> Pushes real-time alerts about task events, cost warnings, service crashes, and approval requests to Discord and Telegram. The primary channel for remote monitoring and control.

---

## Components

### Telegram Notifier — `orchestrator/notifier/telegram.py`

The primary notification channel. Uses Python's standard library `urllib.request` — no external SDK required (ADR-004).

**Key functions:**

| Function | When called | What it sends |
|---|---|---|
| `send_alert(msg, level)` | Any event worth noting | Plain text Telegram message |
| `send_cost_warning(spend, cap, period)` | At 80% of daily/monthly cap | Cost alert with current/cap figures |
| `send_crash_alert(service, reason, attempt)` | Service crash detected by Watchdog | Service name, crash reason, retry count |
| `send_recovery_alert(service)` | Service comes back healthy | Service name, recovery confirmed |
| `send_approval_request(task)` | Approval gate triggered | Task details, approve/reject inline buttons |
| `weekly_briefing(stats)` | Monday 08:00 UTC | Full weekly digest (see below) |

**Deduplication (ADR-009):**
- Identical messages within 300 seconds (5 minutes) are silently suppressed
- Prevents alert storms when a condition fires repeatedly (e.g. budget near-cap across many tasks)
- 300s window is short enough that genuine new conditions still alert promptly

**Rate limiting:**
- Minimum 1.2 seconds between consecutive sends
- Enforced via a timestamp check before every send

---

### Telegram Command Listener — `orchestrator/notifier/telegram_commands.py`

A background polling thread that checks for incoming Telegram messages every 5 seconds. Supports the following commands:

| Command | Action |
|---|---|
| `/approve <task_id>` | Approve a gated task waiting for human confirmation |
| `/reject <task_id>` | Reject a gated task |
| `/status` | Return current queue depth, active agents, circuit breaker states |
| `/budget` | Return today's spend versus daily cap |
| `/queue` | List the next 5 tasks in the priority queue |
| `/briefing` | Trigger an on-demand weekly briefing (same as scheduled Monday report) |

---

### Weekly Briefing — `orchestrator/notifier/briefing.py`

Generates and sends the automated Monday morning digest. See Features/Implemented/Weekly Briefing for full documentation.

**Key functions:**

| Function | What it does |
|---|---|
| `gather_weekly_stats()` | Reads 7 days of event logs — counts tasks by status, sums spend, computes per-agent eval pass rates |
| `send_weekly_briefing()` | Formats and sends the briefing; idempotency stamp prevents double-sends in same ISO week |

---

### Discord Webhook — `orchestrator/notifier/discord.py`

A secondary notification channel. Sends the same events as Telegram via a webhook URL. Independent of the Discord bot process — works even when `discord_bot` is crashed.

Set `DISCORD_WEBHOOK_URL` in `.env`. Used by:
- Watchdog (crash/recovery alerts)
- BudgetGuard (cost alerts)
- Approval gates (gate opened/closed)

---

## Integration Points

| Component | What it notifies |
|---|---|
| `watchdog.py` | Service crash, service recovery, watchdog online/offline |
| `orchestrator/budget/guard.py` | 80% cap warning, hard cap hit |
| `orchestrator/gates/gate.py` | Gate opened (task waiting for approval), gate result |
| `orchestrator/evaluator/eval_agent.py` | Prompt health alert when pass_rate < 85% |
| `orchestrator/scheduler/scheduler.py` | Job fired, job completed, job failed |
| `orchestrator/notifier/briefing.py` | Monday weekly digest |

---

## Required Environment Variables

```env
TELEGRAM_BOT_TOKEN=... # from @BotFather
TELEGRAM_CHAT_ID=... # your personal chat ID
TELEGRAM_SILENT=false # set true to log without sending (testing)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Both are optional — the system degrades gracefully when either is missing. If neither is set, alerts are only written to the event log.

---

## Known Gaps

- Discord bot slash commands (`/approve`, `/reject`, `/status`) are implemented in `discord_bot/bot.py` and are separate from the webhook notifier — they depend on the Discord bot process being alive.
- Telegram inline approval buttons (keyboard markup) work for approval gates but the button callback is currently processed by the polling loop, not a webhook — response latency is up to 5 seconds.
- Discord/Telegram input is not yet run through the trust classifier before processing commands (known gap from Phase 6).

---

## Related Nodes

- Features/Implemented/Telegram Notifications — user-facing documentation
- Features/Implemented/Telegram Commands — command reference
- Features/Implemented/Weekly Briefing — Monday autonomous digest
- [Components/Interface/Discord Bot](/notes/discord-bot) — full Discord bot documentation
- [Review/Architecture Decision Records](/notes/architecture-decision-records) — ADR-004 (stdlib over python-telegram-bot), ADR-009 (dedup TTL)
