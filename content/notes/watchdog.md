## What It Is
The Watchdog is the self-healing monitor for the Claude Ecosystem. It runs as a background process and continuously checks that the Orchestrator, Dashboard, and all 11 agent servers are alive and responding. If any service crashes or stops responding, the Watchdog automatically restarts it, then sends you a Telegram alert describing what crashed and when it recovered.

## Why It Matters
In any complex system running on a personal machine, services crash — due to bugs, memory limits, Windows updates, or power events. Without the Watchdog, a crashed agent or orchestrator would silently fail: no alert, no restart, no record. You might not notice for hours. The Watchdog means the ecosystem is self-healing: most crashes are resolved automatically in seconds, and you are always notified so you know what happened even if you didn't have to do anything.

## How It Works
The Watchdog uses two methods to check service health. For the Orchestrator and Dashboard, it makes HTTP requests to their `/health` endpoints every few seconds — if the request times out or returns an error, the service is considered down. For the 11 agent servers in the mesh, it checks both the HTTP health endpoint and the process ID (PID) to confirm the Python process itself is still running.

When a service is detected as down, the Watchdog waits briefly (to rule out transient glitches) then attempts a restart. The restart delay follows exponential backoff: 5 seconds for the first attempt, 10 for the second, 20 for the third, and so on — up to a maximum of 5 minutes between attempts. This prevents the Watchdog from flooding the system with restart attempts if a service has a persistent underlying problem.

Each crash and recovery is logged to the Obsidian vault as an error note (with timestamp, service name, and recovery status) and pushed to Telegram. The Watchdog itself is registered as a Windows service via NSSM or Task Scheduler, so it restarts automatically if the machine reboots.

## Current Status
 Built — HTTP + PID health checks, exponential backoff restarts, Telegram crash/recovery alerts, and Obsidian error note writing are all live.

## Key Files
- `watchdog.py` — Main watchdog loop: health checks, restart logic, alert dispatch
- `setup/install_service.ps1` — Windows service installation script

## Open Questions / Known Gaps
- The Watchdog currently monitors agent mesh processes indirectly (via HTTP health). Extending it to directly monitor the AgentRegistry's process table is a planned improvement.

## Related
- Features/Implemented/Always-On Service — the Windows service layer that keeps the Watchdog running after reboots
- [Components/Agent Mesh](/notes/agent-mesh) — the agent servers the Watchdog monitors
- [Integrations/Telegram](/notes/telegram-integration) — crash/recovery alerts are sent here
- [Components/Orchestrator](/notes/orchestrator) — one of the services the Watchdog monitors
