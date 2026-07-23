> Built 2026-07-13 (third block, after [Safety Floor](/notes/safety-cost-floor) and [Durable Execution](/notes/durable-execution-eval-ratchet)).
> 100 Propositions sequencing #4 (memory) and #6 (cost). The three P## modules
> are dark behind env flags, **fail open**, verified inert when off. Shipped in the
> same block: the **Karpathy coding-rules patch — APPLIED live** to the agent
> constitution (Evo approved). Suite: **1270 tests green**.

## Why these together

The safety floor made autonomy *safe*, durable execution made it *survivable*. This
block makes it *cheaper and better-remembered*: the architect/editor split roughly
halves code-task cost, and the two memory modules stop the fact store from silently
rotting (duplicates + stale contradictions) while formalising what actually loads
into context. The Karpathy rules ride along because they are the cheapest quality
lever of all — three sentences that reach every code-producing agent.

## Karpathy coding rules — APPLIED (live)
`orchestrator/agents/rules.py` · **no flag — this is a constitution change**

Three principles appended to the CODE RULES block of `UNIVERSAL_RULES`, so they reach
every code-producing agent through `get_prompt()`:

- **SIMPLICITY** — write the minimum code that solves the asked problem; no speculative
 features or single-use abstractions. If 200 lines could be 50, rewrite it.
- **SURGICAL CHANGES** — touch only what the task requires; don't "improve" adjacent
 code or reformat; remove only the orphans your change created (flag pre-existing dead
 code, don't delete it unasked).
- **GOAL-DRIVEN** — turn a task into a verifiable goal before coding ("fix the bug" 
 "write a test that reproduces it, then make it pass"); loop until the check passes.

Unlike the P## work this is **not dark** — it is live from commit `1f2d297`. The
revert reference (the exact before/after) lives in
`docs/proposals/karpathy-rules-patch.md` (status applied). See Karpathy Rules Patch.

## Architect/editor model split (P11)
`orchestrator/router/architect_editor.py` · flag `ARCHITECT_EDITOR_ENABLED`

aider's two-model pattern. For a non-trivial CODE task a **strong** model plans the
change in prose (the *architect*), then a **cheap** model turns that plan into the
actual edits (the *editor*) — the expensive model only emits a short plan, the verbose
editing runs on the local $0 tier.

- `should_split(agent_type, instruction)` gates it to code agents
 (`coder/tester/devops/architect`) on tasks the router's own `classify_complexity`
 does **not** call "simple" — a trivial edit isn't worth two round-trips.
- `maybe_split(...)` is the entry point: returns a `SplitResult` (output + plan +
 the two model names) when it splits, else `None` so the caller keeps its normal
 single-model path. Fail-open: an empty plan, empty edit, or any error `None`.
- `architect_model()` defaults to sonnet, `editor_model()` to qwen; both overridable
 (`ARCHITECT_MODEL` / `EDITOR_MODEL`). `default_run_model_fn()` wires it to the skill
 router; returns `None` when no models are configured. Complements the small-first
 router ([Multi-Model Router](/notes/multi-model-router)): the router picks one model per task, this splits
 one task across two.

## Three-tier memory (P21)
`orchestrator/memory/tiers.py` · flag `MEMORY_TIERS_ENABLED`

Letta/MemGPT tiering — stop treating all memory as one undifferentiated RAG pool.
`TieredMemory.context_block(query)` assembles up to three `<memory tier="...">` blocks
within a budget:

- **core** — a small always-loaded block of highest-confidence facts (wired to
 `FactStore.facts_block`); cheap, always present.
- **recall** — recent searchable session/thread turns, loaded within a char budget;
 the warm middle tier.
- **archival** — the vault / RAG. **Not inlined** — surfaced as a pointer that tells
 the agent to `rag_query` explicitly when core+recall don't suffice, keeping baseline
 context cost near zero.

Returns `""` when the flag is off (callers keep existing retrieval). Fail-open: a tier
that errors is skipped, never raised. Sources are injected so it's testable offline;
`build_default()` wires the real stores.

## Fact consolidation — ADD/UPDATE/DELETE/NOOP (P22)
`orchestrator/memory/fact_consolidation.py` · flag `FACT_CONSOLIDATION_ENABLED`

mem0's pattern. Before writing a new fact, retrieve the nearest existing facts and
**classify the operation** instead of blindly inserting:

- **ADD** genuinely new · **UPDATE** supersedes an existing fact (retire old, add new) ·
 **DELETE** an existing fact is now false (retire it) · **NOOP** already known (reinforce,
 don't duplicate).
- `heuristic_classify()` runs LLM-free (NOOP on exact match, UPDATE on same
 subject+predicate/different object at ≥ confidence, else ADD). An injected `llm_fn`
 handles the hard cases and falls back to the heuristic on any error.
- `consolidated_assert(store, ...)` is the write path: when the flag is off it delegates
 straight to `FactStore.assert_fact` (unchanged behaviour); when on it classifies then
 does the right op via `store.resolve(target_id, keep=False)` to retire superseded/false
 facts. Fail-open: any classifier error plain add (never lose a fact). Kills the two
 silent failure modes of naive fact stores — duplicate near-identical facts, and stale
 facts sitting next to their corrections. See [Memory Layer](/notes/memory-layer).

## Key files
- `orchestrator/agents/rules.py` — Karpathy principles in `UNIVERSAL_RULES` (live)
- `orchestrator/router/architect_editor.py` — should_split, maybe_split, SplitResult
- `orchestrator/memory/tiers.py` — TieredMemory, build_default
- `orchestrator/memory/fact_consolidation.py` — classify_operation, consolidated_assert
- Tests: `tests/test_architect_editor.py` (10), `tests/test_memory_tiers.py` (14 — P21+P22),
 rules tests (+24 net; suite 1270)
- `docs/proposals/karpathy-rules-patch.md` — applied-patch revert reference

## Flags (all OFF — see `.env.example`)
`ARCHITECT_EDITOR_ENABLED` · `MEMORY_TIERS_ENABLED` · `FACT_CONSOLIDATION_ENABLED`
(`ARCHITECT_MODEL` / `EDITOR_MODEL` tune P11.) Karpathy has **no flag** — it is live.

## Related
- 100 Propositions (sequencing #4/#6 DONE) · [Safety Floor](/notes/safety-cost-floor) · [Durable Execution](/notes/durable-execution-eval-ratchet)
- [Multi-Model Router](/notes/multi-model-router) · [Memory Layer](/notes/memory-layer) · Karpathy Rules Patch · [Agentic OS Modules](/notes/agentic-os-modules)
