## What It Is
Perplexity's sonar-pro model accessed via its OpenAI-compatible API endpoint.
Used as the primary model for the `deep-researcher` agent type — tasks that
benefit from real-time web search grounding combined with language model synthesis.

## Why It Matters
Perplexity sonar-pro performs web searches as part of its inference, returning
cited, up-to-date answers. The `deep-researcher` agent handles tasks where
knowledge cutoff is a problem: competitor analysis, news summarisation, market
data, and fact-checking against live web sources.

## How It Works
`orchestrator/integrations/perplexity_client.py` provides a single function
`_perplexity_complete()` that:
1. Reads `PERPLEXITY_API_KEY` from env — returns `None` (Sonnet fallback) if absent
2. Builds an OpenAI-compatible request with system message prepended
3. Calls `https://api.perplexity.ai` via the `openai` Python SDK
4. Returns `(text, "sonar-pro", Usage)` on success
5. Returns `None` on any API error — executor falls back to Sonnet automatically

The executor's `_NON_ANTHROPIC_ROUTERS` dict maps `"deep-researcher"` to
`_perplexity_complete`, checked before the standard Anthropic router in `_run_via_router()`.

## Key Files
- `orchestrator/integrations/perplexity_client.py` — thin wrapper, graceful fallback
- `orchestrator/executor/executor.py` — `_NON_ANTHROPIC_ROUTERS` dict, routing logic

## Configuration
- Env var: `PERPLEXITY_API_KEY` — from www.perplexity.ai/settings/api
- Model: `sonar-pro`
- Endpoint: `https://api.perplexity.ai`
- Cost estimate: ~$0.003/1K input tokens, ~$0.015/1K output tokens (includes search)

## Decisions
2026-06-01 — sonar-pro selected over sonar-small: deep-researcher tasks are
high-value research queries where quality matters more than cost. sonar-pro
includes more search results and better synthesis. sonar-small is still usable
by changing `_MODEL` in perplexity_client.py if cost becomes a concern.

## Related
- [Claude-Ecosystem/Integrations/Qwen](/notes/qwen-local-llama-cpp) — sister integration for processor agent
- [Claude-Ecosystem/Components/Orchestrator](/notes/orchestrator) — executor routing lives here
