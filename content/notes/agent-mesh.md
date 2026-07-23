## What It Is
The Agent Mesh is a network of 18 specialised AI agents, each running as its own independent server on a dedicated port (ports 8770 through 8787). Each agent has a specific role and system prompt tuned to that role. Instead of one AI trying to do everything, the ecosystem assigns each task to the agent best suited for it.

## Agent Roster

| Port | Agent | Model | Category | Role |
|---|---|---|---|---|
| 8770 | architect | Sonnet | development | System design, ADRs, trade-off analysis |
| 8771 | coder | Sonnet | development | Production code, bug fixes, refactoring |
| 8772 | reviewer | Sonnet | development | Code review, security audit, quality checks |
| 8773 | tester | Sonnet | development | Test suites, coverage, edge cases |
| 8774 | devops | Sonnet | operations | CI/CD, Docker, infrastructure-as-code |
| 8775 | security | Sonnet | operations | Vulnerability assessment, OWASP, secrets |
| 8776 | researcher | Haiku | intelligence | Web search, synthesis, cited findings |
| 8777 | documenter | Haiku | intelligence | Technical docs, docstrings, README generation |
| 8778 | analyst | Haiku | intelligence | Data analysis, SQL, metrics, log review |
| 8779 | vision | Sonnet | multimodal | Screen capture, UI element detection |
| 8780 | memory | Haiku | multimodal | Obsidian vault read/write, session notes |
| 8781 | writer | Haiku | content | Articles, reports, emails, changelogs |
| 8782 | summarizer | Haiku | content | Condensing long content, key-point extraction |
| 8783 | designer | Sonnet | development | UI/UX wireframes, accessibility, design systems |
| 8784 | executor | Sonnet | orchestration | Shell commands, scripts, CLI automation |
| 8785 | monitor | Haiku | operations | System health, anomaly detection, alerting |
| 8786 | planner | Sonnet | orchestration | Goal decomposition, DAG plan generation |
| 8787 | scheduler | Haiku | orchestration | Cron expressions, recurring job management |

## Agent Categories

| Category | Agents |
|---|---|
| orchestration | orchestrator, planner, scheduler, executor |
| development | architect, coder, reviewer, tester, designer |
| operations | devops, security, monitor |
| intelligence | researcher, analyst, documenter |
| content | writer, summarizer |
| multimodal | vision, memory |

## Why It Matters
A single general-purpose AI model is less effective than a specialised one with the right system prompt, the right tools, and the right constraints for its job. By splitting work across 18 specialised agents, the ecosystem produces higher-quality outputs, enforces cleaner security boundaries (each agent only has access to the tools it needs via its contract), and scales better — multiple agents can work in parallel. If one agent crashes, the others keep running.

## How It Works
Each agent runs as a small FastAPI web server. When the Orchestrator decides a task belongs to a particular agent, it sends an HTTP request to that agent's port. The agent server receives the task, checks the agent's contract (allowed tools, token budget, memory permissions), optionally queries the RAG pipeline for past context, and calls the AI model with a specialised system prompt.

All system prompts live in a single source of truth: `orchestrator/agents/prompts.py`. Both the orchestrator and agent servers import from there — no drift between copies.

The MeshClient handles fanning tasks out to multiple agents in parallel. Each agent enforces its contract at the `/run` endpoint — violations go straight to the dead-letter queue.

## Current Status
[built] All 23 agents defined and wired. System prompts centralised in `agents/prompts.py`. Each agent has a JSON contract (v1.1) enforced at dispatch and at the agent `/run` endpoint. bash_denylist enforcement added to enforcer.py — dangerous commands blocked before execution.

## Key Files
- `orchestrator/mesh/agent_server.py` — Per-agent FastAPI server (`/run`, `/run/async`, `/health`, `/metrics`)
- `orchestrator/mesh/mesh_client.py` — Fan-out HTTP client used by the Orchestrator
- `orchestrator/mesh/agents.yaml` — Port, model, timeout, workers per agent (source of truth)
- `orchestrator/agents/prompts.py` — Single source of truth for all agent system prompts (Task 110)
- `orchestrator/contracts/definitions/*.json` — 19 per-agent contract files

## Related
- [Components/Orchestrator](/notes/orchestrator) — dispatches tasks to the mesh
- Security/Agent Contracts — defines what each agent is allowed to do
- [Components/Tool Loop](/notes/tool-loop) — enables agents to use tools across multiple turns
- [Components/Circuit Breaker](/notes/circuit-breaker) — suspends agents that fail repeatedly
