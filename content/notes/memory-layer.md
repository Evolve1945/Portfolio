> Claude's **persistent second brain** — a structured knowledge graph that survives between sessions, compresses context, and retrieves relevant facts on demand. Implemented via `ObsidianWriter` with 4-gate validation on every vault write.

## What It Is
The Memory Layer writes structured, human-readable notes to the Obsidian vault after every task. Where the RAG Pipeline stores memories as numerical fingerprints for machine search, the Memory Layer stores them as Markdown files that a person can read, browse, and edit. Together they form the ecosystem's complete memory: machine-searchable and human-readable at the same time.

## How It Works
The Memory Layer is implemented as `ObsidianWriter` — a module that manages writes to the vault. After every task completes, the Orchestrator calls the ObsidianWriter to record what happened. Before writing, the output passes through a 4-gate validation system: trust level is checked, injection patterns are scanned, the note structure is validated against the expected schema for that note type, and the file size is capped at 50 KB. The `vault_sync.py` tool runs after each session to reconcile the vault with the actual state of the codebase. The `session_to_vault.py` tool parses each coding session's transcript and writes a narrative summary note using Claude Haiku.

## Key Files

- `orchestrator/memory/obsidian_writer.py` — Main writer with validation pipeline
- `orchestrator/memory/entity_store.py` — EntityStore: named entity store (Task 46) backed by `entities/` vault folder + "entities" RAG collection
- `orchestrator/security/memory_validator.py` — The 4-gate validation system
- `session_to_vault.py` — Session transcript Obsidian note
- `vault_sync.py` — Sync vault status tags from actual codebase state

---

## Architecture

```
 Long-term Memory
 ┌──────────────────────────────────────────┐
 │ Obsidian Vault │
 │ ~\Documents\Evolve\ │
 │ Claude-Ecosystem\ │
 │ │
 │ ┌──────────┐ ┌──────────┐ │
 │ │ Concepts │──▶│ Projects │ │
 │ └──────────┘ └──────────┘ │
 │ │ │ │
 │ ┌────▼──────────▼────────┐ │
 │ │ Knowledge Graph │ │
 │ │ (wiki-link network) │ │
 │ └────────────────────────┘ │
 └──────────────────────────────────────────┘
 │ │
 Semantic Search Exact Lookup
 │ │
 ┌────────▼────────┐ ┌───────▼────────┐
 │ Vector DB │ │ MEMORY.md │
 │ (ChromaDB / │ │ Index file │
 │ Qdrant local) │ │ per session │
 └─────────────────┘ └────────────────┘
```

---

## Memory Tiers

| Tier | Storage | TTL | Use Case |
|---|---|---|---|
| [!!] Hot | Active context window | Session | Immediate working memory |
| [--] Warm | MEMORY.md index | Persistent | Cross-session facts, preferences |
| [OK] Cold | Obsidian vault + vector DB | Permanent | Deep knowledge, docs, decisions |

---

## Obsidian Integration

### Why Obsidian
- Local-first (no cloud dependency)
- Graph view = visual knowledge map
- Wiki-links create typed relationships
- Dataview plugin = SQL-like queries over notes
- Templater = auto-generate structured notes
- Canvas = visual architecture boards

### Key Plugins to Install
- **Dataview** — query notes like a database
- **Templater** — auto-fill note templates on creation
- **Canvas** — visual mindmap/flowchart board
- **Smart Connections** — AI-powered semantic note search
- **Obsidian Git** — auto-commit vault to git repo

### Recommended Vault Structure
```
Claude-Ecosystem/
├── 00 - Claude Ecosystem.md hub
├── Memory Layer.md
├── Vision Layer.md
├── Orchestration.md
├── sessions/ per-session logs
│ └── 2026-04-26-session.md
├── decisions/ architecture decisions
│ └── ADR-001-streaming.md
├── prompts/ prompt library
│ └── orchestrator-system.md
└── agents/ agent configs
 └── vision-agent.md
```

---

## Vector Database

- **Local option:** ChromaDB (Python, zero config) or Qdrant (Rust, fast)
- **Chunking strategy:** 512 tokens, 64-token overlap, semantic boundaries
- **Embedding model:** `text-embedding-3-small` (1536 dims, cheap)
- **Index:** HNSW (fast approximate nearest-neighbour)

### MCP Integration
```python
# Claude queries memory via MCP tool
mcp_tool("memory_search", {
 "query": "what did we decide about Apollo encoder settings?",
 "top_k": 5,
 "filter": {"tag": "decisions"}
})
```

---

## Token Savings from Memory Layer

| Strategy | Token Reduction |
|---|---|
| RAG vs full context | ~75% |
| Compressed session summaries | ~60% |
| Structured retrieval (not raw docs) | ~40% |
| Cached system prompts | ~30% |

---

## Related Nodes

