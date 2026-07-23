> Built 2026-07-11/12 (Fable 5 final sessions). 500-skill library + autonomous evolution
> engine + runtime injection, all dark-flagged. Suite: **1151 tests green**.

## What it is

- **Library**: `Ecosystem/skills/<category>/<name>/SKILL.md` — 500 skills, 29 categories
 (see `skills/_TAXONOMY.md`). Format: `skills/_SPEC.md` — SKILL.md container (open
 Agent Skills standard, portable to Claude Code/Codex/Cursor/40+ clients) with a strict
 XML body (`<purpose> <when> <steps> <checks> <output> <failure_modes>`), ≤150 lines,
 Qwen-32B-safe. Grounding facts for authors: `skills/_CONTEXT_PACK.md`.
- **Registry** (`orchestrator/skills/registry.py`): FSSQLite index (skills_registry.db) —
 status lifecycle (draft/quarantined/active/deprecated), versions with eval-gated
 promote + rollback (prompt-registry #35 pattern), task-outcome scoring (uses/wins/fails),
 30-day stale detection.
- **Forge** (`forge.py`): evidence (postmortem clusters, slow/costly traces, weak eval
 scorecards, session-transcript mining — aggregates only, PII-safe) proposals (llm_fn
 injectable; honest heuristic templates at $0 without it) similarity gate ≥0.85 
 merge proposal light lint `skills/_drafts/` dial-gated activation.
- **Hunter** (`hunter.py`): weekly GitHub skill hunt. Quarantine + supply-chain static
 scan + REWRITE in own format (never verbatim import — prompt-injection defense).
 Raw text audited under `skills/_quarantine/`.
- **Injector** (`injector.py`): per-task `<skills>` block into agent system prompts —
 contract `skill_categories` filter relevance rank tier budget (local 1 skill/600
 tok; sonnet 2/1200; opus 3/2500). risk:high never auto-injects.
- **Mirror** (`scripts/sync_skills.py`): top-50 active skills `~/.claude/skills` +
 `eco-skills-index` meta-skill (searches the full library via `skills/_MANIFEST.md`)
 so Claude Code sessions reach all 500 without context bloat.
- **Lint** (`scripts/skill_lint.py`): frontmatter/XML/length/secrets/path-existence
 gate; 447500 files pass. `--dedup` mode for near-duplicate descriptions.

## Governance (decisions locked with Evo 2026-07-10, 24 answers)

Dark flags: `SKILL_FORGE_ENABLED`, `SKILL_HUNT_ENABLED`, `SKILLS_INJECT_ENABLED` (all 0
by default; full list in `.env.example`). Autonomy dial: 0 = forge read-only · ≥1 =
propose drafts · ≥2 = auto-activate low-risk; risky skills approvals_v2 queue. Forge
never edits app code — only `skills/`, its DB, `logs/skill_forge/`. Git auto-commit of
skills/ with the secret scanner active. Triggers: nightly routine + weekly hunt +
25-task counter + postmortem hook + manual (dashboard button / omnibox).

## Surfaces

- Dashboard: Skill Library panel (Skills view) + `/api/skills/registry*`,
 `/api/skills/forge/run`.
- Tests: `tests/test_skills_registry.py`, `test_sync_skills.py`, `test_skill_forge.py`,
 `test_skill_injector.py`, `test_skill_wiring.py` (+47 tests).

## To flip live (deferred to Evo)

1. `SKILLS_INJECT_ENABLED=1` (read-only benefit, lowest risk) watch task quality.
2. `SKILL_FORGE_ENABLED=1` at dial 1 (drafts only) review drafts a few days.
3. Dial 2 for low-risk auto-activation; `SKILL_HUNT_ENABLED=1` last.
4. ~~Wire a real `llm_fn`~~ DONE 2026-07-13: `skills/llm.py` (localsonnet chain,
 opus never in chain) auto-injected by `wiring.build_forge()/build_hunter()`.
 Needs ANTHROPIC_API_KEY or LOCAL_TIER_ENABLED at runtime; falls back to
 heuristic drafts otherwise. Live dry-run verified (flag gate, dial-0 kill
 switch, real evidence draft). Suite 1157 green.
 NOTE: constants.MODEL_SONNET still pins claude-sonnet-4-6 — consider bumping
 to claude-sonnet-5 (one constant, affects all agents; Charter-level change).

Related: [Agentic OS Modules](/notes/agentic-os-modules) · Roadmap: 100 Propositions
