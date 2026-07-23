> Built 2026-07-16 (fourth 100_PROPOSITIONS block, after [Safety Floor](/notes/safety-cost-floor),
> [Durable Execution](/notes/durable-execution-eval-ratchet), and [Cost + Memory Block](/notes/cost-memory-block)). Sequencing #7. Both modules
> dark behind env flags, **fail open**, verified inert when off. Suite: **1299 green**.

## Why these

The eval ratchet ([Durable Execution](/notes/durable-execution-eval-ratchet)) grades a run's *final output*. But a run can
end with the right answer while choosing the wrong tool, looping, or handing off to the
wrong agent — regressions an output-only judge never sees. P51 grades the *steps*. And
the forge keeps writing skills; P71 locks their format to the portable open standard so
the whole library stays usable in any Agent-Skills harness, not just this one.

## Trace-level grading (P51)
`orchestrator/evaluator/trace_grader.py` · flag `TRACE_GRADING_ENABLED`

Replays a stored trace (the span tree from [tracing.py](/notes/observability)) and scores the
intermediate steps against a rubric — OpenAI/Braintrust step-grading, locally.

- `grade_spans(spans, rubric, llm_fn, threshold)` is the pure, offline-testable core.
 Heuristic checks (no model): **error_free** (weight 2), **no_tool_loops** (same tool
 fired N+ times consecutively), **tool_choice** (nothing from a forbidden set),
 **expected_tools** (named tools were actually used), **step_budget** (tool+model span
 count ≤ cap), **termination** (root span finished — no dangling run), **handoff_valid**
 (handoff spans within the allowed set). An injected `llm_fn` adds an optional judged
 **step_quality** check.
- Score is the weighted pass-fraction; an errored span caps a pass regardless of score.
- `TraceGrader(fetch_spans_fn).grade_trace(trace_id, rubric)` loads then grades; returns
 `None` when the flag is off, there's no span source, the trace is empty, or anything
 errors (fail-open). `build_default()` wires the span source to the real Tracer.

## Open SKILL.md standard gate (P71)
`orchestrator/skills/standard.py` · flag `SKILL_STANDARD_GATE_ENABLED`

The library already ships standard SKILL.md containers, so it's portable to the open
Agent Skills standard (agentskills.io — the schema ~40 client apps read). This locks
that in as a gate so forge output can't silently drift. The ecosystem [_SPEC.md](/notes/skill-system-library-forge-injection)
is a richer **superset** (extra frontmatter + strict XML body); portable consumers ignore
the extras, so a skill only has to satisfy the minimal core:

- YAML frontmatter delimited by `---`/`---`; **name** present, kebab-case, ≤ 64 chars;
 **description** present, non-empty, ≤ 1024 chars; a non-empty Markdown body.
- `validate_open_standard(text)` / `validate_skill_file(path)` `(ok, issues)`.
- `standard_gate(name, body)` is shaped like the forge's `gate_fn(name, body)` promote
 gate — returns `True` (inert) when the flag is off so the existing [lint](/notes/skill-system-library-forge-injection)
 stays the gate of record; fail-open (never blocks on its own error).

## Key files
- `orchestrator/evaluator/trace_grader.py` — grade_spans, TraceGrader, build_default
- `orchestrator/skills/standard.py` — validate_open_standard, standard_gate
- Tests: `tests/test_trace_grader.py` (15), `tests/test_skill_standard.py` (14) — +29; suite 1299

## Flags (both OFF — see `.env.example`)
`TRACE_GRADING_ENABLED` · `SKILL_STANDARD_GATE_ENABLED`

## Related
- 100 Propositions (sequencing #7 DONE) · [Durable Execution](/notes/durable-execution-eval-ratchet) (output-level eval gate)
- [Observability](/notes/observability) (the trace store this grades) · [Skill System](/notes/skill-system-library-forge-injection) · [Agentic OS Modules](/notes/agentic-os-modules)
