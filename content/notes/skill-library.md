> A growing, self-improving store of proven skills, GitHub repos, and workflow templates. Every time an agent solves a new problem well, the solution is added here for reuse. Quality is measured — only the best patterns survive.

## Built

Built 2026-05-15 (Task 40). File: `orchestrator/skills/library.py` (SkillLibrary). Endpoints: `GET/POST /skills`, `GET /skills/search`, `GET/PATCH/DELETE /skills/{id}`, `POST /skills/{id}/use`. SQLite-backed skill store.

---

---

## Three Stores

### 1. Skills Library
Curated collection of proven prompts, tool chains, and agent configurations.

```
skills/
├── code-review-checklist.md
├── security-scan-prompt.md
├── research-synthesis-template.md
├── deploy-validation-steps.md
└── error-diagnosis-framework.md
```

Each skill file contains:
- **Purpose** — what this skill does
- **Agent** — which agent type uses it
- **Prompt template** — the actual reusable prompt
- **Quality score** — rated by Benchmark System
- **Usage count** — how many times it's been used
- **Success rate** — % of tasks where it produced good output

---

### 2. GitHub Repo Index
Catalogue of useful repositories agents can reference, clone, or install from.

| Repo | Capability | Tags | Stars | Last Used |
|---|---|---|---|---|
| (populated as agents discover useful repos) | | | | |

Tagged by: `mcp-server`, `python-tool`, `template`, `reference`, `library`

---

### 3. Workflow Templates
Reusable pipeline definitions in YAML that agents can instantiate for common patterns.

```yaml
# workflows/code-review.yaml
name: Full Code Review
stages:
 - name: Security Scan
 agent: security
 gate: block_on_fail
 - name: Code Analysis
 agent: reviewer
 gate: warn_on_fail
 - name: Test Run
 agent: tester
 gate: block_on_fail
 - name: Documentation Check
 agent: documenter
 gate: warn_on_fail
```

Available templates:
- `code-review.yaml` — security + analysis + tests + docs
- `research-report.yaml` — search + synthesise + format + save
- `deploy-pipeline.yaml` — build + test + security + deploy + verify
- `error-diagnosis.yaml` — classify + diagnose + fix + verify

---

## Quality Scoring

Every skill and workflow is scored by the Benchmark System:

```
Score = (success_rate × 0.5) + (speed_score × 0.25) + (cost_efficiency × 0.25)
```

Scores update after every use. Skills below 60% are flagged for review. Skills above 90% are promoted to "Gold" status and preferred by the orchestrator.

---

## Auto-Import Pipeline

When an agent solves a problem it hasn't seen before:
1. Post-task hook triggers the memory agent
2. Memory agent evaluates if the solution is generalizable
3. If yes proposes a new skill entry with template
4. Evo approves via Telegram (or auto-approves if confidence > 90%)
5. Skill is added to library and indexed in Obsidian

---

## Database

```sql
skill_library (
 id TEXT PRIMARY KEY,
 name TEXT,
 type TEXT, -- prompt / workflow / repo / tool
 agent_type TEXT,
 content TEXT, -- prompt template or YAML or repo URL
 quality_score REAL DEFAULT 0.0,
 usage_count INTEGER DEFAULT 0,
 success_rate REAL DEFAULT 0.0,
 tags TEXT, -- JSON array
 created_at TEXT,
 last_used TEXT,
 status TEXT -- draft / active / gold / deprecated
)
```

---

## Related Nodes

- [Skills Registry](/notes/skills-registry) — install/activate skills
- Agent Profiles — which agents use which skills
- Benchmark System — quality scoring engine
- [Pipeline Manager](/notes/pipeline-manager) — workflow template execution
- Auto-Evolution — auto-import of new solutions
- Prompt Library — prompt-specific store

