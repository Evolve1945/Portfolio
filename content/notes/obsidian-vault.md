---
tags: [memory, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
Obsidian is the knowledge management application used as the human-readable long-term memory for the Claude Ecosystem. The vault — a folder of Markdown files at `~\Documents\Evolve\Claude-Ecosystem\` — is where all documentation, session records, component descriptions, error logs, and task histories live as plain text files. You can read, edit, and link these files in the Obsidian app, and the ecosystem's agents can write new notes to the vault after every task.

## Why It Matters
The Obsidian vault is the single source of truth for everything the ecosystem knows about itself. If the databases were wiped, the vault would still contain the full history of decisions, architecture notes, session summaries, and component documentation. It also serves as the human-readable layer alongside the machine-searchable ChromaDB: the vault is for reading and understanding; ChromaDB is for fast retrieval during task execution. The vault's Markdown format means it is independent of any software — your data is always accessible with any text editor.

## How It Works
The vault is a standard folder of `.md` files organised into a directory structure: `Components/`, `Security/`, `Features/`, `Integrations/`, `sessions/`, `errors/`, `agents/`, `Roadmap/`, `Review/`, and so on. Each file has a YAML frontmatter block at the top (the section between `---` lines) containing tags, creation date, updated date, and status. Obsidian reads this frontmatter to enable powerful search, filtering, and graph visualisation.

The **Memory Layer** (`ObsidianWriter`) writes new notes to the vault after task completion, passing every write through the 4-gate Memory Write Validator first. The **session_to_vault.py** script parses each coding session's transcript, uses Claude Haiku to write a narrative summary, and saves it as a internal notes file. The **vault_sync.py** script reads the actual codebase state and updates the `status:` field in each component's vault note to accurately reflect whether the component is built, partial, or planned.

Obsidian's graph view can visualise the `WikiLinks` between notes, showing the architecture of the system as a network of interconnected concepts. The RAG Pipeline watches the vault folder with a file watcher, automatically embedding any new or changed `.md` file into ChromaDB within seconds of it being saved.

## Current Status
 Built — Vault is the active memory store, file watcher is live, ObsidianWriter and session_to_vault.py are operational.

## Key Files
- `orchestrator/memory/obsidian_writer.py` — Writes notes to the vault
- `session_to_vault.py` — Converts session transcripts to vault notes
- `vault_sync.py` — Syncs codebase status to vault frontmatter
- `rag/watcher.py` — Watches the vault folder and auto-embeds new files

## Open Questions / Known Gaps
- The vault path is currently hardcoded in several files. The `OBSIDIAN_PATH` or `CLAUDE_VAULT_PATH` environment variable should be used universally as the override.

## Related
- [Components/Intelligence/Memory Layer](/notes/memory-layer) — the ObsidianWriter that writes to the vault
- [Components/Intelligence/RAG Pipeline](/notes/rag-pipeline) — embeds vault notes into ChromaDB for semantic search
- Security/Memory Write Validator — guards every vault write