- [RAG Pipeline](/notes/rag-pipeline) — machine-searchable memory (the other half of memory)
- [Token Optimization](/notes/token-optimization) — memory-driven savings
- [Orchestration](/notes/orchestration) — agents write memories after task completion
- Security/Memory Write Validation — 4-gate system protecting every vault write
- Security/Trust Boundary Classifier — determines trust level before write is allowed
- [Integrations/Obsidian](/notes/obsidian-vault) — the vault itself
- Prompt Library — prompts stored and versioned here

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 19:01:47
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,243 **Cost:** $0.00893
- **Output:** I notice the request doesn't specify a **topic** to search for. Based on the context provided, I can see several recent task attempts for "Internal Context Lookup" — but no topic was included in those tasks either. Here is what I can report from the vault context provided: --- ## Vault Search R …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 19:02:03
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,318 **Cost:** $0.01005
- **Output:** I'll search the vault systematically for any existing notes and context. Let me check the key paths. **Checking core files:** --- **`agents/status.md`** — not found in vault (no content returned in context) **`Project Progress.md`** — not found in vault (no content returned in context) **`sessi …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 19:02:07
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,303 **Cost:** $0.00983
- **Output:** I'll search the vault systematically for any existing notes and context. Let me check the key paths. **Vault Search Results** Based on my read of the relevant context provided and the vault structure, here is what I found: --- ## Search Summary ### Files Checked | Path | Status | |------|---- …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 19:02:22
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,287 **Cost:** $0.00908
- **Output:** I'll systematically check the key vault paths for existing notes and context. ## Vault Search Results ### Checking Key Paths **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned in context) **`sess …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 19:11:50
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,421 **Cost:** $0.01109
- **Output:** I'll systematically check the key vault paths for existing notes and context. ## Vault Search Results ### Core Files Checked **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned in context) **`sess …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 21:35:29
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,439 **Cost:** $0.01128
- **Output:** I'll systematically check the key vault paths for existing notes and context. ## Vault Search Results ### Core Files Checked **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned in context) **`sess …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 21:35:40
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,382 **Cost:** $0.01042
- **Output:** I'll systematically check the key vault paths for existing notes and context. ## Vault Search Results ### Key Paths Checked **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* **`sessions/`** — *not found in vault* (n …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 21:35:49
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,586 **Cost:** $0.01257
- **Output:** I'll search the vault systematically across all key paths for existing notes and context. ## Vault Search Results ### Core Infrastructure Files **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned i …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 21:35:57
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,655 **Cost:** $0.01259
- **Output:** I'll search the vault systematically by checking all key paths and returning exact content found. ## Vault Search Results ### Key Paths Checked **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned i …

### Search the ecosystem memory and Obsidian vault for any exist
- **Time:** 2026-05-27 21:45:28
- **Agent:** `memory` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,586 **Cost:** $0.01063
- **Output:** I'll search the vault systematically across all key paths for existing notes and context. ## Vault Search Results ### Core Infrastructure Files **`agents/status.md`** — *not found in vault* (no content returned in context) **`Project Progress.md`** — *not found in vault* (no content returned i …

## Decisions

### 2026-06-01 — Session G: SkillWriter — auto skill creation after complex tasks
orchestrator/memory/skill_writer.py NEW. SkillWriter.write_skill(agent_type, task_slug, output_text, thinking_level).
Guard: no-op if thinking_level not in {enhanced, extended} or output_text empty or CLAUDE_VAULT_PATH unset.
Haiku (claude-haiku-4-5-20251001, 512 tokens) extracts: task_type, key_steps, decision_rationale, gotchas.
Falls back to stub dict if anthropic import fails or API call fails. Never raises.
Writes to VAULT/Knowledge/Skills/{agent_type}-{task_slug}.md via ObsidianWriter.write_note().
orchestrator.py: _AGENT_THINKING dict loaded from agents.yaml. self.skill_writer initialised after obsidian_writer.
Hook in _execute_task(): fire-and-forget threading.Thread calls write_skill() when thinking is enhanced/extended.
VAULT/Knowledge/Skills/ directory created, _index.md added.


### 2026-06-01 — T-NEW-61: Per-project agent rules
`log_project_agent_rule(project_id, agent_type, rule_text)` added to `ObsidianWriter`. Writes to `VAULT/agents/{project_id}/{agent_type}/rules.md`. Creates file with project-scoped frontmatter on first write. `_project_agent_path()` helper returns the path. Project dirs are NOT pre-initialised — created on demand.


### 2026-06-01 — T-NEW-48: Agent Learned Rules
Extended `ObsidianWriter.log_agent_rule(agent_type, rule_text)` — appends timestamped rules to `VAULT/agents/{type}/rules.md`. `agent_server.py` now prepends this file to the system prompt at every dispatch. Rules persist across restarts and sessions without touching `_AGENT_RULES.md`.

### 2026-06-01 — T-NEW-49: Idle-Time Knowledge Enricher
`orchestrator/memory/enricher.py` — `IdleEnricher` class. Daemon thread in orchestrator wakes every 30s, fires after 60s of queue idle. Extracts up to 5 typed entity relations per note from `Knowledge/` via Haiku. Aborts if daily budget remaining < $0.005. Writes via `EntityStore.relate()`.

### 2026-06-01 — T-NEW-49: Idle-Time Knowledge Enricher
 — class. Daemon thread in orchestrator wakes every 30s, fires after 60s of queue idle. Extracts up to 5 typed entity relations per note from via Haiku. Aborts if daily budget remaining < /usr/bin/bash.005. Writes via .

### 2026-06-01 — Session H: log_correction() method
ObsidianWriter.log_correction(agent_type, correction_text) -> bool added.
Path: VAULT/agents/{agent_type}/corrections.md. Creates with frontmatter (tags: [agents, corrections, {type}]) if absent. Appends timestamped entry. Same atomic-write + per-file lock pattern as log_agent_rule(). Called by POST /api/agents/{type}/correction; injected into agent system prompt by T-H block in agent_server.

### 2026-07-13 — P21/P22 tiering + consolidation (extends the memory layer)
Two dark modules (`memory/tiers.py` `MEMORY_TIERS_ENABLED`, `memory/fact_consolidation.py`
`FACT_CONSOLIDATION_ENABLED`). P21 formalises retrieval into core/recall/archival tiers instead
of one RAG pool; P22 classifies a new fact as ADD/UPDATE/DELETE/NOOP against its neighbors before
writing, retiring stale/duplicate facts via `FactStore.resolve()`. Both fail-open to existing
behaviour. See [Cost + Memory Block](/notes/cost-memory-block).
