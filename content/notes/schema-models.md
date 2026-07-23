---
tags: [architecture, code-quality, built]
created: 2026-05-15
updated: 2026-05-15
status: built
---

> Pydantic v2 typed domain models for every object that crosses a module boundary in the orchestrator. Replaces implicit dict passing with validated, serialisable dataclasses.

---

## Why It Exists

Before Task 103, data flowed between orchestrator modules as plain Python dicts — no type checking, no validation at boundaries. A missing field in a task dict would surface as a `KeyError` deep inside an agent call, not at the point of creation. The schema models layer adds a typed contract at every module boundary: if you pass a malformed `Task` to the executor, you get a `ValidationError` immediately with a clear description of what field was wrong.

---

## What Is Defined

All models live in `orchestrator/schemas/models.py`.

### Enums

| Enum | Values |
|---|---|
| `TaskStatus` | `pending`, `approval_pending`, `running`, `completed`, `failed`, `cancelled`, `gated`, `rejected` |
| `TaskPriority` | `LOW`, `NORMAL`, `HIGH`, `CRITICAL` |
| `AgentType` | `orchestrator`, `architect`, `coder`, `reviewer`, `tester`, `devops`, `security`, `documenter`, `researcher`, `analyst`, `vision`, `memory` |
| `TrustLevel` | `INTERNAL`, `EXTERNAL`, `UNKNOWN` |
| `CircuitState` | `closed`, `open`, `half_open` |
| `EvalOutcome` | `PASS`, `WARN`, `FAIL` |

All enums inherit from `(str, Enum)` — they serialise to plain strings in JSON with no custom encoder required.

### Task Model

```python
class Task(BaseModel):
 task_id: str # UUID v4
 name: str
 instruction: str
 agent_type: AgentType
 priority: TaskPriority = TaskPriority.NORMAL
 status: TaskStatus = TaskStatus.PENDING
 trust_level: TrustLevel = TrustLevel.INTERNAL
 token_budget: int = 4096
 max_retries: int = 2
 created_at: str # ISO-8601
 metadata: dict = {}
```

### TaskResult Model

```python
class TaskResult(BaseModel):
 task_id: str
 agent_type: AgentType
 status: TaskStatus
 output: Optional[str]
 model_used: str
 tokens_in: int
 tokens_out: int
 cost_usd: float
 duration_s: float
 trust_out: TrustLevel
 error: Optional[str]
```

### AgentInfo, EvalScore, BudgetEntry, ScheduledJob models are also defined.

---

## Bridge Helpers

To avoid a full codebase rewrite, two bridge functions allow existing code that uses dataclasses to produce typed schema objects:

```python
task_schema_from_dataclass(old_task_dc) -> Task
agent_schema_from_dataclass(old_agent_dc) -> AgentInfo
```

---

## Key File

`orchestrator/schemas/models.py`

Requires `pydantic >= 2.0.0`. The import raises a clear `ImportError` if pydantic is missing, rather than failing silently.

---

## Design Principles

1. All `datetime` fields stored as ISO-8601 strings — matches the existing JSONL log convention, avoiding a two-phase migration
2. Enums as `(str, Enum)` — zero-cost JSON serialisation
3. `model_dump()` via Pydantic built-in — no hand-rolled `_to_dict()` methods downstream
4. Validators enforce business rules at the boundary (e.g. `token_budget` must be >= 1)
5. Python 3.9+ compatible — no 3.10 union syntax

---

## Related Nodes

- [Components/Core/Orchestration](/notes/orchestration) — primary consumer of these schemas
- [Components/Core/Task DAG](/notes/task-dependency-dag) — DAGExecutor accepts typed PipelineDef and PipelineTaskDef
- [Components/Core/HTTP Agent Mesh](/notes/http-agent-mesh) — TaskResult is the response schema for `/run`
- [Review/Architecture Decision Records](/notes/architecture-decision-records) — Task 103 in Project Progress
