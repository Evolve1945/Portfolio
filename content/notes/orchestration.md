> The **brain of the ecosystem** — decomposes tasks, assigns the right agent, monitors progress, handles failures, and reports results.

---

## Architecture

```
 User / Claude
 │
 ▼
 ┌────────────────────────────────────┐
 │ ORCHESTRATOR AGENT │
 │ (Claude Sonnet — coordinator) │
 │ │
 │ 1. Parse intent │
 │ 2. Decompose into sub-tasks │
 │ 3. Select agent type per task │
 │ 4. Dispatch with context budget │
 │ 5. Collect results │
 │ 6. Synthesise final output │
 └────────────┬───────────────────────┘
 │
 ┌────────────┼────────────────────────┐
 ▼ ▼ ▼ ▼
Vision [[Research [[Code [[Write
 Agent Agent]] Agent]] Agent]]
 Screen obs Web fetch Code exec Docs/reports
```

---

## Agent Types

| Agent | Model | Tools | Speciality |
|---|---|---|---|
| **Orchestrator** | claude-sonnet-4-6 | all | Task planning, synthesis |
| **Vision Agent** | claude-sonnet-4-6 | computer-use | Screen interaction |
| **Research Agent** | claude-haiku-4-5 | web_search, web_fetch | Information retrieval |
| **Code Agent** | claude-sonnet-4-6 | bash, read, write, edit | Code generation & execution |
| **Write Agent** | claude-haiku-4-5 | read, write | Document creation |
| **Memory Agent** | claude-haiku-4-5 | obsidian MCP | Knowledge graph maintenance |

---

## Task Decomposition Protocol

```
ORCHESTRATOR SYSTEM PROMPT (excerpt):

You are the master orchestrator. When given a task:
1. Break it into atomic sub-tasks (each completable in <10 tool calls)
2. Identify dependencies between sub-tasks (DAG)
3. Assign each sub-task to the cheapest capable agent
4. Set a token_budget per sub-task (default: 8000 tokens)
5. Dispatch in parallel where dependencies allow
6. On failure: retry once, then escalate to user
```

---

## Agent Communication Protocol

```json
{
 "task_id": "uuid-v4",
 "parent_id": "orchestrator-uuid",
 "agent_type": "research",
 "instruction": "Find all Apollo streaming encoder options supporting AV1",
 "context_budget": 4000,
 "tools_allowed": ["web_search", "web_fetch"],
 "memory_keys": ["apollo-encoder-decisions"],
 "output_format": "structured_json",
 "deadline_ms": 30000,
 "retry_policy": {"max_retries": 2, "backoff_ms": 1000}
}
```

---

## Error Handling & Recovery

```
Task fails
 │
 ├─ Retry (same agent, same task) ──▶ 2x attempts
 │
 ├─ Escalate (different agent type)
 │
 ├─ Decompose further (split into smaller sub-tasks)
 │
 └─ Report to [Dashboard](/notes/dashboard) + notify user
```

---

## Inspiration from Major Systems

### Amazon Bedrock Agents
- **Action Groups** — define what each agent can do (maps to tool lists)
- **Knowledge Base** — retrieval at planning time (maps to [RAG Pipeline](/notes/rag-pipeline))
- **Guardrails** — content filters per agent (maps to safety prompts)
- **Flows** — visual pipeline designer (maps to task DAG)

### Apple Intelligence
- **Intent classification** — route to the right agent based on task type
- **Private Cloud Compute** — sensitive tasks stay local
- **Orchestrated requests** — split complex requests across specialised models

### OpenAI Assistants API
- **Threads** — persistent conversation state per agent run
- **Runs** — async task execution with status polling
- **Steps** — granular tool call tracking (maps to [Dashboard](/notes/dashboard))

### AutoGPT / CrewAI pattern
- **Role-based agents** — each agent has a defined persona and capability set
- **Shared scratchpad** — agents write intermediate results to shared memory
- **Critic agent** — validates output before returning to orchestrator

---

## Decisions
- 2026-06-05 -- BrainLoop ACTIVATED (Plan D1 autonomy went live). Set BRAIN_LOOP_ENABLED=true in
 Ecosystem/.env; orchestrator restarted (PID 30208) and logged 'BrainLoop started (PROPOSE-ONLY;
 BRAIN_LOOP_ENABLED set)'. PROPOSE-ONLY: local-Qwen reflection ($0, rule-based fallback); writes
 task proposals to VAULT/Proposals/ every ~30 min when the queue is idle for human review; never
 auto-submits. Was dormant (flag unset) since the code was built.

### 2026-06-01 — T-NEW-61: project_id threaded to mesh
`executor._run_via_mesh()` now passes `metadata={"project_id": task.project_id or ""}` to `mesh_client.dispatch()`. `MeshClient` already forwarded `metadata` in the HTTP payload. No changes needed to `TaskRequest` or `MeshClient.run()` — metadata dict was the right extension point.