### Claude-self-test
- **Time:** 2026-05-23 20:37:03
- **Agent:** `writer` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 901 **Cost:** $0.00300
- **Output:** An autonomous AI agent executes tasks independently, making decisions and taking actions without requiring human input at each step.

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 19:02:39
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,879 **Cost:** $0.01731
- **Output:** # Claude Ecosystem Multi-Agent Pipeline: Operational Status Report --- ## Executive Summary The Claude Ecosystem's multi-agent task pipeline is experiencing a **circuit breaker failure** on the `documenter` agent, causing repeated task failures routed to the dead-letter queue (DLQ). One successfu …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 19:02:49
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,892 **Cost:** $0.01751
- **Output:** # Multi-Agent Pipeline Reliability Report **Prepared for:** Technical Team Lead **Subject:** Circuit Breaker Failures in Documenter Agent **Classification:** Internal / Engineering --- ## Executive Summary The `documenter` agent is failing systematically due to an open circuit breaker, routing t …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 19:03:09
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,913 **Cost:** $0.01782
- **Output:** # Multi-Agent Pipeline Reliability Report **Prepared for:** Technical Team Lead **Subject:** Circuit Breaker Failures in Documenter Agent — Dead Letter Queue Analysis --- ## Executive Summary The `documenter` agent is experiencing repeated circuit breaker trips, routing "Write Final Report" task …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 19:03:32
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,843 **Cost:** $0.01677
- **Output:** # Multi-Agent Pipeline Reliability Report **Prepared for:** Technical Team Lead **Source:** Claude Ecosystem task queue analysis **Status:** Incident report — circuit breaker activation observed --- ## Executive Summary The `documenter` agent is experiencing repeated task failures due to an open …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 19:03:34
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,835 **Cost:** $0.01665
- **Output:** # Multi-Agent Pipeline: Circuit Breaker Failure Analysis Report --- **To:** Technical Team Lead **Re:** `documenter` Agent Failures — Dead Letter Queue Accumulation **Status:** Incident Confirmed --- ## Executive Summary The `documenter` agent is failing to execute due to an **OPEN circuit brea …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 21:36:16
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,847 **Cost:** $0.01683
- **Output:** # Multi-Agent Pipeline Reliability Report **Audience:** Technical Team Lead **Date:** 2025-01-31 **Status:** Incident Analysis --- ## Executive Summary The multi-agent pipeline experienced repeated failures in the `documenter` agent circuit, resulting in three tasks routed to the dead-letter que …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 21:36:30
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,896 **Cost:** $0.01757
- **Output:** # Multi-Agent Pipeline Reliability Report **Audience:** Technical Team Lead **Date:** 2025-01-31 **Status:** Incident Analysis --- ## Executive Summary The multi-agent pipeline experienced repeated task failures for the `Write Final Report` task, with the `documenter` agent's circuit breaker ope …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 21:36:49
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,954 **Cost:** $0.01844
- **Output:** # Multi-Agent Orchestration System: Reliability Analysis Report --- ## Executive Summary The orchestration system is experiencing a **critical circuit-breaker failure** on the `documenter` agent, causing repeated task failures routed to the dead-letter queue (DLQ). Three identical "Write Final Re …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 21:37:12
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,856 **Cost:** $0.01697
- **Output:** # Multi-Agent Pipeline Reliability Report **Prepared for:** Technical Team Lead **Subject:** Circuit Breaker Failures in Documenter Agent **Status:** Incident Analysis --- ## Executive Summary The `documenter` agent is failing repeatedly with `Circuit OPEN` errors, routing tasks to the dead-lett …

### Write a clear, well-structured report based on the analysis.
- **Time:** 2026-05-27 21:37:14
- **Agent:** `documenter` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 1,875 **Cost:** $0.01725
- **Output:** # Multi-Agent Pipeline Reliability Report **Prepared for:** Technical Team Lead **Status:** Incident Analysis **Date:** 2025-01-31 --- ## Executive Summary The `documenter` agent experienced repeated circuit-breaker trips during the "Write Final Report" pipeline stage, routing three task instanc …

## Decisions

### 2026-06-01 — T-NEW-56: CLI Tool Auto-Wrapper
`orchestrator/tools/cli_wrapper.py` — `wrap_cli(tool, router)` runs `--help` via subprocess, Haiku extracts metadata, returns staging dict. `POST /api/tools/wrap` + `/wrap/confirm` atomically update contract `bash_allowlist`.

### 2026-06-01 — T-NEW-60: Skills Auto-Discovery
`orchestrator/discovery/skills_scanner.py` — `SkillsScanner.scan()` queries GitHub API, de-duplicates against `SkillLibrary.all_skills()`, writes new skill docs to `Knowledge/Skills/`, sends Telegram notification. Weekly cron (Sundays 09:00) in `schedules.yaml`.

### 2026-06-01 — T-NEW-60: Skills Auto-Discovery
 — queries GitHub API for Claude Code skills index, de-duplicates against , writes new skill docs to , sends Telegram notification. Weekly cron job added to (Sundays 09:00).
