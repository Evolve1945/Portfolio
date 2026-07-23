---
tags: [notifications, layer, built]
created: 2026-04-26
updated: 2026-04-26
status: built
---

> Two-way control channel for the ecosystem — real-time notifications pushed to Discord, tasks submitted back from any device.

**Status: BUILT.** Files in `discord_bot/`. Requires a bot token and two channel IDs to run. See setup steps below.

---

## What It Does

| Direction | What happens |
|---|---|
| Ecosystem Discord | Task completions, failures, circuit breaker alerts, correction logs, approval requests |
| Discord Ecosystem | Slash commands submit tasks, @mention routes to specific agent types |
| Approval gates | `approval_pending` tasks send a button message — click / to approve or reject |

---

## Files

```
discord_bot/
 bot.py Main bot — slash commands, WS listener, approval views
 dashboard_client.py Async HTTP + WebSocket client for the dashboard API
 formatters.py Discord embed builders (task, status, agents, approval, error)
 config.py Settings loaded from .env
 requirements.txt discord.py, aiohttp, python-dotenv
 .env.example Copy .env, fill in token + channel IDs
```

---

## Slash Commands

| Command | Description |
|---|---|
| `/task <description> [agent] [priority]` | Submit a task to the orchestrator |
| `/status` | Ecosystem snapshot — agents, task counts, cost |
| `/agents` | All registered agents and their current state |
| `/tasks [status] [limit]` | Recent tasks with optional status filter |
| `/approve <task_id>` | Approve a pending task |
| `/reject <task_id> [reason]` | Reject a pending task |

---

## @Mention Routing

In the commands channel, messages matching `@<agent_type> <instruction>` are auto-submitted as tasks:

```
@coder write unit tests for auth.py
@researcher find recent papers on RAG compression
@analyst summarise last week's task cost by agent
```

Agent types: `coder · researcher · analyst · writer · reviewer · planner · tester · devops · designer · summarizer · memory · orchestrator`

---

## Notification Levels

Set `DISCORD_NOTIFY_LEVEL` in `.env`:

| Level | What gets posted |
|---|---|
| `QUIET` | Failures, DLQ tasks, circuit breaker trips |
| `NORMAL` (default) | + completions for HIGH/CRITICAL priority tasks + corrections |
| `VERBOSE` | All task completions + corrections |

---

## Approval Gates (Task 21 foundation)

When the orchestrator submits a task with `status: approval_pending`:
1. Bot sends a message with Approve / Reject buttons
2. Any user in `DISCORD_APPROVER_IDS` can click
3. Approve task status set back to `pending` (queued for execution)
4. Reject task status set to `rejected`
5. Timeout auto-reject after `DISCORD_APPROVAL_TIMEOUT` seconds

---

## Setup (5 steps)

1. Go to https://discord.com/developers/applications New Application Bot
2. Enable **Message Content Intent** under Bot Privileged Gateway Intents
3. Copy bot token `discord_bot/.env` as `DISCORD_BOT_TOKEN`
4. Invite bot to your server with scopes: `bot` + `applications.commands`, permissions: `Send Messages · Embed Links · Read Message History`
5. Copy channel IDs `DISCORD_NOTIFICATIONS_CHANNEL_ID` + `DISCORD_COMMANDS_CHANNEL_ID`

Then run:
```bash
cd discord_bot
pip install -r requirements.txt
python bot.py
```

---

## Dashboard Integration

The bot connects to the dashboard at `http://localhost:8766` (configurable via `DASHBOARD_URL`).

- Reads: `GET /api/stats`, `/api/agents`, `/api/tasks`, `/api/events`
- Writes: `POST /api/tasks` (submit), `PATCH /api/tasks/{id}` (approve/reject)
- Streams: `ws://localhost:8766/ws` (real-time event feed, auto-reconnects)

The PATCH endpoint was added to `dashboard/main.py` as part of this build.

---

## Related Nodes

- [Dashboard](/notes/dashboard) — event source for all notifications
- [Orchestration](/notes/orchestration) — submits tasks with `approval_pending` status
- Approval Gates — full approval gate spec (Task 21)
- [Notification System](/notes/notification-system) — broader notification architecture (Task 20)
- Remote Access — Tailscale + Discord = control from school/phone
