---
tags: [mcp, memory, built]
created: 2026-05-15
updated: 2026-05-15
status: built
---

> Gives Claude direct read and write access to the Obsidian vault from inside a Claude Code session.

---

## What It Does

The MCP (Model Context Protocol) server is a small Python process that runs alongside Claude Code. It exposes a set of named tools — `read_note`, `write_note`, `search_notes`, and others — that Claude can call during a session to read from and write to the Obsidian vault without any copy-paste by the user.

Without this server, Claude can only work with files that the user manually copies into the chat. With it, Claude can retrieve any vault note by name, run a full-text search across thousands of notes, update status fields, and append session logs — all in real time.

---

## Tools Exposed

| Tool | What it does |
|---|---|
| `read_note(note_name)` | Returns the full content of any `.md` file in the vault by name (no extension needed) |
| `write_note(note_name, content)` | Creates or completely replaces a vault note |
| `append_to_note(note_name, content)` | Adds content to the end of an existing note without touching existing text |
| `list_notes(subfolder)` | Lists all `.md` files in the vault root or a given subfolder |
| `search_notes(query)` | Full-text search across every file in the vault; returns note name, line number, and a 120-character snippet for each match |
| `get_links(note_name)` | Extracts all `wiki-links` from a note, showing how it connects to other nodes |
| `create_session_note(summary, decisions, next_steps)` | Creates a timestamped session entry in `sessions/` following the vault format |

---

## Key File

`~\Documents\Claude\Projects\Ecosystem\mcp\obsidian_mcp_server.py`

Built using the `mcp.server.fastmcp` framework (Anthropic's MCP Python SDK).

---

## How to Run

The server is not started automatically. It must be registered in Claude Code's MCP configuration so that it launches as a subprocess when a Claude Code session opens.

Typical registration in `~/.claude/mcp.json` or Claude's settings UI:

```json
{
 "obsidian": {
 "command": "python",
 "args": ["~\\Documents\\Claude\\Projects\\Ecosystem\\mcp\\obsidian_mcp_server.py"]
 }
}
```

Once registered, all seven tools appear automatically in Claude's tool list each session.

---

## Known Issue: Hardcoded Vault Path

The vault root path is hardcoded on line 12 of `obsidian_mcp_server.py`:

```python
VAULT = Path(r"~\Documents\Evolve\Claude-Ecosystem")
```

This path is not read from the `.env` file or from any environment variable. If the vault is moved or if the system runs on a different machine, this line must be edited manually before the server will work.

Tracked as part of **Task 130** — the broader hardcoding remediation effort.

---

## Security Considerations

- The server grants Claude unrestricted read and write access to every file in the vault.
- There is no authentication between Claude and the MCP server — any process on localhost that speaks the MCP protocol can call these tools.
- The server only binds to the local machine (no network exposure) because it runs as a subprocess, not a network listener.
- Sensitive data (API keys, passwords) must never be written into vault notes — the server has no guardrail against this; enforcement relies on the `_AGENT_RULES.md` constitution and agent behaviour.

---

## Limitations

- `search_notes` does a linear scan of every file on every call. This is fast enough for vaults under a few hundred files but will slow down significantly if the vault grows to thousands of notes.
- `write_note` does a full overwrite — there is no diff or merge. Concurrent writes from two agents would silently lose one write.
- `create_session_note` uses a non-standard filename pattern (internal notes) that differs from the `_AGENT_RULES.md` specification (internal notes). This inconsistency should be corrected in the next refactor.

---

## Related Nodes

- _AGENT_RULES — rules governing how agents use these write tools
- [Vault Sync Utility](/notes/vault-sync-utility) — companion tool that keeps status fields accurate
- [Session to Vault](/notes/session-to-vault) — higher-level session note tool built on top of the transcript
- Environment Configuration — .env file; vault path should eventually be read from here
