## What It Is
Telegram is the primary mobile interface for the Claude Ecosystem. The integration consists of two parts: a notification sender (the system sends you alerts, briefings, and approval requests) and a command listener (you send commands to control the system). Together they make your phone a full remote control and alert panel for the ecosystem, accessible from anywhere.

## Why It Matters
The ecosystem runs autonomously and often unattended. Telegram is the channel through which you stay connected to it without being at your desk. Budget warnings, task completions, service crashes, and gate approvals all arrive on your phone in real time. The two-way nature of the integration means you can not only receive information but also take action — approving a task, triggering a briefing, checking queue depth — from anywhere with a mobile signal.

## How It Works
The integration requires two environment variables: `TELEGRAM_BOT_TOKEN` (the bot's authentication token, obtained by creating a bot via Telegram's BotFather service) and `TELEGRAM_CHAT_ID` (your personal Telegram user ID, ensuring only you receive messages and only your messages are processed as commands).

The **notification sender** (`orchestrator/notifier/telegram.py`) uses Telegram's sendMessage API endpoint. Messages are formatted with Markdown for readability (bold headers, code blocks for technical details). A rate limiter enforces a minimum gap of 1.2 seconds between consecutive messages to stay within Telegram's rate limits. A deduplication cache (5-minute window, configurable) prevents the same alert from being sent more than once within the window — critical for preventing alert floods from rapid service restarts or repeated budget threshold crossings.

The **command listener** (`orchestrator/notifier/telegram_commands.py`) uses long-polling (`getUpdates` with a 30-second timeout). On each poll cycle, any new messages from your chat ID are processed. Commands are validated against a strict allowlist (`/approve`, `/reject`, `/status`, `/budget`, `/queue`, `/briefing`). Unknown commands receive a help message listing available commands. The listener runs as a background thread — if it crashes, the notification sender continues working independently.

**Alert types:** Task completion (agent, duration, cost), task failure (error summary, retry count), budget warning (80% of daily/monthly cap), budget exceeded (cap reached, system paused), service crash (service name, downtime start), service recovery (service name, total downtime), approval gate (task details, cost estimate, approve/reject prompt), weekly briefing (stat digest).

**Silent mode:** alerts can be sent without triggering a phone notification sound by setting `disable_notification=True` — used for informational messages during quiet hours.

## Current Status
 Built — Notification sender and command listener are both live and wired into all major system components.

## Key Files
- `orchestrator/notifier/telegram.py` — Notification sender, rate limiter, deduplication
- `orchestrator/notifier/telegram_commands.py` — Command listener, polling loop

## Open Questions / Known Gaps
- The Voice Interface (planned) will add voice message handling to this integration.
- Telegram input is not yet passed through the Trust Classifier.

## Related
- Features/Implemented/Telegram Notifications — alert types and wiring details
- Features/Implemented/Telegram Commands — command reference
- [Features/Planned/Voice Interface](/notes/voice-interface) — voice message extension of this integration
