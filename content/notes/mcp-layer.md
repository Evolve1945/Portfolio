---
tags: [layer, mcp, built]
created: 2026-04-26
updated: 2026-04-28
status: built
---

> **Model Context Protocol** — the universal wiring standard that connects Claude to every tool, service, and system in the ecosystem.

---

## What MCP Does

MCP lets Claude call external tools as if they were native functions. Each MCP server exposes a set of **tools** (functions Claude can call) and optionally **resources** (data Claude can read).

---

## Ecosystem MCP Servers

| Server | Tools Exposed | Technology |
|---|---|---|
| **computer-use** | screenshot, click, type, scroll | Built-in |
| **workspace** | bash, web_fetch | Built-in |
| **obsidian-mcp** | read_note, write_note, search_notes, list_notes | Python |
| **chromadb-mcp** | rag_search, ingest_document | Python |
| **dashboard-mcp** | post_task_event, get_status | Python/FastAPI |
| **browser-mcp** | navigate, read_page, find, javascript | Chrome ext |

---

## Custom MCP Server Template

```python
# obsidian_mcp_server.py
from mcp import MCPServer, tool
import os, json

VAULT_PATH = r"~\Documents\Evolve\Claude-Ecosystem"

server = MCPServer("obsidian")

@tool("read_note")
def read_note(note_name: str) -> str:
 """Read a note from the Obsidian vault by name."""
 path = os.path.join(VAULT_PATH, f"{note_name}.md")
 with open(path, "r", encoding="utf-8") as f:
 return f.read()

@tool("write_note")
def write_note(note_name: str, content: str) -> str:
 """Write or update a note in the Obsidian vault."""
 path = os.path.join(VAULT_PATH, f"{note_name}.md")
 with open(path, "w", encoding="utf-8") as f:
 f.write(content)
 return f"Written: {note_name}"

@tool("search_notes")
def search_notes(query: str, top_k: int = 5) -> list:
 """Full-text search across all vault notes."""
 results = []
 for fname in os.listdir(VAULT_PATH):
 if fname.endswith(".md"):
 with open(os.path.join(VAULT_PATH, fname), "r", encoding="utf-8") as f:
 content = f.read()
 if query.lower() in content.lower():
 results.append({"file": fname, "snippet": content[:200]})
 return results[:top_k]

server.run()
```

---

## MCP Configuration (claude_desktop_config.json)

```json
{
 "mcpServers": {
 "obsidian": {
 "command": "python",
 "args": ["~\\Documents\\Claude\\Projects\\Ecosystem\\mcp\\obsidian_mcp_server.py"]
 },
 "chromadb": {
 "command": "python",
 "args": ["~\\Documents\\Claude\\Projects\\Ecosystem\\mcp\\chromadb_mcp_server.py"]
 },
 "dashboard": {
 "command": "python",
 "args": ["~\\Documents\\Claude\\Projects\\Ecosystem\\mcp\\dashboard_mcp_server.py"]
 }
 }
}
```

---

## MCP Security Model

- Each server runs as a separate process with its own permissions
- Tools are sandboxed — filesystem access scoped to configured paths
- Secrets (API keys) injected via environment variables, never in config
- Audit log: all tool calls logged with timestamp + agent ID

---

## Related Nodes

- [Orchestration](/notes/orchestration) — agents call tools via MCP
- [Memory Layer](/notes/memory-layer) — obsidian-mcp and chromadb-mcp
- Vision Layer — computer-use MCP
- [Dashboard](/notes/dashboard) — dashboard-mcp
- [RAG Pipeline](/notes/rag-pipeline) — chromadb-mcp
