---
tags: [architecture, review]
created: 2026-05-15
updated: 2026-05-15
status: active
---
<!-- Last updated 2026-05-15: ADR-012 and ADR-013 added -->

> This file captures the *why* behind key technical choices made during the Claude Ecosystem build.
> Every decision here was made deliberately. Understanding the reasoning prevents well-intentioned future changes from undoing a constraint that existed for a good reason.

---

## ADR-001: SQLite over PostgreSQL for budget, gates, and scheduler databases

**Date**: 2026-04-29
**Status**: Accepted

**Decision**: All three persistence stores (budget.db, gates.db, scheduler/jobs.db) use SQLite, not a full database server.

**Reason**: The ecosystem runs on a single Windows machine for a single user. SQLite requires zero setup, zero running daemon, zero network configuration, and the database files survive reboots unchanged. The write volume (a few hundred rows per day) is well within SQLite's limits.

**Alternatives considered**: PostgreSQL (adds an always-on service and connection management overhead), Redis (fast but volatile without persistence config, adds another service to manage).

**Consequences**: Cannot be accessed by multiple machines simultaneously. If the system ever becomes multi-node, this decision must be revisited.

---

## ADR-002: In-memory priority queue over Redis or Celery

**Date**: 2026-04-26
**Status**: Accepted

**Decision**: The task queue (`PriorityTaskQueue`) is a Python `deque` in memory, not an external message broker.

**Reason**: Redis and Celery add operational complexity (running services, connection management, serialisation) that is not warranted for a single-machine, single-user system. The in-memory queue is faster (no network hop), simpler to debug, and always available. Tasks lost on crash are logged to the Dead Letter Queue file (`logs/dlq.jsonl`) and can be recovered.

**Alternatives considered**: Redis/Celery (distributed, crash-safe), RabbitMQ (overkill).

**Consequences**: Queue state is lost on orchestrator crash. The DLQ mitigates this for failed tasks. Accepted trade-off.

---

## ADR-003: ChromaDB over Pinecone or Weaviate for vector storage

**Date**: 2026-04-28
**Status**: Accepted

**Decision**: ChromaDB runs locally on disk. No cloud vector database.

**Reason**: Local-first means zero API cost for embedding queries, zero data sent to third parties, and no dependency on an external service's uptime. ChromaDB's `PersistentClient` writes to disk and survives restarts. At the scale of one user's task history, local ChromaDB is indistinguishable in performance from a cloud alternative.

**Alternatives considered**: Pinecone (cloud-only, costs money at scale), Weaviate (self-hosted but more complex to run), Qdrant (good alternative, ChromaDB chosen first).

**Consequences**: Embeddings are stored locally. If the machine's disk fails, the vector store is lost (but can be rebuilt from source files). No horizontal scaling possible.

---

## ADR-004: Stdlib-only HTTP for Telegram notifier

**Date**: 2026-05-14
**Status**: Accepted

**Decision**: The Telegram notifier (`notifier/telegram.py`) uses Python's built-in `urllib.request` instead of the `python-telegram-bot` library.

**Reason**: `python-telegram-bot` is a large dependency (asyncio-based, ~40 transitive dependencies) that would need to be installed, updated, and managed. The Telegram Bot API is a simple JSON-over-HTTPS interface. Using `urllib.request` keeps the notifier dependency-free — it works in any Python environment without `pip install`.

**Alternatives considered**: `python-telegram-bot` (full-featured but heavy), `httpx` (lighter but still a dependency), `requests` (common but still a dependency).

**Consequences**: More verbose HTTP code, manual JSON serialisation. Rate limiting and deduplication handled manually (1.2s minimum between sends, 300s dedup TTL).

---

## ADR-005: NSSM for Windows service management

**Date**: 2026-05-14
**Status**: Accepted

**Decision**: The orchestrator watchdog is registered as a Windows service using NSSM (Non-Sucking Service Manager), with Task Scheduler as a fallback.

