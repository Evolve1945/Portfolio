> Each agent type runs as a standalone FastAPI process on its own port. The orchestrator fans tasks out via HTTP instead of in-process threads — enabling independent scaling, deployment, and health isolation per agent.

---

## Architecture

```
Orchestrator :8765
 │
 │ POST /run (parallel fan-out via MeshClient)
 │
 ├──▶ architect :8770
 ├──▶ coder :8771
 ├──▶ reviewer :8772
 ├──▶ tester :8773
 ├──▶ devops :8774
 ├──▶ security :8775
 ├──▶ researcher :8776
 ├──▶ documenter :8777
 ├──▶ analyst :8778
 ├──▶ vision :8779
 ├──▶ memory :8780
 ├──▶ writer :8781
 ├──▶ summarizer :8782
 ├──▶ designer :8783
 ├──▶ executor :8784
 ├──▶ monitor :8785
 ├──▶ planner :8786
 ├──▶ scheduler :8787
 ├──▶ vault-security :8788
 ├──▶ vault-curator :8789
 ├──▶ repo-scout :8790
 ├──▶ processor :8791
 └──▶ deep-researcher :8792
```

---

## Files

| File | Role |
|---|---|
| `orchestrator/mesh/agent_server.py` | FastAPI server each agent process runs |
| `orchestrator/mesh/mesh_client.py` | Orchestrator-side HTTP fan-out client |
| `orchestrator/mesh/agent_registry.py` | Process manager — start, stop, health-check, auto-restart |
| `orchestrator/mesh/agents.yaml` | Port map, model, timeout, token budget per agent type |
| `orchestrator/mesh/__init__.py` | Package exports |
| `start_mesh.ps1` | Launches all agents + orchestrator + dashboard |

---

## Agent Server Endpoints

Every agent exposes the same REST interface:

| Method | Path | Description |
|---|---|---|
| `POST` | `/run` | Submit task, block until result |
| `POST` | `/run/async` | Submit task, return `job_id` immediately |
| `GET` | `/job/{job_id}` | Poll async job status |
| `GET` | `/health` | Health + circuit breaker state |
| `GET` | `/info` | Agent config, system prompt, capabilities |
| `GET` | `/metrics` | Cumulative tokens, cost, error count |

### Task Request Schema

```json
{
 "task_id": "uuid",
 "name": "Write a JSON parser",
 "instruction": "Write a streaming JSON parser in Python...",
 "token_budget": 4096,
 "priority": 5,
 "trust_level": "INTERNAL",
 "metadata": {}
}
```

### Task Result Schema

```json
{
 "task_id": "uuid",
 "agent_type": "coder",
 "status": "completed",
 "output": "...",
 "model_used": "claude-sonnet-4-6",
 "tokens_in": 512,
 "tokens_out": 1024,
 "cost_usd": 0.0032,
 "duration_s": 4.2,
 "trust_out": "INTERNAL"
}
```

---

## Port Map

| Agent | Port | Model |
|---|---|---|
| architect | 8770 | claude-sonnet-4-6 |
| coder | 8771 | claude-sonnet-4-6 |
| reviewer | 8772 | claude-sonnet-4-6 |
| tester | 8773 | claude-sonnet-4-6 |
| devops | 8774 | claude-sonnet-4-6 |
| security | 8775 | claude-sonnet-4-6 |
| researcher | 8776 | claude-haiku-4-5 |
| documenter | 8777 | claude-haiku-4-5 |
| analyst | 8778 | claude-haiku-4-5 |
| vision | 8779 | claude-sonnet-4-6 |
| memory | 8780 | claude-haiku-4-5 |
| writer | 8781 | claude-haiku-4-5 |
| summarizer | 8782 | claude-haiku-4-5 |
| designer | 8783 | claude-sonnet-4-6 |
| executor | 8784 | claude-sonnet-4-6 |
| monitor | 8785 | claude-haiku-4-5 |
| planner | 8786 | claude-sonnet-4-6 |
| scheduler | 8787 | claude-haiku-4-5 |
| vault-security | 8788 | claude-sonnet-4-6 |
| vault-curator | 8789 | claude-haiku-4-5 |
| repo-scout | 8790 | claude-sonnet-4-6 |
| processor | 8791 | qwen-long (local llama.cpp :11435) |
| deep-researcher | 8792 | sonar-pro (Perplexity) |

---

## Activation

### Enable HTTP mesh

Add to `.env`:

```
USE_HTTP_MESH=true
```

When `USE_HTTP_MESH=false` (default), the orchestrator continues using in-process threads — zero change to existing behaviour.

**Current state (2026-06-09):** `USE_HTTP_MESH=true` is set in `.env` — all 23 agent servers (8770-8792) run as standalone FastAPI processes. Verified live: 23/23 `/health` return ok, and the orchestrator `/agents/mesh` reports all 23 reachable.

### Launch

```powershell
.\start_mesh.ps1 # all agents + orchestrator + dashboard
.\start_mesh.ps1 -Agent coder # single agent
```

### Manual single agent

```bash
python orchestrator/mesh/agent_server.py --agent coder --port 8771
```

