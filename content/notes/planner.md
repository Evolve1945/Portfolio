## What It Is
The Planner takes a complex, natural-language goal and breaks it into a structured sequence of smaller agent tasks before any work begins. Instead of passing an ambiguous goal like "build a web scraper for this site and test it" directly to an agent, the Planner turns it into an explicit plan: step 1 (architect agent: design the structure), step 2 (coder agent: implement it), step 3 (tester agent: write and run tests), step 4 (reviewer agent: check code quality). Each step knows what it depends on, so the system executes them in the right order.

## Why It Matters
Without the Planner, complex multi-step tasks would either fail (because a single agent was overwhelmed) or be executed in the wrong order (trying to test code that hasn't been written yet). The Planner ensures that every complex task is handled with a clear strategy before anyone starts working. It also makes the system more transparent: you can see exactly what plan was generated before approving an expensive task, and the plan itself is logged so you can review the reasoning later.

## How It Works
The Planner accepts a natural-language goal via a `POST /plan` endpoint. It calls Claude Opus (or Sonnet as a fallback) with a structured prompt designed to produce a JSON-format DAG plan — a list of steps, where each step specifies: the agent type to use, the exact instruction to give that agent, which previous steps it depends on, and whether a human approval gate should be placed before it runs.

The output is validated for schema correctness (all required fields present, valid agent types, no cycles in the dependency chain — a "cycle" would mean step A depends on step B which depends on step A, creating an infinite loop). If validation fails, the Planner retries with an error message explaining what was wrong.

The plan is then handed to the DAG Pipeline Engine, which executes the steps in the correct order, respecting dependencies and running independent steps in parallel where possible. The Planner also supports a `dry_run` mode: you can ask it to generate and validate a plan without executing it, useful for reviewing what the system intends to do before committing.

## Current Status
 Built — Opus-direct planning with Sonnet fallback, JSON validation, cycle detection, and `POST /plan` endpoint with dry-run support are all live.

## Key Files
- `orchestrator/planner/planner.py` — Main planner: LLM call, JSON validation, cycle detection
- `orchestrator/planner/__init__.py` — Package exports

## Open Questions / Known Gaps
- Failed tasks do not yet loop back to the Planner for replanning — they simply fail and go to the dead-letter queue. Implementing replan-on-failure is listed as a future improvement.

## Related
- [Components/DAG Pipeline Engine](/notes/dag-pipeline-engine) — executes the plan produced by the Planner
- Components/Orchestrator — calls the Planner for complex tasks
- Components/Agent Mesh — the agents that execute each planned step
- [Integrations/Anthropic API](/notes/anthropic-api) — Opus model used for planning, Sonnet as fallback
