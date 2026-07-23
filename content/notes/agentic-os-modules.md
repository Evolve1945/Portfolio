> Component index for **all 40 Agentic-OS recommendations** (sections A–H), built in the
> 2026-07-05/06 session. Every module is self-contained, unit-tested, and **ships DARK
> behind an env flag** by default. The **wiring pass has started** — a few modules are now
> connected to live flow (see below); the rest remain dark pending Agentic OS — Wiring Plan.
>
> Full feature lists per rec: Agentic OS — 40 Recommendations.
> Paths are under `Ecosystem/orchestrator/` unless noted. **1104 tests green.**

## Wiring status (started 2026-07-06)
Wired to live flow so far (flag-gated, suite green):
- **#32 tracing** instrumented into `tool_loop.py` (span tree agentmodeltool; no-op when off).
- **Read-only observability API** on the orchestrator: `/traces[/{id}]`, `/routines`, `/approvals`,
 `/policy/{agent}`, `/plugins`, `/slo`, `/facts`, `/threads`, `/user-model/review`,
 `/prompts/{agent}/versions` — 200 when live, clean 503 when the module is gated off.
- **#28 policy engine** advisory consult inside `contracts/enforcer.py` (only when
 `POLICY_ENGINE_ENABLED`; contract stays the primary gate; fails open on infra error).
- **#7 capability syscalls** `SYSCALL_ENFORCE_ENABLED` gate in `tool_loop.py`: file/net/exec
 tools are capability-checked + audited via `syscalls.authorize()` before the handler runs;
 inert by default, fails open on error.
- **#15 knowledge graph** `KGRAPH_EXTRACT_ENABLED`: each completed task feeds agent/model/
 project edges into the embedded graph from the worker; best-effort, never breaks execution.
- **#4 event-bus subscribers** `BUS_SUBSCRIBERS_ENABLED`: `subscribers.py` `BusConsumer`
 framework + an orchestrator-started audit-log consumer; read-only, off by default.

**Wiring pass 2026-07-17 (Pass A observability + Pass B governance, suite 1339):**
- **Pass A — dashboard governance views (read-only).** `dashboard/main.py` proxies the
 read-only API (`/api/gov/{traces,approvals,policy,facts,routines,user-model}`, 503"off"
 passthrough); a new **Governance** section in `dashboard/v2.html` surfaces them with
 fail-open empty-states. `subscribers.py` gains a **dashboard-forwarder** consumer
 (bus dashboard `/api/events`) in `default_consumers()`.
- **#31 PII pipeline** `PII_PIPELINE_ENABLED`: `router/router.py` redacts the payload before
 a CLOUD adapter (`is_local=False`) and restores the response; local tier skipped; fail-open;
 audit counts only.
- **#29 approvals-v2** `APPROVALS_V2_ENABLED`: tool-loop loop-halts submit as MEDIUM (surface
 + auto-reject on timeout); the orchestrator `_gate_monitor` now drives `sweep_timeouts()`.
- **v2 governance WRITE controls** key-gated orchestrator POSTs (`/approvals/{id}/resolve`,
 `/approvals/rule`, `/policy/reload`) + dashboard proxies + Approve/Reject/Reload-policy buttons.
- **#27 zero-trust identity handshake** `ZERO_TRUST_ENABLED`: the mesh mints an `X-Service-Token`
 on every `/run` dispatch; the agent server's `_zt_guard` verifies it (401 on a definitively-bad
 token, fail-open on any verify/infra error). Completes Tier 2.
- **#18 facts-first memory (Tier 3)** `FACTS_INJECT_ENABLED`: `agent_server._facts_context_block`
 prepends the highest-confidence KNOWN FACTS (`FactStore.facts_block`) to an agent's prompt.
 Read-only, fail-open — adds facts to context, never acts. (The routine-engine daemons were
 already registered in `_routine_loop`; they run when `ROUTINE_ENGINE_ENABLED`, propose-only.)
- **#18 facts-distill routine (Tier 3)** `FACTS_DISTILL_ENABLED`: `memory/distill_wiring.py`
 registers `make_distill_routine` on the RoutineEngine — recent completed tasks local-first
 extractor candidate facts at **0.4 confidence** (proposals, not assertions); disputes file a
 memory-agent review task. Fills the FactStore that `FACTS_INJECT_ENABLED` surfaces.