---

## Fan-out Example

```python
from mesh import MeshClient, MeshTask, fan_out

results = fan_out([
 MeshTask(task_id="1", name="Design API", instruction="...", agent_type="architect"),
 MeshTask(task_id="2", name="Write tests", instruction="...", agent_type="tester"),
 MeshTask(task_id="3", name="Research JWT", instruction="...", agent_type="researcher"),
])
# All three run in parallel; results list preserves input order
```

---

## Orchestrator REST Endpoints (new)

| Endpoint | Description |
|---|---|
| `GET /agents/mesh` | Cluster health — all agent servers |
| `GET /agents/mesh/metrics` | Token/cost/error metrics per agent |
| `POST /agents/mesh/task` | Direct task dispatch to one agent (for testing) |

---

## Security Integration

- **Trust gate** — requests with `trust_level=UNKNOWN` are rejected before execution
- **Secret scan** — instruction is scanned for credential patterns before processing (Task 88)
- **External wrapping** — `trust_level=EXTERNAL` adds injection-resistance instructions to system prompt (Task 85)
- **Output scan** — agent responses are scanned for leaked secrets before returning (Task 88)
- **Trust propagation** — if input is EXTERNAL, `trust_out` is EXTERNAL regardless of agent processing

---

## Agent Registry

The `AgentRegistry` manages processes:

```python
from mesh.agent_registry import AgentRegistry

registry = AgentRegistry(auto_restart=True, health_interval_s=15)
registry.start_all()
registry.start_monitor() # background health + auto-restart loop
registry.status() # dict of all agent states
registry.stop_all()
```

Auto-restart fires when:
- Process exits unexpectedly (`proc.poll() is not None`)
- `/health` returns `"offline"` while process is still up (e.g. stuck)

Gives up after `max_restarts=10` to avoid infinite crash loops.

---

## Circuit Breaker

Each agent server runs its own circuit breaker:

| State | Condition | Behaviour |
|---|---|---|
| `closed` | Normal | Tasks execute normally |
| `open` | ≥5 consecutive failures | Requests return 503 immediately |
| `half_open` | 60s after opening | Next request is attempted — if it succeeds, circuit closes |

Circuit state is visible on `/health` and `/metrics`.

---

## Related Nodes

- [Orchestration](/notes/orchestration) — orchestrator wires in MeshClient when USE_HTTP_MESH=true
- Self-Healing System — watchdog + AgentRegistry auto-restart on crash
- Agent Contracts — each agent enforces its own contract at the HTTP layer
- Trust Boundary Classifier — trust_level flows through every HTTP request
- Secret Isolation — prompt scanner runs inside agent_server.py before execution
- [Dashboard Architecture](/notes/dashboard-architecture) — /agents/mesh health endpoint feeds the Agents panel

## Decisions

### 2026-06-01 — Sessions C+D+E: 5 new agents registered (ports 8788-8792)
vault-security (8788, sonnet, extended): vault compliance auditor — broken links, missing frontmatter, orphaned files.
vault-curator (8789, haiku, none): vault maintenance — sorts Inbox/, deduplicates Knowledge/, fixes tags.
repo-scout (8790, sonnet, enhanced): GitHub repo discovery and evaluation, writes to VAULT/Knowledge/Repos/.
processor (8791, qwen-long->local llama.cpp, enhanced): document/file processing via local Qwen model.
deep-researcher (8792, sonar-pro, enhanced): web-grounded research with citations via Perplexity API.
All 5 registered across: prompts.py, agents.yaml, orchestrator.py AGENT_CONFIG, watchdog.py _MESH_AGENTS, obsidian_writer._ROUTE.
3 cron jobs added to schedules.yaml: vault-security daily 03:00, vault-curator Sunday 04:00, repo-scout Wednesday 10:00.


### 2026-06-01 — T-NEW-61: Per-project rules injection
`agent_server._execute()` reads `req.metadata["project_id"]` after loading global agent rules (T-NEW-48). If set, checks `VAULT/agents/{project_id}/{agent_type}/rules.md`. If present, prepends `## Project {id} Rules` block ABOVE the global rules block. Chain: project rules -> global agent rules -> role prompt.


### 2026-06-01 — T-NEW-48: Learned rules injection
`agent_server.py._execute()` reads `VAULT/agents/{agent_type}/rules.md` before building the system prompt. If non-empty, prepends `## Learned Rules for {type}\n{content}\n---\n`. Fails silently on IO error. Controlled by `CLAUDE_VAULT_PATH` env var.


### 2026-06-01 — Session H: Error correction feedback loop (T-H)
agent_server._execute() T-H block inserted after T-NEW-48. Reads VAULT/agents/{agent_type}/corrections.md if present, strips frontmatter, prepends as “## Past Corrections for {type}” section ABOVE the global rules block (T-NEW-48). Same try/except isolation pattern. Prompt order: Past Corrections -> Learned Rules -> Project Rules -> role prompt.
POST /api/agents/{agent_type}/correction (auth-gated) added to dashboard: calls ObsidianWriter.log_correction(), returns {ok, path}.
