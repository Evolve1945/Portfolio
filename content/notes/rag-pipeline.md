> Retrieval-Augmented Generation pipeline that gives every agent access to the ecosystem's long-term memory. Before any agent runs a task, the RAG pipeline retrieves the top semantically similar past results and injects them as context — so the system learns from its own history.

---

## What It Is

The RAG Pipeline is the ecosystem's memory retrieval engine. It converts text into numerical vector representations (embeddings), stores them in ChromaDB, and retrieves the most relevant past records whenever a new task needs context. Every task the system completes becomes a memory that future tasks can draw on.

---

## Why It Matters

Without RAG, every agent starts with a blank slate. With RAG, a researcher agent that summarised a topic last week can surface that summary when a similar topic comes up again — avoiding redundant API calls, keeping results consistent, and building on past work rather than repeating it. The RAG pipeline is what makes the ecosystem accumulate intelligence over time rather than remaining a stateless tool.

---

## How It Works

**Embedding:** After a task completes and passes evaluation, its output is passed through the embedder (`rag/embedder.py`). The embedder calls the OpenAI `text-embedding-3-small` model (or a local fallback) to produce a 1536-dimension vector.

**Storage:** The vector is stored in ChromaDB alongside the original text, task metadata (agent type, task ID, timestamp, cost), and the collection name. ChromaDB uses HNSW (Hierarchical Navigable Small World) indexing for fast approximate nearest-neighbour search.

**Retrieval:** Before dispatching a task, the Orchestrator calls `rag/client.py` with the task instruction. The client embeds the instruction and queries ChromaDB for the top-5 most similar past records across relevant collections. These records are formatted and injected into the agent's prompt as `[PAST CONTEXT]`.

**Collections:** The RAG store is organised into 9 collections:

| Collection | Contents |
|---|---|
| `tasks` | Completed task outputs |
| `corrections` | Human correction records |
| `system_events` | Significant system events |
| `obsidian_notes` | Vault notes synced via vault_sync.py |
| `code_files` | Agent-generated code files |
| `agent_snapshots` | Agent status snapshots |
| `digests` | Weekly briefing content |
| `approvals` | Approval gate decisions |
| `file_drops` | User-uploaded files for context |

---

## Current Status

Built — Embedding, storage, and retrieval are operational. 9 ChromaDB collections active. Cost tracking per embedding call wired into `rag/cost_tracker.py`. File-drop watcher (`rag/watcher.py`) monitors a hot folder and auto-embeds dropped files.

---

## Key Files

- `rag/pipeline.py` — Main RAG pipeline class; `ingest()` and `query()` methods
- `rag/embedder.py` — Embedding model wrapper (OpenAI + local fallback)
- `rag/store.py` — ChromaDB client wrapper
- `rag/client.py` — High-level client used by the Orchestrator
- `rag/cost_tracker.py` — Tracks embedding costs per collection

---

## Related

- Claude-Ecosystem/Components/Intelligence/RAG Pipeline — detailed component spec
- [Claude-Ecosystem/Integrations/ChromaDB](/notes/chromadb) — the vector database backing the RAG store
- Claude-Ecosystem/Components/Intelligence/Memory Layer — how vault notes feed into RAG
- Claude-Ecosystem/Components/Core/Orchestration — injects RAG context before every task dispatch
