## Verified — Task 118 (2026-05-03)

`rag/store.py:44` uses `chromadb.PersistentClient(path=chroma_dir)` — data is always persisted to disk. `chroma_dir` is created with `mkdir(parents=True, exist_ok=True)` before the client initialises. `STORE_PATH` defaults to `<root>/rag_store`, overridable via `RAG_STORE_PATH` env var. The in-memory risk from §4.3 of the Weaknesses review is not present.

> Semantic vector memory for the Claude Ecosystem — every task, correction, error, Obsidian note, and code file is embedded and searchable. Agents query their past before acting.

**Status: BUILT.** Files in `rag/`. Requires `OPENAI_API_KEY` to activate.

---

## What It Does

| Direction | What happens |
|---|---|
| Ecosystem RAG | Task completions, failures, DLQ events, corrections, agent snapshots, approvals all auto-embedded |
| Files RAG | Obsidian vault `.md` files and Ecosystem `.py` files are watched and embedded on save |
| Inbox RAG | Drop any file into `rag_store/inbox/` — it gets embedded automatically |
| RAG Agent | Before every task runs, the orchestrator queries for relevant past context and injects it into the agent prompt |
| RAG Dashboard | `/api/rag/stats`, `/api/rag/query`, `/api/rag/scan` endpoints for manual queries and reindexing |

---

## Embedding Model

**Primary: OpenAI `text-embedding-3-small`**
- Cost: $0.00002 / 1K tokens (~$0.002 per 100 average documents)
- Budget alerts: configurable daily + monthly limits
- Alert fires at 80% of budget pushed to dashboard WS + Discord

**Fallback: Local `sentence-transformers` (Task 119)**
- If `OPENAI_API_KEY` is absent or the OpenAI call fails, embedding falls back to `rag/local_embedder.py`
- Uses the `all-MiniLM-L6-v2` model (22MB, runs on CPU, zero API cost)
- Lazy-loaded: the model is only downloaded and initialised on first use
- Dimensions differ (384 vs 1536) — the pipeline handles dimension detection automatically
- `provider` field in `/api/rag/stats` shows `"openai"` or `"local"` to indicate which is active

---

## Collections (ChromaDB)

| Collection | What's stored |
|---|---|
| `tasks` | Task name, instruction, result, error, cost — every completed/failed task |
| `corrections` | Agent corrections and feedback loops |
| `system_events` | Circuit breaker trips, DLQ events, ERROR logs, orchestrator start/stop |
| `obsidian_notes` | All `.md` files from the Obsidian vault |
| `code_files` | All `.py` files from the Ecosystem project |
| `agent_snapshots` | Agent health/state snapshots |
| `digests` | Weekly/daily auto-generated summaries |
| `approvals` | Approval gate decisions (approved/rejected + who + reason) |
| `file_drops` | Files dropped into the inbox folder |
| `entities` | Named entities (person/company/tool/concept/project/location) from EntityStore (Task 46) |

---

## Events That Trigger Embedding

| Event | Collection |
|---|---|
| Task completed | `tasks` |
| Task failed / DLQ | `tasks` + `system_events` |
| Task approved / rejected | `approvals` + `system_events` |
| Correction created | `corrections` |
| Circuit breaker opens | `system_events` |
| Agent registered | `system_events` |
| Skill activated | `system_events` |
| API key added | `system_events` |
| Orchestrator started | `system_events` |
| RAG cost alert | `system_events` |
| Obsidian note saved | `obsidian_notes` |
| Code file saved | `code_files` |
| File dropped in inbox | `file_drops` |

---

## Files

```
rag/
 __init__.py Exports RAGPipeline, RAGClient
 config.py Settings from .env
 cost_tracker.py Token counting, SQLite daily/monthly records, alert thresholds
 embedder.py Async OpenAI client, single + batch embed, alert callbacks
 store.py ChromaDB persistent client, 9 collections, upsert/query/query_multi
 pipeline.py Main async interface — all ingest_* and query methods
 watcher.py Watchdog file observers for Obsidian, code, and inbox
 client.py Sync fire-and-forget wrapper used by the orchestrator
 requirements.txt chromadb, openai, tiktoken, watchdog, python-dotenv

rag_store/ (auto-created at runtime)
 chroma/ ChromaDB persistent storage
 costs.db SQLite cost tracking database
 inbox/ Drop files here auto-embedded
```

---

## Setup

```bash
cd rag
pip install -r requirements.txt --break-system-packages
```

Add to `.env` (already there if using multi-model routing):
```
OPENAI_API_KEY=sk-...
```

The pipeline starts automatically when the dashboard boots if `OPENAI_API_KEY` is present.

---

## Dashboard Endpoints

| Endpoint | Method | What it does |
|---|---|---|
| `/api/rag/stats` | GET | Cost + collection counts |
| `/api/rag/query` | POST | Semantic search `{text, collections?, top_k?}` |
| `/api/rag/ingest` | POST | Manually ingest a document |
| `/api/rag/scan` | POST | Full rescan `?target=obsidian\|code\|inbox\|all` |

---

## Cost Estimates

At typical usage (50 tasks/day, 10 file saves/day):
- ~500 embedding calls/day × avg 200 tokens = 100K tokens/day
- Cost: $0.002/day = **~$0.06/month**
- Default budget: $0.50/day, $5.00/month (alerts at 80%)

---

## Privacy Filtering (T-NEW-10 — built 2026-05-17)

`query_for_task()` now accepts a `backend` parameter and applies privacy filtering via `orchestrator/privacy/policy.py` before returning chunks to the LLM.

- `filter_chunks(chunks, backend)` strips any chunk whose collection is mapped to LOCAL_ONLY when `backend == "cloud"`
- DEFAULT_POLICY: system_events / approvals / agent_snapshots / file_drops / inbox LOCAL_ONLY; tasks / corrections / obsidian_notes / code_files / entities CLOUD_ALLOWED
- Unknown collections default to LOCAL_ONLY (safe default)
- Policy is persisted in `logs/privacy_policy.json` and is user-configurable via dashboard: `GET /api/privacy/policy`, `POST /api/privacy/policy`, `POST /api/privacy/policy/reset`
- `rag/client.py` passes the backend tag through to `query_for_task()`

---

## Open Questions / Known Gaps

- RAG chunks retrieved from ChromaDB are not yet wrapped with injection-safe markers before being inserted into prompts (they go through the trust classifier but not the full sanitizer).
- The `provider` field in `/api/rag/stats` shows `"openai"` or `"local"` to indicate which embedding model is active.

---

## Related Nodes

- [Memory Layer](/notes/memory-layer) — broader memory architecture (Obsidian + RAG)
- [Orchestration](/notes/orchestration) — calls `query_for_task()` before every agent execution
- [Dashboard Architecture](/notes/dashboard-architecture) — hosts the RAG REST endpoints
- Cost Controls — RAG has its own per-embedding cost tracking
- [Notification System](/notes/notification-system) — cost alerts pushed to Discord