**Reason**: Windows does not natively support running Python scripts as services without significant ceremony. NSSM wraps any executable as a proper Windows service with automatic restart, stdout/stderr logging, and environment variable forwarding. It is a well-established, trusted tool in the Windows ecosystem.

**Alternatives considered**: Task Scheduler alone (works but less robust restart behaviour), `pywin32` `ServiceFramework` (requires Python-specific service code), Docker (adds container overhead).

**Consequences**: NSSM must be installed separately. The install script (`setup/install_service.ps1`) handles detection and provides a Task Scheduler fallback if NSSM is absent.

---

## ADR-006: Budget caps — $1/day, $15/month, $0.50/pipeline

**Date**: 2026-04-28
**Status**: Accepted

**Decision**: Three hard caps enforced by BudgetGuard: $1.00 daily, $15.00 monthly, $0.50 per pipeline run.

**Reason**:
- $1/day: A student's daily discretionary budget for AI tooling. Tight enough to build the habit of cost-conscious task design.
- $15/month: Keeps total monthly spend below a Netflix subscription while the system is in development.
- $0.50/pipeline: Prevents a runaway multi-step pipeline from consuming the entire daily budget in one run.

All three values are configurable via environment variables (`DAILY_CAP`, `MONTHLY_CAP`, `PIPELINE_CAP`) and can be raised once usage patterns are understood.

