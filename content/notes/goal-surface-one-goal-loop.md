> Built 2026-07-17 — second piece of the 100 Propositions **Surface block**
> (sequencing #5), after [Agent Command Center](/notes/agent-command-center-fleet-view). Dark behind `GOAL_SURFACE_ENABLED`,
> fail-open. Suite **1324 green**. P91 (dashboard-v2) is the last open top-20 item.

## Why

Gemini-Agent's single surface: the user states a **goal** and never picks a mode.
Today asking the Ecosystem something means choosing — a skill? a kgraph query? RAG
recall? web research? a browser read? The goal loop makes those **interchangeable
capabilities** one planner picks per step, observing each result until it can answer.

## How it works
`orchestrator/goal_surface.py` · flag `GOAL_SURFACE_ENABLED`

- **Capabilities are injected** as `{name: fn(query) -> str}` — every entry equal.
 `build_default_capabilities()` wires read-only defaults: `skills` (skill-index
 search), `kgraph` (neighbors), `recall` (facts block), `research` (web gather),
 `browser` (clean page fetch). A missing backend surfaces as an error-observation,
 never a crash.
- **Planner**: an injected `llm_fn` answers `CALL <capability> <input>` or
 `FINISH <answer>` given the goal + capability list + observations so far. Without
 an llm_fn (or when it errors/talks garbage) a **$0 deterministic heuristic** picks
 one capability by keyword (urlbrowser, research/latestresearch, how-toskills,
 relatedkgraph, default recall) and finishes on its observation.
- **Bounded + fail-open**: hard `max_steps` cap (default 5; exhaustion returns a
 best-effort answer, `finished=False`); a capability exception becomes an
 observation the planner can react to; every step is recorded
 (`GoalResult.steps` capability, query, observation, ok).
- **Entry point**: `maybe_run_goal(goal)` — returns `None` when the flag is off or
 anything errors, so [omnibox](/notes/agentic-os-modules) `route()` keeps its existing
 task-spec path for goal intents. `route()` itself stays deterministic/no-LLM;
 the loop is the follow-on call for `kind == "goal"` routes.

## Relation to the planner/DAG

The goal surface is for *conversational* goals — a few read-only calls and an
answer. Anything that needs writes, approvals, or multi-agent work still goes
through the task path (omnibox task spec planner/DAG), where the [Safety Floor](/notes/safety-cost-floor)
and [Durable Execution](/notes/durable-execution-eval-ratchet) apply.

## Key files
- `orchestrator/goal_surface.py` — GoalSurface, maybe_run_goal, heuristic_pick,
 build_default_capabilities
- Tests: `tests/test_goal_surface.py` (15) — suite 1324

## Flag (OFF — see `.env.example`)
`GOAL_SURFACE_ENABLED`

## Related
- 100 Propositions (sequencing #5 — P61+P62 DONE, P91 open) · [Agent Command Center](/notes/agent-command-center-fleet-view)
- [Skill System](/notes/skill-system-library-forge-injection) · [Memory Layer](/notes/memory-layer) · [Agentic OS Modules](/notes/agentic-os-modules)
