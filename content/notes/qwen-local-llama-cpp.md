## What It Is
A locally-running Qwen model served by llama.cpp on port 11435, providing a free,
private, OpenAI-compatible inference endpoint used by the `processor` agent and
the vault guardian for natural-language summarisation.

Current model: `qwen3.6-27b-q3_k_s-mtp` (27B parameter, Q3_K_S quantization,
MTP variant). Running on user hardware — no cloud API key required.

## Why It Matters
Local inference is free, fast on warm GPU, and keeps all data on-device.
The `processor` agent uses this for high-volume document processing (TikTok
knowledge, Paperless docs, vault enrichment) where cloud billing would accumulate.
The vault guardian also calls it for natural-language compliance summaries
(fallback to Claude Haiku if server is down).

## How It Works
`orchestrator/integrations/qwen_client.py` wraps the endpoint:

1. Checks `GET http://localhost:11435/health` (2 s timeout) — returns `None`
 (Sonnet fallback) if server is not running.
2. Builds an OpenAI-compatible request via the `openai` Python SDK with
 `base_url = LLAMA_BASE + "/v1"` and `api_key="local"`.
3. Strips Qwen3 chain-of-thought `<think>...</think>` blocks with `_strip_think()`
 before returning text — Qwen3 models emit CoT by default.
4. Returns `(text, model_label, Usage(cost_usd=0.0))` on success.
5. Returns `None` on any connection or API error — executor falls through to
 the standard Anthropic router (Sonnet).

The executor's `_NON_ANTHROPIC_ROUTERS` dict maps `"processor"` to
`_qwen_complete`, checked before the Anthropic chain in `_run_via_router()`.

The same env vars (`LLAMA_BASE`, `LLAMA_MODEL`) are shared with
`orchestrator/tools/tiktok_process.py` so a single `.env` entry configures
both consumers.

## Key Files
- `orchestrator/integrations/qwen_client.py` — health check, openai call, think-strip, cost=0
- `orchestrator/executor/executor.py` — `_NON_ANTHROPIC_ROUTERS` routing
- `orchestrator/tools/tiktok_process.py` — shares LLAMA_BASE/LLAMA_MODEL, direct urllib calls
- `orchestrator/tools/vault_guard.py` — calls local Qwen for compliance summaries

## Configuration
| Env var | Default | Purpose |
|---|---|---|
| `LLAMA_BASE` | `http://localhost:11435` | llama.cpp server base URL |
| `LLAMA_MODEL` | `qwen3.6-27b-q3_k_s-mtp` | Model label passed in API call (server ignores it, serves the loaded model) |

No API key required. Start the server with:
```
llama-server --model path/to/model.gguf --port 11435 --ctx-size 32768
```

## Decisions
### 2026-06-01 — Switched from DashScope cloud to local llama.cpp
Original implementation (Session B) targeted Alibaba DashScope at
`https://dashscope.aliyuncs.com/compatible-mode/v1` and required `QWEN_API_KEY`.
Rewritten (qwen-fix session) to use the local server already in use by
`tiktok_process.py`. Rationale: user already runs llama.cpp locally; free
inference; no external network dependency; data stays on-device.
Env vars kept consistent with `tiktok_process.py` (`LLAMA_BASE`, `LLAMA_MODEL`)
so no new `.env` entries were needed.

### 2026-06-01 — _strip_think() added
Qwen3 models emit `<think>...</think>` chain-of-thought reasoning blocks before
the actual answer. These are stripped before returning to the caller to prevent
spurious content entering the orchestrator pipeline.

## Related
- [Integrations/Perplexity](/notes/perplexity-ai-sonar-pro) — sister integration for `deep-researcher` agent
- [Components/Core/Multi-Model Router](/notes/multi-model-router) — executor routing lives here
- [Components/Intelligence/Memory Layer](/notes/memory-layer) — vault guardian uses local Qwen for summaries
