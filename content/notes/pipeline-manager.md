> **CI/CD-style pipeline engine** for Claude agents. Define multi-stage workflows as code, execute them with full observability, gate on conditions, and roll back on failure — exactly like AWS CodePipeline, but for AI tasks.

---

## Pipeline-as-Code (YAML Definition)

```yaml
# pipelines/code-review-pipeline.yaml
name: Full Code Review & Deploy
version: "1.0"
trigger:
 - event: git_push
 branch: main
 - event: manual

env:
 repo: "C:\\Users\\rudol\\Documents\\Claude\\Projects\\Ecosystem"
 notify_on_failure: true

stages:
 - name: Security Scan
 agent: security
 parallel: false
 tasks:
 - scan_dependencies
 - check_secrets_exposure
 - audit_permissions
 gate:
 on_failure: stop # hard stop, never skip security
 approval_required: false

 - name: Code Analysis
 agent: architect
 parallel: true # runs in parallel with next stage
 tasks:
 - analyse_architecture
 - check_complexity
 - detect_tech_debt
 gate:
 on_failure: warn_continue

 - name: Testing
 agent: tester
 parallel: true
 tasks:
 - run_unit_tests
 - run_integration_tests
 - measure_coverage
 gate:
 on_failure: stop
 min_coverage: 80

 - name: Documentation
 agent: documenter
 parallel: false
 tasks:
 - update_readme
 - generate_changelog
 - update_obsidian_notes
 gate:
 on_failure: warn_continue

 - name: Deploy
 agent: devops
 parallel: false
 tasks:
 - build_artifact
 - deploy_staging
 - run_smoke_tests
 - promote_production
 gate:
 on_failure: rollback
 approval_required: true # human approval before prod deploy
```

---

## Stage Gate Types

| Gate | Behaviour |
|---|---|
| `stop` | Pipeline halts, alert sent, no further stages run |
| `warn_continue` | Warning logged, pipeline continues |
| `rollback` | Previous stage reversed, pipeline stops |
| `approval_required` | Pauses until human confirms via Dashboard |
| `retry` | Stage retried N times before escalating |

---

## Pipeline Execution Flow

```
trigger (git push / manual / schedule)
 │
 ▼
 Load pipeline YAML
 │
 ▼
 Validate stage graph (detect cycles)
 │
 ▼
 ┌─────────────────────────────────┐
 │ Stage Executor │
 │ - Spawn agent for stage │
 │ - Pass stage context + budget │
 │ - Stream events to Dashboard │
 │ - Evaluate gate condition │
 │ - Proceed / Stop / Rollback │
 └─────────────────────────────────┘
 │
 ▼
 Write pipeline result to Obsidian
 Post notification
```

---

## Parallel Execution

```
Stage A (sequential)
 │
 ├──────────────────────┐
 ▼ ▼
Stage B (parallel) Stage C (parallel)
 │ │
 └──────────┬───────────┘
 ▼
 Stage D (waits for B + C)
```

---

## Built-in Pipeline Templates

| Template | Purpose |
|---|---|
| `code-review` | Security scan analysis docs |
| `feature-build` | Test build deploy staging |
| `full-release` | All stages + human approval gate |
| `hotfix` | Fast path: test deploy (skip docs) |
| `research` | Web research summarise save to vault |
| `architecture-review` | Analyse repo generate ADR update Obsidian |

---

## Dashboard Pipelines View (`#pipelines`)

The Dashboard Pipelines view is a live DAG visualiser backed by the `tasks` table (stages grouped by `pipeline` field) and `pipeline_event` WebSocket events.

### Pipeline List

Each pipeline row shows:
- **Pipeline name** (from YAML `name` field or task group)
- **Status badge**: `running` (animated pulse, amber), `success` (green), `failed` (red), `pending` (grey)
- **Last run time** — relative timestamp (e.g. "3 min ago")
- **Step count** — total stages in the pipeline
- **Agent** — primary agent type for the pipeline

### DAG Step Visualiser

Clicking a pipeline row expands a horizontal step sequence:

```
[Security Scan] [Code Analysis] [Testing] [Documentation] [Deploy]
 done done ⟳ running ○ pending ○ pending
```

Each node is colour-coded:
- **Green** — completed successfully
- **Amber** (pulsing) — currently running
- **Grey** — pending (not yet started)
- **Red** — failed

Arrow connectors (``) separate nodes. Parallel stages are shown side-by-side.

### CSS Classes

```css
.pipeline-steps /* flex row container for the node sequence */
.pipeline-node /* individual step node — border-radius, status colour */
.pipeline-arrow /* separator between nodes, muted colour */
```

### WebSocket Events

| Event | Payload | Action |
|---|---|---|
| `pipeline_event` | `{pipeline, stage, status, agent}` | Update step node colour + badge |
| `task_update` | task with `pipeline` field set | Group into pipeline, update counts |

---

## Related Nodes

- Agent Pool — stages dispatch to agent pool
- Observability — every stage event logged + traced
- Reliability Patterns — gates, retry, rollback
- Dashboard — pipeline progress visible in real time
