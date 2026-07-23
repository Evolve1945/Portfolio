---
tags: [orchestration, cost, models, built]
created: 2026-04-27
updated: 2026-05-15
status: built
---


> **Automatic failover.** Every agent task tries Claude first. If it hits a rate limit, server error, or timeout, it silently retries on GPT-4o, then Gemini — without the orchestrator or the caller knowing.

---

## Failover Chain

```
Task instruction
 │
 ▼
 ClaudeAdapter (claude-sonnet-4-6)
 │ success return result + model_used="claude-sonnet-4-6"
 │ 429 / 5xx / timeout failover 
 ▼
 OpenAIAdapter (gpt-4o)
 │ success return result + model_used="gpt-4o"
 │ 429 / 5xx / timeout failover 
 ▼
 GeminiAdapter (gemini-1.5-flash)
 │ success return result + model_used="gemini-1.5-flash"
 │ all failed AllModelsFailedError task DLQ
```

---

## Failover Triggers

| Trigger | HTTP code | Behaviour |
|---|---|---|
| Rate limit | 429 | Immediate failover to next model |
| Server error | 5xx / 529 | Immediate failover |
| Timeout | — | Per-call timeout (matches agent type timeout) |
| Auth error | 401 / 403 | **Not** a failover — propagates as task error |

---

## Files

```
orchestrator/
├── router/
│ ├── __init__.py — exports ModelRouter + all adapters
│ ├── adapters.py — ClaudeAdapter, OpenAIAdapter, GeminiAdapter
│ └── router.py — ModelRouter (failover chain logic)
├── requirements.txt — anthropic, openai, google-generativeai
└── orchestrator.py — imports router, initialises from .env keys
```

---

## Setup

Install dependencies:
```bash
cd orchestrator
pip install -r requirements.txt --break-system-packages
```

Add to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-... # Claude (primary)
OPENAI_API_KEY=sk-proj-... # GPT-4o (fallback #1) — already present from RAG
GOOGLE_API_KEY=AIza... # Gemini (fallback #2) — free at aistudio.google.com
```

The router is **adaptive** — it builds the chain from whichever keys are present.
With only `ANTHROPIC_API_KEY`: single model, no fallback.
With all three: full 3-tier chain.

---

## What the Orchestrator Gets Back

Every agent `run()` call now returns:
```python
{
 "output": "<model response text>",
 "tokens_in": 1240,
 "tokens_out": 380,
 "cost": 0.00941,
 "model_used": "claude-sonnet-4-6" # or "gpt-4o" or "gemini-1.5-flash"
}
```

`model_used` is stored on the Task and synced to the dashboard — you can see which model ran each task.

---

## Cost Rates (per 1K tokens)

| Model | Input | Output |
|---|---|---|
| claude-opus-4-6 | $0.015 | $0.075 |
| claude-sonnet-4-6 | $0.003 | $0.015 |
| claude-haiku-4-5 | $0.00025 | $0.00125 |
| gpt-4o | $0.0025 | $0.010 |
| gpt-4o-mini | $0.00015 | $0.0006 |
| gemini-1.5-flash | $0.000075 | $0.0003 |
| gemini-1.5-pro | $0.0035 | $0.0105 |

Failover to Gemini is **40× cheaper** than Claude Sonnet on input tokens.

---

## Dashboard Events

| Event | Level | When |
|---|---|---|
| `model_failover` | WARN | A task switched away from the primary model |
| `task_complete` | INFO | Includes `model_used` field |

---

## Adding a New Model

1. Add a new `XyzAdapter(ModelAdapter)` in `router/adapters.py`
2. Add its cost rate to `_RATES`
3. Add its API key to `.env`
4. Add it to the `_adapters` list in `orchestrator.py` router init block

---

## Related Nodes

- [Orchestration](/notes/orchestration) — the engine that calls the router per task
- Self-Healing System — keeps the orchestrator process alive
- Cost Controls — budget limits on top of the router (Task 23)
- Ollama Integration — local LLM as future zero-cost fallback (Task 32)

## Decisions

### 2026-06-01 — Session B + qwen-fix: Non-Anthropic executor routing
executor.py _NON_ANTHROPIC_ROUTERS dict: processor->_qwen_complete, deep-researcher->_perplexity_complete.
Routing fires before Anthropic chain in _run_via_router(). Returns None -> falls through to Sonnet.
qwen_client.py: rewritten from DashScope cloud to local llama.cpp at LLAMA_BASE=http://localhost:11435.
 Model: LLAMA_MODEL=qwen3.6-27b-q3_k_s-mtp (shares env vars with tiktok_process.py — one .env entry for both).
 _strip_think() removes Qwen3 CoT <think>...</think> blocks before returning text.
 Cost set to 0.0 (local inference is free). Falls back to Sonnet if llama.cpp server unreachable.
perplexity_client.py: _perplexity_complete() via sonar-pro at https://api.perplexity.ai (OpenAI-compat).
 Reads PERPLEXITY_API_KEY; returns None on failure -> Sonnet fallback.

### 2026-07-13 — P11 architect/editor split (extends the router)
New `router/architect_editor.py` (dark, `ARCHITECT_EDITOR_ENABLED`). Where the router picks ONE
model per task, P11 splits ONE code task across two: a strong architect (sonnet) plans in prose,
a cheap editor (qwen) applies the edits — roughly halves code-task cost. Fail-open to the normal
single-model path. See [Cost + Memory Block](/notes/cost-memory-block).
