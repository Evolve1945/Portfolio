> The **package manager for Claude's capabilities** — discovers, installs, configures, and activates new skills and MCP servers at runtime without restarting the ecosystem.

---

## Concept

The orchestrator starts with a base set of skills. Over time it **grows** by:
- Downloading new MCP servers (from registry or GitHub)
- Activating new API integrations when credentials are added
- Learning new prompt templates
- Composing existing skills into higher-order workflows

This mirrors: **npm** for Node, **pip** for Python, **Cowork plugins** for this app.

---

## Skill Definition

Each skill is a self-describing package:

```json
{
 "skill_id": "web-search-brave",
 "name": "Brave Search",
 "version": "1.2.0",
 "description": "Web search via Brave Search API",
 "type": "mcp_server",
 "entry": "python brave_search_mcp.py",
 "requires_credentials": ["BRAVE_API_KEY"],
 "capabilities": ["web_search", "news_search", "image_search"],
 "dependencies": [],
 "token_cost_estimate": "low",
 "install_script": "pip install brave-search-mcp"
}
```

---

## Registry Structure

```
skills/
├── registry.json master catalog of all known skills
├── installed.json currently active skills
├── available/ downloaded but not yet activated
│ └── brave-search-v1.2.0/
├── active/ currently running MCP servers
│ ├── obsidian-mcp/
│ ├── chromadb-mcp/
│ └── brave-search-mcp/
└── templates/ prompt templates per skill
 ├── web-search.md
 └── code-executor.md
```

---

## Skill Lifecycle

```
Discover
 │ (registry scan, GitHub search, user-provided URL)
 ▼
Evaluate
 │ (read skill manifest, check dependencies, check credential requirements)
 ▼
Install
 │ (download, pip/npm install, add to registry)
 ▼
Configure
 │ (inject credentials from Credential Manager)
 ▼
Activate
 │ (start MCP server, register tools with orchestrator)
 ▼
Hot-reload
 (orchestrator polls capability graph, new tools available immediately)
```

---

## Activation Trigger: New API Key Added

When a new credential is added to Credential Manager:

```python
def on_credential_added(key_name: str, key_value: str):
 # Find all skills that require this credential
 waiting_skills = registry.find_by_credential(key_name)
 for skill in waiting_skills:
 if all_dependencies_met(skill):
 activate_skill(skill)
 orchestrator.reload_capabilities()
 log(f"Auto-activated: {skill.name} (triggered by {key_name})")
```

**Example:**
- User adds `PERPLEXITY_API_KEY` Perplexity search skill auto-activates
- User adds `GITHUB_TOKEN` GitHub MCP server auto-activates
- User adds `NOTION_API_KEY` Notion MCP server auto-activates

---

## Dashboard Skills View

The [Dashboard](/notes/dashboard) Skills view (`#skills`) exposes the registry directly in the UI. It uses a `BUILTIN_SKILLS` array seeded in `index.html` (no backend call required for the baseline):

```javascript
const BUILTIN_SKILLS = [
 { name:'Web Research', plugin:'research', cat:'research', desc:'Search and retrieve web content', active:true },
 { name:'Code Generation', plugin:'coding', cat:'coding', desc:'Write and refactor code', active:true },
 { name:'Data Analysis', plugin:'data', cat:'data', desc:'Analyse datasets and produce insights', active:true },
 { name:'File Management', plugin:'automation', cat:'automation', desc:'Create, move, and organise files', active:true },
 { name:'Web Scraping', plugin:'research', cat:'research', desc:'Extract structured data from pages', active:false },
 { name:'API Integration', plugin:'automation', cat:'automation', desc:'Call external REST/GraphQL APIs', active:false },
 { name:'Database Query', plugin:'data', cat:'data', desc:'Run SQL queries against databases', active:false },
 { name:'Email Automation', plugin:'communication', cat:'communication', desc:'Read, draft, and send emails', active:false },
 { name:'Document Processing',plugin:'data', cat:'data', desc:'Parse PDF, DOCX, and XLSX files', active:false },
 { name:'Image Analysis', plugin:'data', cat:'data', desc:'Analyse and describe images', active:false },
 { name:'Brave Search', plugin:'research', cat:'research', desc:'High-quality web search via Brave API', active:false, requires:'BRAVE_API_KEY' },
 { name:'GitHub Integration', plugin:'automation', cat:'automation', desc:'Read repos, create PRs, manage issues', active:false, requires:'GITHUB_TOKEN' },
];
```

**UI Features:**
- 3-column card grid on desktop, 1-column on mobile
- Category filter tabs: All / Research / Coding / Data / Communication / Automation
- Toggle switch on each card calls `POST /api/skills/{id}/toggle`
- Active skills: purple border, "ACTIVE" badge
- Skills locked behind a credential: grey lock badge showing required key name
- Skill card shows: name, plugin identifier, category badge, description

---

## Built-in Skills (Phase 1)

| Skill | Credential Needed | Capability |
|---|---|---|
| `computer-use` | None | Screen vision + input |
| `bash-executor` | None | Shell commands |
| `obsidian-mcp` | None (local) | Vault read/write |
| `chromadb-mcp` | None (local) | Vector search |
| `web-fetch` | None | URL fetcher |
| `web-search-bing` | Built-in | Web search |

---

## Downloadable Skills (Phase 2+)

| Skill | Credential | What Unlocks |
|---|---|---|
| `brave-search` | `BRAVE_API_KEY` | Better web search |
| `github-mcp` | `GITHUB_TOKEN` | Repo read/write, PRs |
| `notion-mcp` | `NOTION_API_KEY` | Notion workspace |
| `slack-mcp` | `SLACK_BOT_TOKEN` | Slack messaging |
| `gmail-mcp` | Google OAuth | Email read/send |
| `linear-mcp` | `LINEAR_API_KEY` | Issue tracking |
| `perplexity-mcp` | `PERPLEXITY_API_KEY` | AI-powered search |
| `openai-mcp` | `OPENAI_API_KEY` | GPT-4 fallback agent |
| `elevenlabs-mcp` | `ELEVENLABS_KEY` | Voice output |
| `stability-mcp` | `STABILITY_KEY` | Image generation |

---

## Self-Discovery Loop

The orchestrator runs a capability audit on startup and after any change:

```python
def audit_capabilities():
 installed = registry.list_installed()
 credentialed = credential_manager.list_available_keys()
 
 # Find skills that could be activated with available credentials
 activatable = [s for s in registry.list_all() 
 if all(c in credentialed for c in s.requires_credentials)
 and s not in installed]
 
 if activatable:
 log(f"New skills available to activate: {[s.name for s in activatable]}")
 # Optionally auto-activate or prompt user
```

---

## Skill Update Flow

```
Scheduled daily check:
 For each active skill:
 1. Check registry for newer version
 2. If update available: download to available/
 3. At next idle moment: swap active/ run tests promote
 4. If tests fail: rollback to previous version
```

---

## Related Nodes

- [Orchestration](/notes/orchestration) — orchestrator queries capability graph before task planning
- Credential Manager — credentials trigger skill activation
- [Capability Graph](/notes/capability-graph) — live map of what the system can currently do
- [MCP Layer](/notes/mcp-layer) — skills are implemented as MCP servers
- Prompt Library — each skill ships with prompt templates
