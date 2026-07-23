---
tags: [pipeline, orchestration, built]
created: 2026-04-27
updated: 2026-05-15
status: built
---


> **Pipeline orchestration.** Define multi-step workflows where tasks depend on each other, run in parallel where possible, and pass their outputs downstream automatically.

---

## How It Works

```
Pipeline definition (YAML or JSON)
 │
 ▼
 Loader + Validator
 - parse tasks
 - check all depends_on refs exist
 - DFS cycle detection
 │
 ▼
 DAGExecutor
 - find ready tasks (no pending deps)
 - submit all ready tasks in parallel
 - on completion inject output find newly ready tasks
 - on failure cancel all downstream tasks
 │
 ▼
 Each task runs through the existing orchestrator
 (multi-model router, retry logic, RAG context, dashboard sync)
```

---

## Execution Example

```
research_and_write pipeline:

 research_web ──┐
 ├──▶ analyze ──▶ write_report
 research_ctx ──┘

Step 1: research_web + research_ctx run IN PARALLEL
Step 2: analyze runs once both complete (gets both outputs injected)
Step 3: write_report runs once analyze completes
```

---

## Defining Pipelines

### YAML (drop in `orchestrator/pipelines/`)

```yaml
name: my_pipeline
description: Optional description

tasks:
 - id: first_task
 name: Research the topic
 agent: researcher
 instruction: "Find information about X"
 priority: HIGH # CRITICAL / HIGH / NORMAL / BACKGROUND
 token_budget: 4000 # max tokens for this task
 timeout_s: 120
 max_retries: 2

 - id: second_task
 name: Write the report
 agent: documenter
 depends_on: [first_task] # waits for first_task to complete
 instruction: "Write a report based on the research"
```

### JSON via API

```bash
curl -X POST http://localhost:8765/pipeline \
 -H "Content-Type: application/json" \
 -d '{
 "name": "quick_research",
 "tasks": [
 {"id": "A", "agent": "researcher", "instruction": "Research X"},
 {"id": "B", "agent": "documenter", "depends_on": ["A"],
 "instruction": "Write report from research"}
 ]
 }'
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/pipeline` | Submit a pipeline from JSON body |
| `POST` | `/pipeline/yaml?filename=name` | Run a pre-registered YAML pipeline |
| `GET` | `/pipelines` | List all pipeline runs |
| `GET` | `/pipelines/{id}` | Get full state of a pipeline run |
| `GET` | `/pipelines/list/yaml` | List available YAML pipeline files |

---

## Built-in Pipelines

| File | Description |
|---|---|
| `research_and_write.yaml` | Parallel web + memory research synthesis report |
| `code_review_pipeline.yaml` | Parallel security + quality + test audit unified verdict |

---

## Output Injection

When task B depends on task A, B's instruction automatically receives A's output:

```
B's instruction:
 "Write a report based on the research"

 --- OUTPUT FROM 'Web Research' ---
 [A's full output text appended here]
```

Multiple upstream dependencies are all appended in order.

---

## Failure Behaviour

```
 A ──▶ B ──▶ D
 
 C ──▶ E

If B fails:
 - D CANCELLED
 - C CANCELLED (depends on B)
 - E CANCELLED (depends on C)
 - A already COMPLETED, unaffected
 - Pipeline status FAILED
 - Dashboard event: pipeline_task_failed + pipeline_complete (status=failed)
```

---

## File Structure

```
orchestrator/
├── dag/
│ ├── __init__.py
│ ├── models.py — PipelineDef, PipelineRun, PipelineTaskRun
│ ├── loader.py — load_yaml(), load_json(), cycle detection
│ └── executor.py — DAGExecutor (parallel scheduling)
└── pipelines/
 ├── research_and_write.yaml
 └── code_review_pipeline.yaml
```

---

## Related Nodes

- [Orchestration](/notes/orchestration) �
