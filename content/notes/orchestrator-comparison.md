---
tags: [reference, orchestration, research]
created: 2026-04-26
updated: 2026-04-26
status: complete
---

> Feature map of leading multi-agent frameworks vs our ecosystem — used to find gaps, steal patterns, and justify design decisions.

---

## Frameworks Covered

| # | Framework | Maintainer | Model | Paradigm |
|---|---|---|---|---|
| 1 | **LangGraph** | LangChain | Any | Graph / state machine |
| 2 | **CrewAI** | CrewAI Inc | Any | Role-based crew |
| 3 | **Microsoft Agent Framework (MAF)** | Microsoft | Any | Graph + enterprise runtime |
| 4 | **OpenAI Agents SDK** | OpenAI | GPT family | Handoff / tool-first |
| 5 | **Google ADK** | Google | Gemini | Multimodal / cloud-native |
| 6 | **Anthropic Agent SDK** | Anthropic | Claude | Tool-use / MCP-first |
| 7 | **Pydantic AI** | Pydantic | Any | Type-safe / composable capabilities |
| 8 | **AutoGen v0.4** | Microsoft | Any | Async event-driven / actor model |
| 9 | **claude-code-by-agents** | baryhuang | Claude Code | @mention / HTTP mesh |
| 10 | **claude-code-agents-orchestra** | 0ldh | Claude Code | Conductor + performer |

---

## Feature Matrix

### 1. Orchestration Patterns

| Feature | LangGraph | CrewAI | MAF | OpenAI SDK | Google ADK | Anthropic SDK | Pydantic AI | AutoGen v0.4 | baryhuang | orchestra | **Ours** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Sequential pipeline | | | | | | | | | | | Built |
| Parallel execution | | | | | | | | async | | | Built |
| Conditional routing | edges | | | handoff | | | | | manual | | Built |
| DAG / dependency graph | | | | | | | | actor | | | Built — Task 29 |
| Subgraph / nested agents | | | | | | | | | | | gap |
| Circuit breaker | | | | | | | | | | | Built |
| Priority queue | | | | | | | | | | | Built |
| Dead-letter queue (DLQ) | | | | | | | | | | | Built |
| Role-based agents | | core | | | | | capabilities | | | | Task 18 (pending) |
| Conductor + performer | | manager | | | | | | | @mention | core | informal |

### 2. Memory & State

| Feature | LangGraph | CrewAI | MAF | OpenAI SDK | Google ADK | Anthropic SDK | Pydantic AI | AutoGen v0.4 | baryhuang | orchestra | **Ours** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Typed shared state | TypedDict | | session | | | | core | state mgmt | | | gap |
| Checkpointing | built-in | | | | | | | serialize | | | gap T45 |
| Time travel / replay | | | | | | | | | | | gap T45 |
| Short-term memory | | | | threads | | | | | | | Obsidian |
| Long-term memory | store | | SK | vectors | | | | | | | Built — Task 22 |
| Entity memory | | | | | | | | | | | Task 46 |
| Vector / RAG retrieval | | | | | | | via caps | | | | Built — Task 22 |
| Cross-session persistence | | | | | | | | | | | Obsidian |
| Reducer-driven state | | | | | | | Pydantic | | | | gap |

### 3. Agent Communication

| Feature | LangGraph | CrewAI | MAF | OpenAI SDK | Google ADK | Anthropic SDK | Pydantic AI | AutoGen v0.4 | baryhuang | orchestra | **Ours** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Direct agent-to-agent | | | | handoff | | | | | @mention | | via orch. |
| Event-driven messaging | | Flows | async | | | | | core | | | gap T29 |
| Broadcast / pub-sub | | | | | | | | | | | gap |
| MCP tool discovery | | | | | | native | built-in | | | | Built |
| HTTP mesh (multi-machine) | | | | | | | | multi-proc | core | | Built — Task 47 |
| Human approval gates | | | | | | | built-in | | | | Built — Task 21 |

### 4. Observability & Cost

| Feature | LangGraph | CrewAI | MAF | OpenAI SDK | Google ADK | Anthropic SDK | Pydantic AI | AutoGen v0.4 | baryhuang | orchestra | **Ours** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Real-time tracing | LangSmith | built-in | telemetry | | | | Logfire | observable | | | Dashboard |
| Token / cost tracking | | | | | | | | | | | partial |
| Cost budget limits | | | | | | | | | | | Built — Task 23 |
| WebSocket live push | | | | | | | | | | | Built |
| Error categorization | | | | | | | retry | | | | Task 39 |
| Agent perf evals | LangSmith | training | | | | | | | | | Task 36 |
| Self-healing watchdog | | | | | | | | | | | Built — Task 31 |
| Multi-model fallback | | | | only GPT | only Gemini | only Claude | any model | | | | Built — Task 27 |

### 5. Token / Context Management

| Feature | LangGraph | CrewAI | MAF | OpenAI SDK | Google ADK | Anthropic SDK | Pydantic AI | AutoGen v0.4 | baryhuang | orchestra | **Ours** |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Context trimming / summarization | MessagesState | compression | | threads | 2M ctx | 200k ctx | manual | built-in | | | gap |
| Streaming partial results | | | | | | | | | | | gap |
| Context window awareness | | | | | 2M | 200k | | | | | gap |
| Prompt caching | | | | | | cache | | | | | gap |
| Token usage per task | | | | | | | | | | | partial |
| RAG-based context compression | | | | | | | | | | | Built — Task 22 |

---

## Our Unique Advantages

Things no other framework has that we've built or are building:

