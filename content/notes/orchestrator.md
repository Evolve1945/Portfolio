## What It Is
The Orchestrator is the central engine of the Claude Ecosystem. It sits at the heart of every operation: receiving task requests, deciding which AI agent should handle them, dispatching the work, tracking progress, handling failures, and reporting results. Every capability in the ecosystem flows through the Orchestrator. It runs as a web server on port 8765 and is always on.

## Why It Matters
Without the Orchestrator, the ecosystem is a collection of disconnected scripts. The Orchestrator is what makes the system act as a single coherent entity. It enforces cost limits before spending money, applies security rules before running untrusted content, keeps a priority-ordered queue so urgent tasks never get stuck behind background work, and recovers from failures automatically rather than silently dying.

## How It Works
When a task arrives (via the dashboard, Telegram, the scheduler, or the API), the Orchestrator:
1. Scans for prompt injection and classifies the trust level of any external content
2. Verifies the API key
3. Checks the budget — if today's spending limit is reached, the task is queued or rejected
4. Enforces the agent contract — denied tools or excess token budget raises ContractViolation DLQ
5. Enriches the task with RAG context from past similar tasks
6. Dispatches to the appropriate specialised agent (18 types in the HTTP mesh)
7. On failure, consults the circuit breaker — repeated failures suspend the agent temporarily
8. On success, scores the output through the eval loop and embeds high-quality results in the vector store

The Orchestrator coordinates with the dashboard in real time, pushing status updates over WebSocket so the control panel always reflects current state.

## Current Status
[built] Live at port 8765. Core queue, circuit breaker, security pipeline, budget controls, contract enforcement, and agent dispatch are all operational. 23 agent types in AGENT_CONFIG. Shared system prompts imported from `agents/prompts.py` (single source of truth — no drift between orchestrator and mesh server copies).

## Key Files
- `orchestrator/orchestrator.py` — Main engine: priority queue, circuit breaker, task dispatch, DLQ, retry logic, AGENT_CONFIG (23 agents)
- `orchestrator/agents/prompts.py` — Single source of truth for all 18+ agent system prompts (Task 110)
- `orchestrator/budget/guard.py` — Cost enforcement before each task
- `orchestrator/security/sanitizer.py` — Injection scanning pipeline
- `orchestrator/router/__init__.py` — Model selection and fallback routing
- `orchestrator/contracts/enforcer.py` — Contract enforcement at dispatch (including bash_denylist)

## Agent Config Summary

| Category | Agents | Model |
|---|---|---|
| orchestration | orchestrator, planner, scheduler, executor | Sonnet / Haiku |
| development | architect, coder, reviewer, tester, designer | Sonnet |
| operations | devops, security, monitor | Sonnet / Haiku |
| intelligence | researcher, analyst, documenter | Haiku |
| content | writer, summarizer | Haiku |
| multimodal | vision, memory | Sonnet / Haiku |

## Previously Open, Now Closed
- [x] bash_allowlist parsed but not runtime-enforced — CLOSED. bash_denylist now enforced via `_check_bash_command()` in enforcer.py.
- [x] System prompts drifting between orchestrator.py and agent_server.py — CLOSED. Both import from `agents/prompts.py`.

## Open Questions / Known Gaps
- Task 100 Phase 1 [built] 2026-05-15: `orchestrator/executor/executor.py` (AgentExecutor) extracted. Planner module (`orchestrator/planner/`) and Router (`orchestrator/router/`) also separate. Orchestrator.py delegates `run()` to `AgentExecutor.build_run_fn()`. Further modularisation (full Planner refactor) remains optional.
- Task 116 [built] 2026-05-19: `orchestrator/evaluator/improver.py` (PromptImprover) — 3 consecutive FAILs trigger Opus rewrite of the failing agent prompt. Candidate saved to PromptStore. Wired into orchestrator.py after `_check_prompt_health`. Graceful degradation: `_prompt_improver_available` flag.

## Related
- [Claude-Ecosystem/Components/Agent Mesh](/notes/agent-mesh) — the 18 specialised agents the Orchestrator dispatches to
- [Claude-Ecosystem/Components/Budget Guard](/notes/budget-guard) — cost control layer
- [Claude-Ecosystem/Components/Circuit Breaker](/notes/circuit-breaker) — failure protection
- [Claude-Ecosystem/Components/Planner](/notes/planner) — decomposes complex goals before dispatch
- [Claude-Ecosystem/Components/Tool Loop](/notes/tool-loop) — multi-turn tool execution inside agents
- Claude-Ecosystem/Components/Security/Prompt Injection Sanitizer — security step in every dispatch
- Claude-Ecosystem/Components/Security/Agent Contracts — contract enforcement at dispatch
- Claude-Ecosystem/ARCHITECTURE — full layer stack this sits within
- Claude-Ecosystem/00 - Claude Ecosystem — master hub
