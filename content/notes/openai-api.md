---
tags: [models, rag, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
The OpenAI API serves three roles in the Claude Ecosystem: it is the first fallback model when Claude is rate-limited (using GPT-4o), it provides the embedding model used to power the RAG Pipeline (using `text-embedding-3-small`), and it will provide voice transcription for the planned Voice Interface (using Whisper). A single `OPENAI_API_KEY` activates all three functions.

## Why It Matters
The OpenAI API serves as the primary resilience layer for Claude. Without a fallback, rate limit windows could pause the entire task queue for minutes at a time. GPT-4o's capability level is comparable to Claude Sonnet, making it a high-quality substitute. The embedding model is also critical infrastructure — the entire RAG Pipeline (and therefore the ecosystem's long-term memory) depends on OpenAI embeddings, with a local fallback available but the OpenAI model being significantly faster and more consistent.

## How It Works
**GPT-4o fallback:** The `OpenAIAdapter` in `orchestrator/router/adapters.py` wraps the OpenAI Python SDK. When the Multi-Model Router's Claude call fails with a rate limit (429) or server error (5xx), the router instantly retries with this adapter. The request is reformatted from Anthropic's message format to OpenAI's (the APIs are similar but not identical). The model cost is tracked separately in the budget database so you can see exactly how much was spent on fallback calls versus primary Claude calls.

**Embeddings:** The `rag/embedder.py` module calls `text-embedding-3-small` to convert text into numerical vectors for ChromaDB storage. This model produces 1,536-dimension embeddings at a cost of $0.00002 per 1,000 tokens — extremely cheap. A typical day of 50 tasks with RAG queries generates approximately $0.002 in embedding costs.

**Whisper (planned):** When the Voice Interface is built, the same API key will be used to call OpenAI's Whisper speech-to-text model. Whisper accepts audio in OGG/MP3/WAV format and returns a text transcription. Cost is $0.006 per minute of audio — for a typical 10-second voice command, this is less than $0.001.

## Current Status
 Built — GPT-4o fallback and `text-embedding-3-small` embeddings are active. Whisper integration is pending the Voice Interface feature.

## Key Files
- `orchestrator/router/adapters.py` — `OpenAIAdapter` class
- `rag/embedder.py` — Embedding calls using `text-embedding-3-small`
- `rag/local_embedder.py` — Local embedding fallback when OpenAI is unavailable

## Open Questions / Known Gaps
- The local embedding fallback (`sentence-transformers`) produces vectors of a different dimension than OpenAI's model. ChromaDB currently detects and handles this dimension mismatch, but queries across mixed-dimension collections may be slightly less accurate.

## Related
- [Components/Core/Multi-Model Router](/notes/multi-model-router) — GPT-4o is the first fallback tier
- [Components/Intelligence/RAG Pipeline](/notes/rag-pipeline) — depends on this integration for embeddings
- [Features/Planned/Voice Interface](/notes/voice-interface) — Whisper transcription
- [Integrations/Google Gemini](/notes/google-gemini-integration) — second-tier fallback after GPT-4o