- **#19 user-model auto-curation (Tier 3)** `USER_MODEL_CURATE_ENABLED`: `memory/usermodel_wiring.py`
 registers a routine mining `agents/*/corrections.md` local-first extractor 
 `learn_from_corrections` writes CANDIDATE preferences (unapproved, 0.4) to the review queue.
 Approval-gated — proposes a profile change, never applies one. **Completes Tier 3.**
- **#22 browser tools — Playwright driver (Tier 4)** `BROWSER_DRIVER_ENABLED`: `tools/playwright_driver.py`
 `PlaywrightDriver` implements the browser_tools interface over headless Chromium; `build_browser_driver()`
 is lazy + fail-open (no install forced). The tool loop routes `browser_*` tools through it.
- **#24 CLI auto-wrapper (Tier 4)** `CLI_TOOLS_ENABLED`: the tool loop offers approved `cli_<name>`
 schemas to the model and routes their calls through `handle_cli_tool` — approval-gated, sandboxed, no-shell. Fail-open.

**Tier 4 COMPLETE (2026-07-20, suite 1411):**
- **#23 desktop computer-use** `DESKTOP_TOOLS_ENABLED`: new `tools/desktop_controller.py` `PyAutoGuiController`
 (screenshot/OCR/click/type/key/focused_app over PyAutoGUI + optional pytesseract/window title); lazy + fail-open.
 Tool loop injects `DESKTOP_TOOLS_SCHEMA` + routes `desktop_*` (HIGH risk, `DESKTOP_APP_ALLOWLIST` guard + audit). +12 tests.
- **#30 plugin auto-register** `PLUGIN_AUTOREGISTER_ENABLED`: new `plugins/auto_register.py` — the `/plugins/scan`
 path quarantines newly-discovered repos into the supply-chain registry (approved/rejected untouched). +7 tests.
