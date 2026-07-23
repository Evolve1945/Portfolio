---
tags: [models, cost, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
Google Gemini is the third-tier fallback model in the multi-model routing chain. If both Claude and GPT-4o are unavailable, the ecosystem tries Gemini 1.5 Flash — Google's fast, low-cost model. It is not used as a primary model for any task category, but serves as the last cloud-based option before the system would need to fall back to a local model (Ollama, when that is built) or queue the task for retry.

## Why It Matters
Having a three-tier fallback chain dramatically improves system availability. Claude and GPT-4o occasionally have rate limits or brief outages simultaneously — particularly during peak periods. Gemini provides a third independent option with a separate API key, separate rate limits, and a different underlying infrastructure. This means the probability of all three providers being simultaneously unavailable is extremely low, approaching zero under normal conditions.

## How It Works
The `GeminiAdapter` in `orchestrator/router/adapters.py` wraps the Google Generative AI Python SDK. The adapter maps the ecosystem's standard message format (system prompt + user message) to Gemini's API format. Gemini uses a slightly different request structure than Anthropic or OpenAI — the system prompt is passed as a separate parameter rather than a message in the conversation array.

Gemini 1.5 Flash is selected over Gemini 1.5 Pro because it is significantly faster and cheaper, and by the time a task has already failed on Claude and GPT-4o, the priority is to get any reasonable response rather than the highest-quality possible response. The model's output quality is sufficient for most standard tasks even if slightly below Sonnet or GPT-4o.

The `GOOGLE_API_KEY` environment variable activates the integration. When not set, the Gemini adapter is simply not included in the router's fallback chain — the system gracefully operates as a two-tier fallback instead.

## Current Status
 Built — GeminiAdapter implemented and wired into the multi-model router fallback chain.

## Key Files
- `orchestrator/router/adapters.py` — `GeminiAdapter` class

## Open Questions / Known Gaps
- Gemini's output format for structured JSON tasks occasionally deviates from the expected schema. The adapter includes basic response normalisation, but complex structured output tasks may have lower reliability on Gemini than on Claude or GPT-4o.

## Related
- [Components/Core/Multi-Model Router](/notes/multi-model-router) — Gemini is the third tier in the fallback chain
- [Integrations/Anthropic API](/notes/anthropic-api) — first choice (primary)
- [Integrations/OpenAI API](/notes/openai-api) — second choice (first fallback)
- Features/Planned/Ollama Local LLM — fourth tier (planned, zero-cost local model)
