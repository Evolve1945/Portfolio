---
tags: [pipeline, orchestration, built]
status: built
created: 2026-05-15
updated: 2026-05-15
---

## What It Is
The DAG Pipeline Engine (Directed Acyclic Graph) executes multi-step workflows where tasks have dependencies on each other. A DAG is a way of expressing: "do step A and step B in parallel, then when both are done, do step C, and if C succeeds, do D and E in parallel." The engine reads these workflow definitions from YAML files, resolves the order of execution, runs independent steps simultaneously, and cancels downstream steps if an upstream step fails.

## Why It Matters
Real work is not always sequential. Building a feature requires designing (architect), implementing (coder), testing (tester), and reviewing (reviewer) — but the tester and reviewer can sometimes work on different parts in parallel. Without the DAG engine, everything runs one step at a time, which is slower and cannot express conditional logic (run this step only if the previous one succeeded). The DAG engine makes the ecosystem genuinely capable of handling complex multi-stage projects efficiently.

## How It Works
A pipeline is defined as a YAML file with a list of steps. Each step has a name, an agent type, an instruction, and optionally a `depends_on` list of step names and a `gate` flag (whether to pause for human approval before running that step). The engine parses this definition, builds an internal dependency graph, and starts executing.

Steps with no dependencies start immediately. As steps complete, the engine checks which dependent steps now have all their prerequisites satisfied and starts those. Independent branches run simultaneously using a thread pool (default: up to 8 parallel steps). If any step fails, all downstream steps that depend on it are marked as cancelled rather than attempted.

The Planner uses the DAG Engine as its execution backend: when the Planner produces a JSON plan, that plan is handed to the DAG Engine's executor, which runs it exactly as described. You can also write pipeline YAML files manually and submit them directly to the Orchestrator — this is useful for repeatable workflows like "weekly data pull process report notify."

## Current Status
 Built — YAML/JSON pipeline definitions, parallel execution with thread pool, dependency resolution, failure cancellation, and integration with the Planner output are all live.

## Key Files
- `orchestrator/dag/` — DAG engine module
- `orchestrator/dag/executor.py` — Execution engine, thread pool, dependency resolution

## Open Questions / Known Gaps
- There is no visual DAG editor in the dashboard yet. Pipelines must currently be written as YAML by hand.
- Failure context from a failed step does not yet feed back to the Planner for replanning — it simply cancels downstream steps.

## Related
- Components/Planner — produces the DAG plan that the Engine executes
- Components/Orchestrator — submits individual steps to the agent queue
- Components/Security/Approval Gates — the `gate: true` field in a step triggers an approval pause