- **Capability-token syscall enforcement** `CAPABILITY_ENFORCE_ENABLED` (needs `ZERO_TRUST_ENABLED`): `syscalls.Syscalls`
 carries a per-task `cap_token`; `authorize()`/`_guard()` verify `identity.verify_capability_token` (signed/task-bound/
 30-min TTL/revocable) after the static contract check; `tool_loop._mint_cap_token()` mints per task. +11 tests.
 **All 4 Tier-4 tools wired (browser #22 · CLI #24 · desktop #23 · plugin #30) + capability tokens.**
- **Notifier BusConsumer** (suite 1416) `subscribers.notifier_consumer()`: pushes high-signal bus events
 (level ≥ warn, or always-alert events) to Discord/Telegram, reusing the gate's channel config; in
 `default_consumers()`; self-noops when unconfigured; fail-open. Behind `BUS_SUBSCRIBERS_ENABLED`.
- **v2 governance write-controls** (suite 1423) `POST /approvals/resolve-batch`, `DELETE /approvals/rule`,
 `POST /policy/dry-run` (backing `approvals_v2.resolve_batch`/`remove_rule` + `policy_engine.dry_run_diff`),
 key-gated + `/api/gov/*` proxies + v2 UI (batch approve/reject, per-rule remove, policy dry-run diff panel).
- **RAG BusConsumer** (suite 1428) `subscribers.rag_consumer()`: indexes high-signal bus events into RAG (sync
 `rag.RAGClient`) for operational-history retrieval. Built + tested but **NOT in `default_consumers()`** — RAG
 event-ingest already runs via `dashboard_forwarder` `/api/events` `RAGPipeline.ingest_event`; this is the
 headless (no-dashboard) alternative (wire it *instead of* the forwarder, not alongside — no double-indexing).
 **AGENTIC_OS_WIRING_PLAN 100% COMPLETE.** Every rec built + wired (dark, fail-open); remaining is the broader
 80 propositions + flip-live flag decisions, not "wiring".

Everything else in the tables below is still dark. Remaining tiers are in Agentic OS — Wiring Plan.

## A. Agentic kernel
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #1 | `tools/registry.py` | contract-driven universal tool loop for all agents | (contract) |
| #2 | `intents.py` | typed intent classifier deterministic routing | `INTENT_ROUTING_ENABLED` |
| #3 | `mesh/supervisor.py` | agent process table + one-for-one restarts (`/mesh/*`) | `SUPERVISOR_ENABLED` |
| #4 | `bus.py` | SQLite pub/sub event bus, consumer offsets (`/bus/*`) | `EVENT_BUS_ENABLED` |
| #5 | `durable_queue.py` | persistent queue, leases, visibility timeout | `DURABLE_QUEUE_ENABLED` |
| #6 | `mesh/a2a.py` | A2A agent cards + discovery (`/card`, `/mesh/cards`) | — |
| #7 | `syscalls.py` | capability-checked side-effect facade + audit | (contract) |
| #8 | `threads.py` | resumable work sessions, token-budgeted context | — |

## B. Autonomy & goals
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #9 | `goals.py` | goal registry, task-linkage progress, standing goals (`/goals`) | — |
| #10 | `brain/autonomy.py` | autonomy dial 0–3 + kill switch + budget slice (`/autonomy`) | `AUTONOMY_LEVEL` |
| #11 | `research/web_search.py` | TavilyBravekeyless-DDG chain + source ledger | `RESEARCH_WEB_ENABLED` |
| #12 | `routines.py` | idle-time routine engine + effectiveness tracking | `ROUTINE_ENGINE_ENABLED` |
| #13 | `postmortem.py` | failure clustering RCA note fix-task | (routine) |
| #14 | `simulate.py` | dry-run: cost + blast radius preview (`/task/simulate`) | — |

## C. Memory & knowledge
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #15 | `memory/kgraph.py` | embedded knowledge graph, timestamped edges (`/graph/*`) | — |
| #16 | `dashboard` `/api/rag/chat` | vault chat v2: hard refusal + grounding score | — |
| #17 | `memory/consolidate.py` | vault consolidation PROPOSE-ONLY reports | (routine) |
| #18 | `memory/facts.py` | episodic/semantic split, distillation, facts-first | (routine) |
| #19 | `memory/user_model.py` | approved-preference profile agent prompts | `USER_MODEL_ENABLED` |
| #20 | `memory/writeback.py` | AI output vault note w/ backlinks (`/vault/save`) | — |

## D. Tooling & environment
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #21 | `syscalls.proc_exec` | all code exec via sandbox; raw host exec refused | `SANDBOX_FALLBACK_ENABLED` |
| #22 | `tools/browser_tools.py` | risk-classed browser actions, site allowlist | (contract) |
| #23 | `tools/desktop_tools.py` | computer-use tools, HIGH risk, app allowlist | `DESKTOP_TOOLS_ENABLED` |
| #24 | `tools/cli_registry.py` | CLI discovery + curation queue + sandboxed exec | (approval) |
| #25 | `workspace.py` | per-task workspaces, artifact store, snapshot/rollback | — |
| #26 | `router/adapters.LocalAdapter` | local $0 tier in routing ladder | `LOCAL_TIER_ENABLED` |

## E. Security & governance
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #27 | `mesh/identity.py` | HMAC service + capability tokens, revocation | `ZERO_TRUST_ENABLED` |
| #28 | `policy_engine.py` + `config/policy.yaml` | one declarative policy, dry-run diff | `POLICY_ENGINE_ENABLED` |
| #29 | `approvals_v2.py` | risk scoring, batch, timeouts, standing rules | `APPROVALS_V2_ENABLED` |
| #30 | `plugins/supply_chain.py` | quarantine-by-default, scan, hash pinning | — |
| #31 | `security/pii_pipeline.py` | reversible anonymizecloudrestore, audit | `PII_PIPELINE_ENABLED` |

## F. Observability & self-improvement
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #32 | `tracing.py` | span-tree per task, rollups, slowest/costliest | `TRACING_ENABLED` |
| #33 | `router/policy.py` | cost-aware small-first routing (session 1) | `ROUTER_POLICY_ENABLED` |
| #34 | `evaluator/harness.py` | gold-set regression evals + canary + alarms | `EVAL_HARNESS_ENABLED` |
| #35 | `prompts/registry.py` | versioned prompts, eval-gated promotion, rollback | `PROMPT_REGISTRY_ENABLED` |
| #36 | `slo.py` | SLOs, error budgets, burn-rate alerts, status page | `SLO_ENABLED` |

## G. Interfaces
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #37 | `voice/conversation.py` | conversational voice loop, barge-in, mid-call tools | `VOICE_V2_ENABLED` |
| #38 | `remote.py` | PWA manifest+SW gen, tailnet enforcement, access log | `REMOTE_ACCESS_ENABLED` |
| #39 | `omnibox.py` | one NL entry intent route (task/answer/goal) | `OMNIBOX_ENABLED` |

## H. Platform
| Rec | Module | What it does | Flag |
|---|---|---|---|
| #40 | `ops/backup.py`, `ops/doctor.py`, `ops/boot.py`, `ops/cli.py` + `docker-compose.yml` + `deploy/*` | integrity-checked state backup/restore, env doctor, health-checked boot DAG, ops CLI, container + Windows launchers | — (scripts) |

**ALL 40 built — 1068 tests green.** Next: the deferred Agentic OS — Wiring Plan.

## Repo safety (added with H)
- Pre-commit **secret scanner** active (`.githooks/` + `core.hooksPath`) — blocks committing keys so the repo can go public.
- `docs/PUBLIC_RELEASE_CHECKLIST.md` — pre-publish steps.
- **`Clones/code-sandbox` is PRIVATE-only** (arbitrary code exec) — own `PRIVATE.md`/`.gitignore`; excluded from any public Clones repo.

## New API surface (orchestrator :8765)
`/autonomy` · `/bus/{poll,peek,stats}` · `/intent/classify` · `/goals` · `/task/simulate` ·
`/mesh/{processes,cards}` + lifecycle · `/graph/*` · `/vault/save`. Dashboard proxy exists
for `/api/autonomy`; the rest await the wiring pass.

## Related
- Agentic OS — 40 Recommendations — full feature lists + priorities
- Agentic OS — Wiring Plan — how these dark modules go live (deferred)
- Future Vision

## Skill System (added 2026-07-12, suite 1151 green)

| Module | File | Flag | Status |
|---|---|---|---|
| Skill library (500) | `skills/<cat>/<name>/SKILL.md` (29 categories) | — | built, lint-gated |
| Skill registry | `orchestrator/skills/registry.py` | — (passive) | built |
| Skill forge | `orchestrator/skills/forge.py` | `SKILL_FORGE_ENABLED` | dark |
| Skill hunter | `orchestrator/skills/hunter.py` | `SKILL_HUNT_ENABLED` | dark |
| Skill injector | `orchestrator/skills/injector.py` | `SKILLS_INJECT_ENABLED` | dark |
| Wiring glue | `orchestrator/skills/wiring.py` (routines + git + mirror) | forge/hunt flags | dark |
| Mirror | `scripts/sync_skills.py` `~/.claude/skills` (top-50 + index meta-skill) | — | built |
| Lint gate | `scripts/skill_lint.py` (`--all`, `--dedup`) | — | built |

Details: [Skill System](/notes/skill-system-library-forge-injection) · roadmap: 100 Propositions

## Skill Forge llm_fn + TikTok-inbox features (added 2026-07-13, suite 1184 green)

| Module | File | Flag | Status |
|---|---|---|---|
| Forge llm_fn (localsonnet) | `orchestrator/skills/llm.py` | inherits forge flags | built |
| GitHub trending hunter feed | `orchestrator/skills/trending.py` | `SKILL_TRENDING_INTERVAL_S` | dark (needs hunt on) |
| Grep-first $0 RAG tier | `rag/grep_search.py` | `RAG_GREP_FIRST_ENABLED` | dark |
| Token-efficient browser reads | `tools/browser_tools.py` `browser_read_refs` | — (contract browser grant) | built |
| Concise output mode | `agents/prompts.py` `AGENT_CONCISE_MODE` | `AGENT_CONCISE_MODE` | dark |
| +4 skills (504 total) | session-handoff, codex-adversarial-review, notebooklm-bridge, content-cascade | — | built, lint-clean |

Skills library now **504**. 25 external repos cloned to `Projects/Repos/` + quarantined in
PluginRegistry. Details: TikTok Inbox — Features & Repos.

## Safety / Cost Floor (added 2026-07-13, suite 1222 green)

100_PROPOSITIONS sequencing #1. All dark + fail-open; verified inert when off.

| Module | File | Flag | Status |
|---|---|---|---|
| P12 per-agent daily spend ceiling | `orchestrator/router/ceiling.py` | `SPEND_CEILING_ENABLED` | **LIVE 2026-07-17** (flip-live #1) |
| P13 loop detector | `orchestrator/tool_loop.py` `LoopDetector` | `LOOP_DETECT_ENABLED` | **LIVE 2026-07-17** (flip-live #1) |
| P41 layered permissions | `orchestrator/permissions.py` | `LAYERED_PERMISSIONS_ENABLED` | dark |
| P42 two-stage classifier gate | `orchestrator/classifier_gate.py` | `CLASSIFIER_GATE_ENABLED` | dark |

Details: [Safety Floor](/notes/safety-cost-floor) · roadmap: 100 Propositions (sequencing #1 DONE)

## Durable Execution + Eval Ratchet (added 2026-07-13, suite 1246 green)

100_PROPOSITIONS sequencing #2/#3. All dark + fail-open; verified inert when off.

| Module | File | Flag | Status |
|---|---|---|---|
| P01/P02/P81 durable DAG (checkpoint/resume/replay/interrupt) | `orchestrator/dag/checkpoint.py` | `DAG_CHECKPOINT_ENABLED` | dark |
| P31 progressive skill loading (index + asset loader) | `orchestrator/skills/injector.py` | `SKILL_PROGRESSIVE_ENABLED` | dark |
| P32/P52 eval-gated promotion (held-out + unified gate_fn) | `orchestrator/evaluator/promotion_gate.py` | `EVAL_PROMOTION_GATE_ENABLED` | dark |

Details: [Durable Execution](/notes/durable-execution-eval-ratchet) · roadmap: 100 Propositions (sequencing #2/#3 DONE)

## Cost + Memory Block (added 2026-07-13, suite 1270 green)

100_PROPOSITIONS sequencing #4/#6. The P## modules are dark + fail-open; the Karpathy rules
are **live** (constitution change, no flag).

| Module | File | Flag | Status |
|---|---|---|---|
| P11 architect/editor model split | `orchestrator/router/architect_editor.py` | `ARCHITECT_EDITOR_ENABLED` | dark |
| P21 three-tier memory (core/recall/archival) | `orchestrator/memory/tiers.py` | `MEMORY_TIERS_ENABLED` | dark |
| P22 ADD/UPDATE/DELETE/NOOP fact consolidation | `orchestrator/memory/fact_consolidation.py` | `FACT_CONSOLIDATION_ENABLED` | dark |
| Karpathy coding rules (SIMPLICITY/SURGICAL/GOAL-DRIVEN) | `orchestrator/agents/rules.py` | — (live) | **applied** |

Details: [Cost + Memory Block](/notes/cost-memory-block) · roadmap: 100 Propositions (sequencing #4/#6 DONE)

## Interop + Quality (added 2026-07-16, suite 1299 green)

100_PROPOSITIONS sequencing #7. Both dark + fail-open; verified inert when off.

| Module | File | Flag | Status |
|---|---|---|---|
| P51 trace-level grading (score a trace's intermediate steps) | `orchestrator/evaluator/trace_grader.py` | `TRACE_GRADING_ENABLED` | dark |
| P71 open SKILL.md standard gate (keep forge output portable) | `orchestrator/skills/standard.py` | `SKILL_STANDARD_GATE_ENABLED` | dark |

Details: [Interop + Quality](/notes/interop-quality) · roadmap: 100 Propositions (sequencing #7 DONE)

## Surface — Agent Command Center (added 2026-07-16, suite 1309 green)

100_PROPOSITIONS sequencing #5 (started). Dark + fail-open; inert board when off.

| Module | File | Flag | Status |
|---|---|---|---|
| P61 Agent Command Center (fleet kanban: runs by status + cost + approval + cancel) | `orchestrator/fleet.py` + dashboard `/api/fleet` + Fleet view | `FLEET_VIEW_ENABLED` | **LIVE 2026-07-17** (flip-live #1) |
| P62 goal-loop surface (capabilities picked per step, no modes) | `orchestrator/goal_surface.py` | `GOAL_SURFACE_ENABLED` | dark |
| P91 dashboard v2 (six plain-language sections at `/v2`) | `dashboard/v2.html` + `/v2` route | `DASHBOARD_V2_DEFAULT` (flips `/`) | dark |

**The 100_PROPOSITIONS top-20 list is COMPLETE (2026-07-17).**
Details: [Agent Command Center](/notes/agent-command-center-fleet-view) · [Goal Surface](/notes/goal-surface-one-goal-loop) · [Dashboard V2](/notes/dashboard-v2) · roadmap: 100 Propositions (sequencing #5 DONE)