### 2026-06-01 — Phase D1: Self-triggering conditions
NEW `orchestrator/memory/trigger_store.py` — `TriggerStore` backed by SQLite `logs/triggers.db` (WAL mode). Methods: `set_last_run`, `get_last_run`, `check_all`. Four hardcoded triggers: `vault_audit` (>7d + >50 modified Knowledge/ .md files), `vault_curate` (>7d + >20 Inbox/ files), `repo_scout` (>14d), `enrichment` (>2h). Module-level `_TRIGGER_INSTRUCTIONS` dict maps trigger name -> (agent_type, instruction) for the three dispatch triggers. Idle enricher loop now: (1) calls `set_last_run("enrichment")` after each `run_pass()`; (2) calls `check_all()`; (3) dispatches `Task(priority=BACKGROUND)` for each due trigger via `self.submit()`; (4) calls `set_last_run(trig)` after dispatch to avoid re-fire. `enrichment` has no dispatch entry — it is tracked but drives the enricher directly. TriggerStore import wrapped in nested try/except for graceful degradation.

### 2026-06-01 — T-NEW-49: Idle enricher daemon
Added `_idle_enricher_thread` daemon in `start()`. Checks `queue.size() == 0` and `_last_task_pop_ts` to measure idle time. Fires `IdleEnricher.run_pass()` after 60s idle.

### 2026-06-01 — T-NEW-51: Active task tracking
`self._active_tasks: dict[str, dict]` added to `__init__`. Set in `_execute_task()` at task start. Cleared in `_worker()` after `_execute_task()` returns. Exposed via `GET /agents/sessions` in `api.py`.

### 2026-06-01 — T-NEW-51: Active task tracking
 added to . Set in at task start with . Cleared in after returns. Exposed via in .

| Date | Decision |
|---|---|
| 2026-05-27 | T-NEW-33 budget guard: `_budget_guard_monitor()` daemon thread reads `budget.db` with stdlib sqlite3 (never conflicts with aiosqlite FastAPI thread), sets `_budget_pause_active` flag, Telegram alert once/day, auto-clears when spend drops. `_worker()` checks flag at pop time — rejects with FAILED status. Threshold: `MONTHLY_CAP_USD * BUDGET_PAUSE_THRESHOLD(0.90)`. |
| 2026-05-27 | T-NEW-12 daily digest: `_daily_digest_monitor()` daemon thread polls every 30 min, fires at UTC hour==0, idempotent via `logs/daily_digest_notified_{date}.txt` stamp file. |
| 2026-05-25 | Voice interface uses `_tg_submit()` shared helper for both voice transcription and `/task` command — avoids duplicate orchestrator submit logic. Task fields restricted to valid dataclass fields only (no `source_type`). |

---

## Related Nodes

- [Dashboard](/notes/dashboard) — real-time task and agent monitoring
- [Token Optimization](/notes/token-optimization) — budget enforcement per agent
- Prompt Library — orchestrator and agent system prompts
- [Memory Layer](/notes/memory-layer) — agents read/write context here
- [MCP Layer](/notes/mcp-layer) — tools wired to agents via MCP

### Improvement
- **Time:** 2026-05-27 22:49:17
- **Agent:** `orchestrator` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 2,744 **Cost:** $0.01804
- **Output:** I need to scan the actual files before generating any output. Let me state my blocking ambiguities and execution plan first. --- ## Pre-Execution: Blocking Ambiguities **Ambiguity 1 — Directory Access:** I do not have direct filesystem access to `~\Documents\Evolve\Claude-Ecosystem\R …

### Improvement
- **Time:** 2026-05-27 22:53:56
- **Agent:** `orchestrator` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 2,476 **Cost:** $0.01409
- **Output:** ## Orchestrator Assessment The sub-agent correctly identified a **filesystem access blocker** and halted rather than fabricating evidence-grounded output. This is correct behavior. I will now resolve the blocker and issue the next directive. --- ## Blocking Ambiguity Resolution The previous agen …

### Goal: list all Python files in the codebase
- **Time:** 2026-05-31 15:47:52
- **Agent:** `orchestrator` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,169 **Cost:** $0.00883
- **Output:** I'll query the file-listing API directly — no need to decompose this into subtasks, it's a single straightforward lookup. Let me call the `/api/files` endpoint with `type=all` filtered to `.py` files (or use the default `type=generated` which already filters to Python/JS/TS). --- **Clarifying not …

### auto-trigger: vault_curate
- **Time:** 2026-06-10 23:56:50
- **Agent:** `vault-curator` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 2,639 **Cost:** $0.01392
- **Output:** # Vault Curation Pass — Scheduled Run I don't have direct filesystem access to enumerate the actual files currently sitting in `VAULT/Inbox/`. To perform the curation pass properly, I need visibility into the inbox contents. --- ## What I Need to Proceed Please provide one of the following: **O …

### [OK] auto-trigger: vault_curate
- **Time:** 2026-06-28 13:54:18
- **Agent:** `vault-curator` `gpt-4o`
- **Status:** completed
- **Tokens:** 2,700 **Cost:** $0.00725
- **Output:** I lack direct filesystem access to enumerate files in `VAULT/Inbox/`. To conduct the curation pass, I need a list of files in the Inbox or direct access to enumerate them. Please provide this information so I can proceed with sorting, deduplicating, and categorizing the content as per the vault's …

### [OK] auto-trigger: vault_curate
- **Time:** 2026-07-12 18:02:17
- **Agent:** `vault-curator` `claude-haiku-4-5-20251001`
- **Status:** completed
- **Tokens:** 0 **Cost:** $0.00000
- **Output:** Tool loop error: Error code: 400 - {'type': 'error', 'error': {'type': 'invalid_request_error', 'message': 'Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.'}, 'request_id': 'req_011CcxSk6ecAEZmFDSViwvbV'}