| Capability | Status | Notes |
|---|---|---|
| Circuit breaker | Built | Automatic retry + escalation on failure |
| Priority queue | Built | Task priority routing across 12 agent types |
| Dead-letter queue | Built | Failed tasks captured, reviewable |
| WebSocket real-time dashboard | Built | 12-view liquid glass UI — no competitor has this |
| Obsidian knowledge graph | Built | Architecture self-documents in a live vault |
| Auto API key skill activation | Built | Add a key to .env, skill auto-activates |
| Vision layer (Apollo+Moonlight) | Built | Screen streaming — see and act on desktop |
| Human approval gates | Built — Task 21 | Telegram/Discord approve/reject |
| Hard cost limits | Built — Task 23 | Kill switch when budget exceeded |
| Self-healing watchdog | Built — Task 31 | Auto-restart crashed services |

---

## Gaps Identified Added to Backlog

| Gap | Priority | Source | Mapped Task |
|---|---|---|---|
| Typed shared state schema (TypedDict + reducers) | High | LangGraph, Pydantic AI | Task 29 (extend) |
| Checkpoint + time travel / task replay | Medium | LangGraph, AutoGen v0.4 | Task 45 |
| Entity memory | Medium | CrewAI | Task 46 |
| Event-driven inter-agent messaging | High | CrewAI Flows, MAF, AutoGen v0.4 | Task 29 (extend) |
| HTTP agent mesh (multi-machine) | High | baryhuang, AutoGen v0.4 | Task 47 |
| Nested subgraph agents | Medium | LangGraph, MAF | Flag for Task 18 |
| Agent performance evals | Medium | LangGraph, CrewAI | Task 36 |
| Context trimming / summarization | High | All major frameworks | Task 22 (extend) |
| Streaming partial results | Medium | All major frameworks | flag for Task 29 |
| Prompt caching | Medium | OpenAI, Google, Anthropic SDK | flag for Task 22 |

---

## Key Patterns to Steal

### From LangGraph
- **Reducer-driven state**: every state mutation is a pure function — prevents race conditions in parallel agent runs. Implement in our orchestrator's shared task state.
- **Checkpointing**: snapshot state before each node replay failed tasks from last checkpoint. Pairs with our DLQ.
- **MessagesState trimmer**: automatic context window management — trim or summarize when approaching limit. Critical for long-running tasks.

### From CrewAI
- **Role + goal + backstory per agent**: our Agent Profiles (Task 18) should adopt this — gives the LLM stronger context about what the agent is supposed to be.
- **Entity memory**: a named-entity store ("Evo's business name = X", "target server = Y") that any agent can read/write. Obsidian entities/ folder.

### From AutoGen v0.4
- **Async event-driven actor model**: agents communicate via async message passing, not blocking calls. Enables multi-process and multi-machine scale. Pattern for Task 47.
- **Serialization**: agents serialize their full state to disk. Pairs with our checkpointing gap (Task 45).

### From Pydantic AI
- **Tool input/output validation**: every tool call validated via Pydantic schema — errors passed back to LLM for auto-retry. Implement in our tool layer.
- **Human-in-the-loop tool approval**: flag specific tools as requiring approval before execution. Directly applicable to Task 21.
- **Logfire integration**: structured observability tied to Pydantic's type system. Consider for Task 39 (error tracker).

### From Microsoft Agent Framework
- **Middleware pipeline**: pre/post hooks on every agent call for auth, logging, cost metering. Clean insertion point for Task 23 and Task 39.

### From baryhuang/claude-code-by-agents
- **@mention routing**: natural way to direct tasks at specific agents in Discord. Implement in Task 13.5.
- **HTTP mesh**: each agent exposes a port, orchestrator fans out via HTTP. Enables true multi-machine (Task 47).

### From 0ldh/claude-code-agents-orchestra
- **Conductor model**: one dedicated orchestrator agent that only plans and delegates, never executes. Our current orchestrator mixes concerns — isolate planning into its own agent type.

---

## When Would You Pick a Competitor Over Ours?

| Scenario | Better Choice | Why |
|---|---|---|
| Need time-travel debugging **today** | LangGraph | Checkpointing is built and stable; Task 45 is still pending |
| Team already using GPT-4 exclusively | OpenAI Agents SDK | Native threads + vector store, no wiring needed |
| Enterprise .NET team | MAF | Cross-language Python + .NET, enterprise auth middleware |
| Strict type safety on every tool | Pydantic AI | Pydantic validation is its entire reason for existing |
| Need real async multi-process scale | AutoGen v0.4 | Actor model is production-tested at Microsoft scale |
| Gemini / multimodal is the core model | Google ADK | Deep Gemini integration, 2M context window |

We win on: real-time dashboard, vision layer, DLQ, circuit breaker, Obsidian persistence, MCP-native wiring, and the self-contained hardware-level stack.

---

## Sources

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [Best Multi-Agent Frameworks 2026](https://gurusup.com/blog/best-multi-agent-frameworks-2026)
- [CrewAI Documentation](https://docs.crewai.com/en/introduction)
- [Pydantic AI Documentation](https://ai.pydantic.dev/)
- [Pydantic AI GitHub](https://github.com/pydantic/pydantic-ai)
- [AutoGen v0.4 Launch Post](https://devblogs.microsoft.com/autogen/autogen-reimagined-launching-autogen-0-4/)
- [AutoGen v0.4 Microsoft Research](https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/)
- [baryhuang/claude-code-by-agents](https://github.com/baryhuang/claude-code-by-agents)
- [0ldh/claude-code-agents-orchestra](https://github.com/0ldh/claude-code-agents-orchestra)

---

*Gaps added to backlog: Tasks 45–47 (previous session) + context management flagged for Tasks 22 & 29*
*Companion dashboard view: `dashboard/comparison.html`*
