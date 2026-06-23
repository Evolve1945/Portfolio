---
tags: [cost, models, optimization, guide]
created: 2026-04-26
updated: 2026-04-28
status: built
---

> Which Claude model to use for each task. Opus costs 5–8× more than Sonnet — use it only where architectural complexity genuinely justifies it.

---

## Quick Rule

> Start with Sonnet. Switch to Opus only when a decision has 5+ interconnected consequences and getting it wrong cascades into everything else.

---

## Model Tiers

| Model | Best For | Relative Cost |
|---|---|---|
| **Haiku 4.5** | Simple, mechanical, low-stakes tasks | 1× |
| **Sonnet 4.6** | Most implementation work — clear specs, standard patterns | ~3× |
| **Opus 4.6** | Foundational architectural design, self-improving systems, complex eval design | ~8× |

---

## Task Model Map

### Use Opus 4.6

| # | Task | Reason |
|---|---|---|
| 36 | Benchmark / eval system | Easy to build metrics that get gamed or measure the wrong thing |
| 40 | Skill library + auto-import | Generalisation logic and quality scoring design require deep reasoning |
| 89 | Evaluation + feedback loop | LLM-as-judge design requires careful calibration to avoid reward hacking |
| 91 | Trust boundary classifier | Misclassifying trust levels has security-wide cascading consequences |

### Use Sonnet 4.6

| # | Task |
|---|---|
| 11 | Wire orchestrator dashboard sync |
| 12 | .env API key auto-scan |
| 13 | Dashboard UI redesign |
| 14 | Orchestrator comparison database |
| 15 | Always-on server architecture |
| 17 | Prompt conversion pipeline |
| 18 | Agent profile registry |
| 20 | Notification system (Telegram/Discord) |
| 21 | Human-in-the-loop approval gates |
| 22 | RAG pipeline + ChromaDB |
| 23 | Cost budget controls |
| 24 | Task scheduler |
| 25 | Mobile dashboard view |
| 26 | Git integration for coder agent |
| 27 | Multi-model routing |
| 28 | Voice interface |
| 30 | Code execution sandbox |
| 31 | Self-healing watchdog |
| 32 | Ollama integration |
| 33 | Weekly briefing |
| 34 | Natural language query interface |
| 35 | Multi-project support |
| 38 | Plugin marketplace auto-discovery |
| 39 | Error tracking and categorization |
| 85 | Prompt injection sanitizer |
| 86 | Per-agent tool allowlist + contracts |
| 87 | Memory write validation + trust scoring |
| 88 | Secret isolation enforcement |
| 90 | Prompt versioning store |

### Use Haiku 4.5

| # | Task | Reason |
|---|---|---|
| 19 | Tailscale VPN setup | Config steps and install commands |
| 37 | API key rotation reminders | Date math and notification logic |

---

## General Agent Model Assignments

| Agent Type | Default Model | Escalate To |
|---|---|---|
| orchestrator | Sonnet 4.6 | Opus (complex planning) |
| architect | Opus 4.6 | — |
| coder | Sonnet 4.6 | Opus (novel architecture) |
| reviewer | Sonnet 4.6 | — |
| tester | Haiku 4.5 | Sonnet (complex test design) |
| devops | Sonnet 4.6 | — |
| security | Sonnet 4.6 | Opus (threat modelling) |
| researcher | Sonnet 4.6 | — |
| documenter | Haiku 4.5 | Sonnet (complex docs) |
| analyst | Sonnet 4.6 | — |
| vision | Sonnet 4.6 | — |
| memory | Haiku 4.5 | Sonnet (complex synthesis) |

---

## Related Nodes

- Multi-Model Router — technical routing implementation
- [Token Optimization](/notes/token-optimization) — cost reduction strategies
- Cost Controls — hard budget limits
- Agent Profiles — per-agent capability and task matching
