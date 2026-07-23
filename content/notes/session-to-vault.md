> Converts a raw Claude Code session transcript (`.jsonl`) into a structured Obsidian session note and then runs `vault_sync.py` to update all component status fields.

---

## What It Does

After each working session, `session_to_vault.py` reads the session's conversation transcript, extracts what files were changed, what tasks were completed, and what the user asked for — then writes a formatted internal notes entry to the vault. If an Anthropic API key is available, it calls Claude Haiku to generate a short narrative summary of decisions and progress.

This closes the loop between code work and vault documentation automatically, without requiring manual note-taking.

---

## How It Works

1. Locates the session transcript file (`.jsonl` format from Claude Code)
2. Scans for tool calls that created or modified files — builds a file change list
3. Identifies task completions from conversation content
4. Extracts user messages to capture intent
5. If `ANTHROPIC_API_KEY` is set: calls Claude Haiku to produce a narrative paragraph
6. Writes internal notes following the format in `_AGENT_RULES.md`
7. Calls `vault_sync.py` automatically to update component status tags

---

## Usage

```
python session_to_vault.py # auto-detect latest session transcript
python session_to_vault.py --session SESSION_ID # target a specific session
python session_to_vault.py --transcript PATH # provide transcript path directly
python session_to_vault.py --no-llm # skip Haiku summary, mechanical output only
python session_to_vault.py --dry-run # print note without writing to vault
```

---

## Key File

`~\Documents\Claude\Projects\Ecosystem\session_to_vault.py`

---

## Path Resolution

The script resolves the vault path in this order:
1. `CLAUDE_VAULT_PATH` environment variable (if set)
2. `{project_root}/../../Evolve/Claude-Ecosystem` (relative from project root)
3. `~/Documents/Evolve/Claude-Ecosystem`
4. Hardcoded fallback: `~\Documents\Evolve\Claude-Ecosystem`

Session transcripts are located by scanning Claude's local sessions directory (`AppData/Roaming/Claude/local-agent-mode-sessions/`).

Output notes are named internal notes. If that file already exists (same-day second session), it appends `-2`, `-3`, etc.

---

## Known Limitation

Reads only the most recent transcript by default. For sessions that ran across multiple context windows (compacted sessions), only the current window's transcript is available — earlier portions are summarised by Claude Code's compaction mechanism.

---

## Related Nodes

- [Vault Sync Utility](/notes/vault-sync-utility) — runs automatically after session_to_vault completes
- _AGENT_RULES — session file format defined in Section 6
- 00 - Claude Ecosystem — hub file updated as part of the sync
- Components/Core/Environment Configuration — CLAUDE_VAULT_PATH env var
