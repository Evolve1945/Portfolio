---
tags: [models, cost, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
The Anthropic API provides access to Claude — the primary AI model powering the Claude Ecosystem. Three Claude models are used depending on the task: Claude Haiku (fast and cheap, for classification, summaries, tagging, and evaluations), Claude Sonnet (the main workhorse, handling most tasks), and Claude Opus (for complex reasoning, architectural planning, and decisions where quality matters most). The API is accessed via `ANTHROPIC_API_KEY`.

## Why It Matters
Claude is the intelligence behind every AI-generated output in the ecosystem: every research summary, every piece of code, every evaluation score, every plan. The quality, safety, and capabilities of the Anthropic API directly determine what the ecosystem can accomplish. Claude Sonnet's extended context window (200K tokens) enables the ecosystem to inject rich RAG context into every task, while Claude's strong instruction-following makes it reliable for the structured, constrained tasks the agents perform.

## How It Works
The `ClaudeAdapter` class in `orchestrator/router/adapters.py` wraps the Anthropic Python SDK. It handles: model selection (Haiku/Sonnet/Opus), system prompt construction, message formatting, error handling (rate limits, server errors), and cost calculation from the returned token counts.

**Model routing within Claude:**
- Haiku (`claude-haiku-4-5`) — Used for evaluations, memory tagging, simple classification, and short summarisation. Cost: ~$0.00080 per 1M input tokens, $0.0040 per 1M output tokens.
- Sonnet (`claude-sonnet-4-6`) — Default for all standard tasks. Cost: ~$3.00 per 1M input tokens, $15.00 per 1M output tokens.
- Opus (`claude-opus-4-6`) — Reserved for planning, architectural decisions, and tasks where Sonnet produces subpar results. Cost: ~$15.00 per 1M input tokens, $75.00 per 1M output tokens.

**Rate limit handling:** When the API returns a 429 (rate limit) response, the Multi-Model Router automatically falls back to GPT-4o rather than retrying — preventing task delays during high-volume periods.

**Prompt caching:** The ecosystem is designed for token efficiency. System prompts are structured to take advantage of Anthropic's prompt caching feature (repeated content at the start of the context window is cached and served at reduced cost).

The Evaluation Loop uses Haiku specifically because it is cheap enough (~$0.0002 per evaluation) to run after every single task without meaningfully impacting the budget.

## Current Status
 Built — All three models integrated, rate limit fallback active, per-task cost tracking live.

## Key Files
- `orchestrator/router/adapters.py` — `ClaudeAdapter` with model selection and pricing
- `orchestrator/evaluator/eval_agent.py` — Haiku used as the evaluation judge

## Open Questions / Known Gaps
- Model names are hardcoded in several files; a centralised constants module is needed (identified in the hardcoding audit).

## Related
- Components/Core/Multi-Model Router — routes between Haiku/Sonnet/Opus and the fallback providers
- Integrations/OpenAI API — first fallback when Claude is unavailable
- [Components/Budget Guard](/notes/budget-guard) — tracks Anthropic API spending against daily and monthly caps
