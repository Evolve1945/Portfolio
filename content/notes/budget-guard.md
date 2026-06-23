## What It Is
The Budget Guard is the ecosystem's cost controller. It tracks every API call the system makes in real time, adds up the cost, and enforces hard spending limits. When the daily cap ($1.00), monthly cap ($15.00), or per-pipeline cap ($0.50) is reached, the Budget Guard blocks new tasks from running until the cap resets — no exceptions. It also warns you at 80% of each limit, giving you time to intervene before the block hits.

## Why It Matters
AI API calls cost real money. Without a Budget Guard, a runaway task, an infinite loop, or a misconfigured agent could silently burn through an entire month's budget in hours. The Budget Guard ensures that the ecosystem can run autonomously without any financial risk: even in the worst case, the maximum you will ever spend is the configured monthly cap. Every task knows its budget before it runs, and no task can exceed it.

## How It Works
The Budget Guard reads the cost of each AI model call from a pricing table (rates per 1,000 tokens for input and output, per model). After every task completes, `record()` is called with the token counts and model used, and the cost is calculated and written to a SQLite database.

Before dispatching a new task, the Orchestrator calls `check_budget()`. The Budget Guard queries the database to find total spending for today and this month. If either figure has crossed the cap, the call returns a block signal and the Orchestrator refuses to start the task. The task goes into the queue to wait for the next budget window to open (midnight for daily resets, the first of the month for monthly resets).

Per-task caps are also enforced: each agent type has a maximum token budget defined in its contract. Before calling the AI model, the system estimates the expected token usage (system prompt + instruction + RAG context) and refuses to proceed if it would exceed the per-task limit. This prevents a single large task from consuming the entire day's budget.

When spending reaches 80% of any cap, the Budget Guard fires a Telegram alert so you are notified before any tasks are blocked. If the cap is actually hit, a second alert is sent and the reason is logged in the event feed visible on the dashboard.

## Current Status
 Built — Daily, monthly, and pipeline caps are enforced. Per-task token caps are active. Telegram alerts at 80% and 100% of each cap are wired in.

## Key Files
- `orchestrator/budget/guard.py` — Main Budget Guard class: `record()`, `check_budget()`, per-task caps
- `orchestrator/router/adapters.py` — Per-model pricing table used for cost calculation

## Open Questions / Known Gaps
- The pricing table is duplicated in three places (`adapters.py`, `gate.py`, `tool_loop.py`). Consolidating these into a single `orchestrator/router/rates.py` module is a known cleanup item from the hardcoding audit.
- Budget cap values are currently configured in code; they should be read from environment variables so they can be changed without a code edit.

## Related
- Components/Orchestrator — calls the Budget Guard before every task dispatch
- Security/Agent Contracts — per-agent token budgets enforced alongside global caps
- Features/Implemented/Telegram Notifications — cost warning and block alerts
- [Integrations/Anthropic API](/notes/anthropic-api) — the primary source of API costs
