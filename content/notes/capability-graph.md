> The orchestrator's live map of what it can currently do — updated every time a skill is added, a credential is provided, or a tool changes state.

## Built

Built 2026-05-15 (Task 39). File: `orchestrator/capabilities/graph.py` (CapabilityGraph.snapshot). Endpoint: `GET /capabilities`. Returns live system capability map with agent categories and mesh status.

---

---

## Purpose

Before planning any task, the orchestrator queries the Capability Graph:
> "What tools do I actually have available right now?"

This prevents the orchestrator from planning tasks that require unavailable skills, and allows it to propose acquiring new capabilities when it hits a limitation.

---

## Graph Structure

```
capabilities/
└── current_state.json live capability snapshot (regenerated on change)
```

```json
{
 "generated_at": "2026-04-26T14:30:00Z",
 "capabilities": {
 "vision": {
 "available": true,
 "tools": ["screenshot", "left_click", "type", "scroll"],
 "provided_by": "computer-use-mcp",
 "quality": "full"
 },
 "web_search": {
 "available": true,
 "tools": ["web_search"],
 "provided_by": "built-in",
 "quality": "basic",
 "upgrade_available": "brave-search (needs BRAVE_API_KEY)"
 },
 "memory_read": {
 "available": true,
 "tools": ["read_note", "search_notes"],
 "provided_by": "obsidian-mcp"
 },
 "memory_write": {
 "available": true,
 "tools": ["write_note"],
 "provided_by": "obsidian-mcp"
 },
 "vector_search": {
 "available": false,
 "tools": [],
 "provided_by": null,
 "blocker": "chromadb-mcp not yet installed",
 "install_command": "python mcp/chromadb_mcp_server.py"
 },
 "github_access": {
 "available": false,
 "tools": [],
 "provided_by": null,
 "blocker": "GITHUB_TOKEN not in credential store"
 }
 },
 "total_available": 12,
 "total_possible": 34,
 "missing_credentials": ["BRAVE_API_KEY", "GITHUB_TOKEN", "NOTION_API_KEY"],
 "installable_now": ["chromadb-mcp", "dashboard-mcp"]
}
```

---

## How Orchestrator Uses This

### At task planning time:
```python
def plan_task(task_description: str):
 caps = capability_graph.load()
 
 # Check if task requires unavailable capabilities
 required = infer_required_capabilities(task_description)
 missing = [c for c in required if not caps[c]["available"]]
 
 if missing:
 response = {
 "status": "blocked",
 "missing_capabilities": missing,
 "suggestions": [caps[c].get("upgrade_available") or 
 caps[c].get("blocker") for c in missing]
 }
 # Report to user via Dashboard and ask how to proceed
 return response
 
 # Proceed with planning using only available tools
 return generate_dag(task_description, available_tools=caps)
```

---

## Capability Tiers

| Tier | Description | Example |
|---|---|---|
| **Native** | Always available, no setup | bash, read/write files |
| **Local** | Needs local server running | obsidian-mcp, chromadb-mcp |
| **Credentialed** | Needs API key | brave-search, github-mcp |
| **Paid** | Per-call cost | Anthropic API, OpenAI API |
| **Unavailable** | Not yet installed | elevenlabs, stability-ai |

---

## Self-Improvement Loop

```
Daily (or on user prompt):
 1. Load current capability graph
 2. Compare to full skills registry
 3. Identify gaps that are easily filled:
 - "You have BRAVE_API_KEY in .env but brave-search-mcp is not installed"
 - "chromadb-mcp is not running — start it with: python mcp/chromadb_mcp_server.py"
 4. Generate a prioritised action list
 5. Present to user (or auto-resolve if low-risk)
```

---

## Capability Expansion Events

| Trigger | What Changes |
|---|---|
| New `.env` key added | Credential scan skill auto-activation |
| New MCP server started | Tool registration capability update |
| Skill package downloaded | Available tools expand |
| Skill deactivated | Capability graph shrinks, tasks re-routed |
| API key rotated | No capability change, just updated credential |

---

## Related Nodes

- [Orchestration](/notes/orchestration) — reads capability graph before every task
- [Skills Registry](/notes/skills-registry) — source of truth for installable skills
- Credential Manager — credentials gate capability activation
- [Dashboard](/notes/dashboard) — capability graph visualised as status panel