**Alternatives considered**: No caps (risky), per-agent caps only (doesn't protect total), alert-only without blocking (insufficient deterrent).

**Consequences**: Some high-quality tasks may be blocked mid-day. The manual override endpoint (`POST /budget/override`) exists for deliberate exceptions.

---

## ADR-007: Evaluation thresholds — PASS >= 22, WARN 15-21, FAIL < 15

**Date**: 2026-05-04
**Status**: Accepted

**Decision**: Agent outputs are scored out of 25 (5 dimensions × 5 points each). PASS requires >= 22, WARN is 15-21, FAIL is below 15.

**Reason**: A score of 22/25 means at least a 4 on every dimension on average — genuinely good output. The 15-point WARN floor is intentionally lenient to avoid blocking useful-but-imperfect outputs from being embedded in the RAG memory. Only clearly poor outputs (below 15) are excluded from memory.

**Model used for evaluation**: Claude Haiku at approximately $0.0002 per evaluation. At 1000 tasks per month, evaluation costs ~$0.20 — negligible compared to the task costs themselves.

**Consequences**: FAIL outputs are not embedded in RAG memory and not counted in success metrics. WARN outputs are embedded but flagged. Prompt health alerts fire when pass rate drops below 85% over at least 10 runs.

---

## ADR-008: Agent port assignment (8770-8780)

**Date**: 2026-04-28
**Status**: Accepted

**Decision**: The 11 mesh agents occupy ports 8770-8780 sequentially. Orchestrator is on 8765, dashboard on 8766.

**Reason**: The 8700-8900 range avoids common development ports (3000, 5000, 8000, 8080, 8443) and registered service ports. Sequential assignment makes the port map intuitive and predictable. Agent type is implied by port number (8770 = architect, 8771 = coder, etc.).

**Consequences**: These ports must be free on the host machine. Conflicts would require updating `agents.yaml` and the watchdog configuration.

---

## ADR-009: Telegram message deduplication TTL — 300 seconds

**Date**: 2026-05-14
**Status**: Accepted

**Decision**: Identical Telegram messages are suppressed if the same text was sent within the last 300 seconds (5 minutes).

**Reason**: Some conditions (budget near-cap, degraded prompt health) can fire repeatedly within seconds as tasks continue to complete. Without deduplication, a brief cost spike would generate dozens of identical alerts, making the phone unusable. 5 minutes is short enough that genuine recurring issues still alert within one check cycle.

**Consequences**: A genuinely new identical condition within 5 minutes will be silently suppressed. This is an acceptable trade-off for alert usability.

---

## ADR-010: Circuit breaker thresholds — 5 failures to open, 60 seconds to recover

**Date**: 2026-04-26
**Status**: Accepted

**Decision**: Each agent's circuit breaker opens after 5 consecutive failures and attempts recovery after 60 seconds in the open state.

**Reason**: 5 failures filters out transient API errors while catching genuine agent degradation quickly. 60 seconds gives the API provider time to recover from rate limits or temporary outages. These values match the defaults used by Netflix Hystrix and are widely validated in production systems.

**Consequences**: A consistently failing agent is suspended for at least 60 seconds per cycle. The watchdog's separate health check layer provides additional recovery at the process level.

---

## ADR-011: In-process agents by default, HTTP mesh opt-in

**Date**: 2026-04-28
**Status**: Accepted

**Decision**: When `USE_HTTP_MESH=false` (the default), all agents run as threads within the orchestrator process. When `USE_HTTP_MESH=true`, they run as separate FastAPI processes on their own ports.

**Reason**: In-process threading is simpler to develop, debug, and run — no port management, no network calls, no startup sequence. The HTTP mesh is architecturally cleaner and enables independent scaling and deployment, but adds operational complexity. The opt-in flag lets development continue without the mesh overhead, with a clean upgrade path when needed.

**Consequences**: In-process mode cannot survive individual agent crashes gracefully (the whole orchestrator must restart). HTTP mesh mode can restart individual agents independently via the watchdog.

**Security note (S1 fix, 2026-04-29)**: When the mesh runs, all agent servers bind to `127.0.0.1` (localhost only), not `0.0.0.0`. This is now the canonical binding. See `errors/S1-host-binding-fix.md` for the incident report.

---

## ADR-012: Claude Haiku for evaluation scoring

**Date**: 2026-05-04
**Status**: Accepted

**Decision**: The LLM-as-judge eval agent uses Claude Haiku (`claude-haiku-4-5`), not Sonnet or Opus.

**Reason**: Evaluation is a structured, formulaic task — read an output, fill in 5 score fields in JSON. It does not require deep reasoning. Haiku processes this in under 3 seconds at approximately $0.0002 per evaluation. At 1,000 tasks per month, evaluation costs roughly $0.20 — a negligible fraction of the task costs themselves. Using Sonnet ($0.003/eval) or Opus ($0.08/eval) would add $3–$80/month for no measurable quality gain on a rubric-based scoring task.

**Alternatives considered**: Sonnet (unnecessary cost), Opus (extreme overkill for rubric scoring), no eval model (blind operation — rejected).

**Consequences**: If the eval rubric becomes more nuanced (requiring multi-step reasoning), the model choice should be re-evaluated. Current 5-dimension rubric is well within Haiku's capability.

---

## ADR-013: Default approval gate whitelist — researcher and analyst

**Date**: 2026-04-28
**Status**: Accepted

**Decision**: The default `GATE_AGENT_WHITELIST` is `"researcher,analyst"`. Tasks from these two agent types require human approval before running when the estimated cost exceeds `GATE_COST_THRESHOLD` ($0.25).

**Reason**: The researcher and analyst agents both work with external or user-supplied data. The researcher fetches live web content (potentially untrusted); the analyst may process business-sensitive data. Requiring approval for their higher-cost tasks ensures a human reviews the task intent before significant spending or data exposure occurs. Architecture, coder, tester, and devops agents are trusted by default because their tasks are self-contained and data sources are internal.

**Alternatives considered**: No whitelist (all agents gate — too many interruptions), all agents gate (impractical for autonomous operation), cost-only gating (ignores agent type risk differences).

**Consequences**: Users can override the whitelist via the `GATE_AGENT_WHITELIST` environment variable. Setting it to an empty string disables type-based gating entirely (cost-only gating remains active).
