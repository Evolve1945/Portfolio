---
tags: [rag, memory, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
ChromaDB is the local vector database (a database that stores information as numerical fingerprints, allowing semantic similarity search rather than exact keyword matching) that powers the RAG Pipeline. All task results, vault notes, code files, corrections, and system events are converted to numerical vectors and stored in ChromaDB. When an agent starts a new task, it queries ChromaDB to find the most conceptually similar past experiences and uses them as context.

## Why It Matters
ChromaDB is the engine of the ecosystem's long-term memory. Without it, every task starts from scratch with no awareness of what has been done before. ChromaDB enables the ecosystem to learn continuously: each completed task enriches the memory, making future related tasks better-informed. It also enables the semantic search that makes RAG useful — not just finding notes that contain the exact same words, but finding notes that discuss similar concepts even if they use different terminology.

## How It Works
ChromaDB runs entirely locally — it is a Python library that creates and manages a persistent directory of vector data on disk (`rag_store/chroma/`). No external server or internet connection is needed. Data is stored using the `PersistentClient` mode, meaning all vectors survive machine restarts and are written immediately to disk.

The ecosystem uses 9 separate collections — essentially 9 independent sub-databases for different content types. Separating collections means an agent searching for past task results does not accidentally retrieve code files or system event logs — the search is already scoped to the relevant data type.

Each stored document contains: the text content, the numerical vector, and a metadata dictionary with fields like `agent_type`, `task_id`, `timestamp`, `cost_usd`, and `trust_level`. The trust_level field was added as part of the security hardening phase: INTERNAL or EXTERNAL is stamped on every chunk at embed time, allowing queries to be filtered by trust level in the future.

Queries work by converting the search text to a vector using the same embedding model that was used to store the data, then finding the stored vectors that are mathematically closest (most semantically similar). The top N results are returned with their similarity scores, original text, and metadata.

## Current Status
 Built — PersistentClient confirmed active, 9 collections, trust_level field stamped on all chunks, local embedding fallback compatible.

## Key Files
- `rag/store.py` — ChromaDB client, collection management, upsert and query functions
- `rag_store/chroma/` — On-disk storage location (auto-created at runtime)

## Open Questions / Known Gaps
- If the OpenAI embedding model and the local fallback model are used in the same collection (after a period of API downtime), queries can produce lower accuracy results because the two models produce incompatible vector spaces. ChromaDB detects this mismatch, but a clean solution (separate collections per embedding model) has not yet been implemented.

## Related
- [Components/Intelligence/RAG Pipeline](/notes/rag-pipeline) — the pipeline that feeds data into and reads data from ChromaDB
- Integrations/OpenAI API — provides the embedding model (primary)
- Security/Trust Boundary Classifier — the trust level field on every ChromaDB chunk
