## What It Is
The Discord integration allows the ecosystem to send notifications, approval requests, and cost alerts to a Discord channel via a webhook URL. It was the original notification channel before Telegram was implemented. The integration still exists in the codebase (particularly in the approval gates and budget guard) and can be used alongside Telegram, but Telegram is now the primary and more fully-featured notification channel.

## Why It Matters
Discord is convenient for team environments or situations where you prefer a desktop notification channel. The webhook approach requires no bot account setup — just a webhook URL from a Discord channel's settings. For users who spend more time in Discord than Telegram, it remains a viable notification surface. The approval gate's Discord buttons (interactive "Approve / Reject" buttons embedded in the Discord message) are also a distinctive feature not yet replicated in Telegram.

## How It Works
Discord webhooks work by sending an HTTP POST request to a channel-specific URL. The payload is a JSON object describing the message: text content, embedded rich cards (with fields, colours, and titles), and interactive action buttons (in the case of approval gates).

The `DISCORD_WEBHOOK_URL` environment variable activates the integration. When set, the Budget Guard, Approval Gates, and Watchdog send formatted embed messages to the Discord channel. The approval gate message includes two buttons — Approve and Reject — that when clicked call back to the orchestrator's approval API.

The Discord bot slash command interface (`/status`, `/budget`, `@mention routing`) was also built as part of Task 13.5 but has since been largely superseded by Telegram commands, which are more reliable on mobile and do not require a server-side bot application.

## Current Status
 Partial — Webhook notifications are functional. The slash command interface exists but is not actively maintained. Telegram is the recommended primary notification channel.

## Key Files
- `orchestrator/budget/guard.py` — Discord webhook alert call
- `orchestrator/gates/gate.py` — Discord approval button message construction

## Open Questions / Known Gaps
- The Discord integration is a secondary channel and may have inconsistencies compared to the Telegram implementation as the codebase evolves.
- The interactive button callback requires the orchestrator to be reachable by Discord's servers, which may not be possible without Tailscale or port forwarding.

## Related
- [Integrations/Telegram](/notes/telegram-integration) — the primary, fully-supported notification channel
- Features/Implemented/Approval UI — the dashboard-based approval method (no external dependency)
