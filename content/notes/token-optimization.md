---
tags: [cost, optimization, rag, built]
created: 2026-04-26
updated: 2026-04-28
status: partial
---

> Every token costs money and latency. This layer applies **systematic strategies** to reduce context size by 60–80% without losing capability.

---

## The Token Budget Stack

```
 Full Task Context (naive) ~80,000 tokens
 ─────────────────────────────────────────────────
 After prompt caching −30% 56,000
 After RAG (retrieve, not ingest) −45% 30,800
 After context compression −35% 20,000
 After tool call batching −15% 17,000
 After differential vision frames −20% 13,600
 ─────────────────────────────────────────────────
 Final effective context ~13,600 tokens (83% reduction)
```

---

## Strategy 1 — Prompt Caching

**What:** Cache static parts of the system prompt (up to 80% of prompts are identical across calls).

**How (Anthropic):**
```python
messages = [
 {
 "role": "user",
 "content": [
 {
 "type": "text",
 "text": system_prompt,
 "cache_control": {"type": "ephemeral"} # cache for 5 min
 },
 {"type": "text", "text": user_query}
 ]
 }
]
```

**Savings:** ~30% token reduction, ~85% cost reduction on cached portion.

---

## Strategy 2 — RAG Pipeline

See [RAG Pipeline](/notes/rag-pipeline) for full details.

**Summary:**
- Instead of putting entire docs in context, embed them in a vector DB
- Retrieve only the 3–5 most relevant chunks at query time
- **Typical saving: 60–75% of context**

---

## Strategy 3 — Context Compression

**Rolling summary pattern:**
```
Every N messages:
 1. Summarise conversation so far in <500 tokens
 2. Replace raw messages with summary
 3. Keep only last 3 raw messages (for recency)

Prompt:
"Compress the following conversation into a 3-sentence summary 
preserving: decisions made, open questions, current task state."
```

**Hierarchical compression (inspired by MemGPT):**
- **Working memory** — last 5 exchanges, raw
- **Episodic memory** — summarised session blocks
- **Semantic memory** — extracted facts and decisions only

---

## Strategy 4 — Tool Call Batching

Instead of:
```
read_file(a) read_file(b) read_file(c) # 3 round trips
```

Do:
```
batch_read([a, b, c]) # 1 round trip, same context used once
```

Reduces round-trip overhead tokens by ~40%.

---

## Strategy 5 — Differential Vision Frames

For screen-watching tasks:
- Capture full frame on first observation
- Subsequent frames: send only **changed regions** as bounding-box crops
- Use OCR on text regions — text tokens are ~20x cheaper than image tokens

**Cost comparison:**
| Method | Tokens / observation |
|---|---|
| Full 1080p screenshot | ~1,200 |
| Changed region crop | ~200 |
| OCR text extraction | ~60 |

---

## Strategy 6 — Structured Output Forcing

Force agents to output compact JSON/YAML instead of prose:
```
Bad: "I found that the Apollo server configuration file is located at..." (~40 tokens)
Good: {"file": "apollo.conf", "path": "/etc/apollo/"} (~12 tokens)
```

Saves ~70% on inter-agent communication.

---

## Strategy 7 — Semantic Deduplication

Before injecting retrieved chunks:
1. Embed each chunk
2. Compute cosine similarity between candidates
3. Drop chunks with >0.92 similarity to already-included chunks

Prevents injecting the same fact 3 different ways.

---

## Industry Reference

| System | Strategy | Equivalent Here |
|---|---|---|
| Amazon Bedrock | Prompt caching, Knowledge Bases | Strategy 1 + 2 |
| Apple Intelligence | On-device small model triage | Route simple tasks to haiku |
| OpenAI | Threads with message truncation | Strategy 3 |
| Google Gemini | 1M token window (raw) | We compress instead — cheaper |
| Anthropic | Extended thinking, prompt cache | Strategy 1 + reasoning budget |

---

## Related Nodes

- [RAG Pipeline](/notes/rag-pipeline) — retrieval strategy
- Memory Layer — where compressed memories live
- Orchestration — enforces token budgets per agent
- Prompt Library — cached and optimised prompts
