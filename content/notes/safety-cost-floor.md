> Built 2026-07-13. The four cheapest, highest-leverage guardrails from
> 100 Propositions (suggested-sequencing item #1) — they de-risk turning
> autonomy up and letting the forge auto-activate. All ship DARK behind env flags
> and **fail open** (any internal error allows the action; the existing contract /
> syscall gates stay primary). Verified inert when off. Suite: **1222 tests green**.

## Why these four first

Turning the autonomy dial up, or letting the [Skill Forge](/notes/skill-system-library-forge-injection) activate
skills on its own, is only safe if a runaway can't (a) spend unbounded money,
(b) loop forever, (c) escape its permissions, or (d) be talked into a dangerous
tool call. These four gates close exactly those holes, cheaply, before anything
more ambitious is enabled.

## The four gates

### P12 — Hard per-agent daily spend ceiling
`orchestrator/router/ceiling.py` · flag `SPEND_CEILING_ENABLED`

The existing [Budget Guard](/notes/budget-guard) `precall_guard` caps ONE task's projected cost. It
does not catch **accumulation** — the documented runaway incidents ($6.5k retry
loop, $47k two-agent ping-pong over 11 days) are many small calls, not one big
one. This tracks per-agent per-day spend in SQLite (`ceiling.db`) and hard-stops
at the ceiling, enforced at the router call site in `mesh/agent_server.py` OUTSIDE
agent logic. Breach raises `DailyCeilingExceeded` (a hard task failure). Default
$1.00/agent/day; per-agent override `SPEND_CEILING_<AGENT>_USD`.

### P13 — Loop detector
`orchestrator/tool_loop.py` (`LoopDetector`) · flag `LOOP_DETECT_ENABLED`

Identical `(tool, args)` repeated past a threshold (default 4) halts the branch,
returns a "LOOP DETECTED" result the model sees, and opens an approvals item. A
fresh detector is built per run so state never leaks across tasks. Catches the
runaway pattern the caps only catch late.

### P41 — Layered permission precedence
`orchestrator/permissions.py` · flag `LAYERED_PERMISSIONS_ENABLED`

One resolver composing every permission signal in a fixed, auditable order:
**hook > deny > ask > dial-mode > allow** (Claude Code's model). The upgrade over
a single autonomy-dial number: a per-agent **contract can hard-deny or hard-ask a
specific action the global dial would otherwise permit** — a veto the dial can't
override. Read-only actions are never dial-governed. Composes the existing
Agentic OS Modules deny/ask signals with the autonomy dial.

### P42 — Two-stage classifier gate
`orchestrator/classifier_gate.py` · flag `CLASSIFIER_GATE_ENABLED`

Claude Code "auto-mode" pattern: a cheap **local** allow/flag on each tool call;
only flagged calls escalate to a **Sonnet** judgment against ~10 hardcoded block
rules (secret exfiltration, security downgrade, trust-boundary crossing, review
bypass, unapproved financial ops, …). Both stages see **only the request + the
literal command** — never the agent's own reasoning or tool output — so an agent
can't rationalize past it and injected text in results can't steer it. Human
backstop after N consecutive / M total blocks. Reuses `skills/llm.py`'s
router chain (local first, Sonnet ceiling).

## Key files

- `orchestrator/router/ceiling.py` — SpendCeiling, DailyCeilingExceeded, get_ceiling()
- `orchestrator/tool_loop.py` — LoopDetector + `_classifier_gate` / `_loop` wiring
- `orchestrator/permissions.py` — `resolve()`, PermissionDecision
- `orchestrator/classifier_gate.py` — ClassifierGate, BLOCK_RULES, build_default_gate()
- `orchestrator/mesh/agent_server.py` — ceiling guard + record at the router call site
- Tests: `tests/test_spend_ceiling.py`, `test_loop_detector.py`, `test_permissions.py`,
 `test_classifier_gate.py` (+38 tests)

## Flags (all OFF by default — see `.env.example`)

`SPEND_CEILING_ENABLED` · `SPEND_CEILING_DAILY_USD` (1.00) · `LOOP_DETECT_ENABLED` ·
`LOOP_DETECT_THRESHOLD` (4) · `LAYERED_PERMISSIONS_ENABLED` · `CLASSIFIER_GATE_ENABLED`.

## Suggested flip order

SPEND_CEILING + LOOP_DETECT first (lowest-risk, no model cost) LAYERED_PERMISSIONS
(watch for over-asking at low dial) CLASSIFIER_GATE last (adds a local+Sonnet call
per tool use; needs ANTHROPIC_API_KEY or LOCAL_TIER_ENABLED, else fail-open allow).

## Related
- 100 Propositions — this is sequencing #1 · [Budget Guard](/notes/budget-guard) · [Tool Loop](/notes/tool-loop)
- [Agentic OS Modules](/notes/agentic-os-modules) · [Skill System](/notes/skill-system-library-forge-injection) (what these de-risk)
