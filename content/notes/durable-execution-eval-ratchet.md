> Built 2026-07-13 (second block after the [Safety Floor](/notes/safety-cost-floor)). 100 Propositions
> sequencing #2 and #3. All dark behind env flags, **fail open**, verified inert
> when off. Suite: **1246 tests green**.

## Why these next

The safety floor made turning autonomy up *safe*; this block makes it *survivable
and self-improving*. Autonomous overnight runs kept dying to rate limits and had
to restart from scratch — durable execution fixes that. And letting the forge
auto-activate skills is only wise if a quality gate stops it memorizing its own
evidence — the eval ratchet is that gate.

## Durable DAG execution (P01 · P02 · P81)
`orchestrator/dag/checkpoint.py` · flag `DAG_CHECKPOINT_ENABLED`

One SQLite checkpoint store (`dag_checkpoint.db`) gives the [DAG Pipeline Engine](/notes/dag-pipeline-engine)
three properties (LangGraph / PydanticAI / Mastra patterns):

- **P01 checkpointing** — every node's terminal state + result is persisted after
 each hop; an interrupted run resumes from the last completed node.
- **P02 node interrupt/resume** — a node's task fn may `raise NodeInterrupt(...)`
 to park ONLY that branch (an approval request) while sibling branches keep
 running. `DAGExecutor.resume(pr, task_id, payload)` un-parks it with the
 approver's input injected. New `PAUSED` task/pipeline states; a node waiting on
 a paused branch is left PENDING (not cancelled) so resume can finish it.
- **P81 replay recovery** — the checkpoint IS the step log: `restore()` rehydrates
 a fresh PipelineRun from the saved node states, so completed nodes are NOT
 re-executed (no re-calling models for work already done) — cheaper than
 re-running the graph, the single-machine form of PydanticAI/Temporal replay.

Wired into `dag/executor.py` via an injected `checkpoint_store` (None = legacy
non-durable). NodeInterrupt handling is inherently opt-in — inert unless a task
fn raises it.

## Progressive skill loading (P31)
`orchestrator/skills/injector.py` · flag `SKILL_PROGRESSIVE_ENABLED`

Three-level loading (Agent Skills standard) keeps 500+ skills near-free in context:
- **level 1** `skills_index()` — a compact `name — description` catalog of the
 agent's allowed skills (contract-filtered), a few dozen tokens each.
- **level 2** full skill body — only for the top matches (the existing
 `skills_block`); when the flag is on, the level-1 index is prepended so the
 model also sees what else it could pull.
- **level 3** `load_skill_asset(name, asset)` — a jailed, on-demand read of a
 bundled helper/reference file, only when a step actually needs it.

## Eval-gated promotion (P32 · P52)
`orchestrator/evaluator/promotion_gate.py` · flag `EVAL_PROMOTION_GATE_ENABLED`

- **P52 `eval_gate()`** — one reusable gate that runs an agent's golden set
 against a candidate and returns promote/block. `make_skill_gate_fn()` adapts it
 to the `gate_fn(name, body)` shape the prompt registry
 and [skill registry](/notes/skill-system-library-forge-injection) `promote()` already accept — one gate, three
 artifact types (prompt / contract / skill).
- **P32 `held_out_gate()`** — the forge-specific variant: evaluates a candidate on
 gold cases OUTSIDE the evidence it was forged from (excluded by `source`), so a
 skill that only "passes" on its own incidents (memorized) is caught. The
 [Skill Forge](/notes/skill-system-library-forge-injection) gains an `activation_gate` that demotes a
 gate-failing skill to the approvals queue instead of auto-activating it.

## Key files
- `orchestrator/dag/checkpoint.py` — DAGCheckpointStore, NodeInterrupt
- `orchestrator/dag/executor.py` — checkpoint/restore/park/resume wiring
- `orchestrator/dag/models.py` — PAUSED states
- `orchestrator/skills/injector.py` — skills_index, load_skill_asset
- `orchestrator/skills/forge.py` — activation_gate hook
- `orchestrator/evaluator/promotion_gate.py` — eval_gate, held_out_gate, make_skill_gate_fn
- Tests: `tests/test_dag_checkpoint.py`, `test_skill_injector.py`, `test_promotion_gate.py`,
 `test_skill_forge.py` (+24 tests)

## Flags (all OFF — see `.env.example`)
`DAG_CHECKPOINT_ENABLED` · `SKILL_PROGRESSIVE_ENABLED` · `EVAL_PROMOTION_GATE_ENABLED`

## Related
- 100 Propositions (sequencing #2/#3 DONE) · [Safety Floor](/notes/safety-cost-floor) · [Skill System](/notes/skill-system-library-forge-injection)
- [DAG Pipeline Engine](/notes/dag-pipeline-engine) · [Agentic OS Modules](/notes/agentic-os-modules)
