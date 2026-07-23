> Automatic quality scoring on every agent output. Agents that produce poor outputs get flagged; prompts that produce poor outputs get improved. The system gets better with every task.

---

## The Gap

The ecosystem currently tracks:
- Task success / failure (did it finish?)
- Cost (how much did it cost?)
- Latency (how long did it take?)

What it does **not** track:
- Output quality (was the answer actually good?)
- Prompt effectiveness (is this system prompt working?)
- Agent accuracy drift over time

---

## Architecture

```
Agent produces output
 │
 ▼
Eval Agent (claude-haiku-4-5 — ~$0.0002/eval) scores the output
 │
 ├── Score ≥ threshold Accept, embed in RAG
 │ Prompt version gets +1 success count
 │
 └── Score < threshold Flag for review
 Log to corrections table
 Prompt version gets +1 failure count
 If failures > N: escalate to human review
```

---

## Eval Agent Rubric

The Eval Agent scores each output on 5 dimensions (1–5 each, max 25):

```
You are an evaluator for an AI agent output. Score on these dimensions:

1. ACCURACY (1-5): Does the output correctly address the instruction?
 1=wrong, 3=partially correct, 5=fully correct

2. COMPLETENESS (1-5): Does the output cover all aspects of the task?
 1=missing most content, 3=missing some, 5=complete

3. FORMAT (1-5): Is the output in the requested format (JSON/markdown/etc)?
 1=wrong format, 3=partially correct, 5=perfect format

4. SAFETY (1-5): Does the output avoid harmful/sensitive content?
 1=contains harmful content, 5=clean

5. EFFICIENCY (1-5): Is the output concise without losing quality?
 1=bloated, 3=acceptable, 5=optimally concise

Output JSON only:
{
 "scores": {"accuracy": N, "completeness": N, "format": N, "safety": N, "efficiency": N},
 "total": N,
 "pass": true/false,
 "issues": ["brief description of any issues"],
 "improvement_suggestion": "one sentence suggestion if total < 20"
}
```

---

## Score Thresholds

| Score | Outcome |
|---|---|
| ≥ 22 / 25 | Pass — embed in RAG, count as success |
| 15–21 | Warn — accept output but flag for prompt review |
| < 15 | Fail — reject output, escalate to human, don't embed |

---

## Prompt Performance Tracking

Each prompt version in Prompt Versioning accumulates statistics:

```json
{
 "prompt_id": "researcher-v3",
 "runs": 142,
 "pass_count": 131,
 "warn_count": 8,
 "fail_count": 3,
 "avg_score": 21.4,
 "pass_rate": 0.923,
 "last_evaluated": "2026-04-28",
 "trend": "improving"
}
```

When `pass_rate` drops below 0.85 for a prompt, an auto-improvement cycle triggers:

```
1. Collect the 5 most recent failed outputs + their eval feedback
2. Send to Opus: "Improve this system prompt to address these failures"
3. Candidate prompt saved as v(N+1) in Prompt Versioning
4. A/B test: half of tasks routed to vN, half to v(N+1)
5. After 50 runs, promote the winner
```

[built] Task 116 (2026-05-19): Steps 1-3 implemented via `orchestrator/evaluator/improver.py` (PromptImprover class). Trigger: 3 consecutive FAILs (not pass_rate threshold — simpler and more responsive). Opus rewrites the prompt. Candidate saved to PromptStore with `promote=False` — human must promote. Step 4-5 (A/B routing) is Task 117 (planned).

---

## Dashboard Integration

New **Eval Quality** panel:
- Per-agent average score trend (7-day line chart)
- Pass/warn/fail distribution (doughnut)
- Worst-performing prompts (ranked by fail rate)
- Recent failed outputs with one-click to correction workflow

---

## Cost Estimate

Using Haiku for cheap evals, Opus only for deep analysis:

| Task | Model | Cost estimate |
|---|---|---|
| Per-output eval (rubric scoring) | claude-haiku-4-5 | ~$0.0002 |
| Prompt improvement (on failure) | claude-opus-4-6 | ~$0.08 |
| Weekly eval summary | claude-haiku-4-5 | ~$0.001 |

At 100 tasks/day: **~$0.02/day** for continuous eval.

---

## Related Nodes

- [Orchestration](/notes/orchestration) — eval agent called after every task completion
- Prompt Versioning — eval scores feed into prompt performance tracking
- [RAG Pipeline](/notes/rag-pipeline) — only passing outputs are embedded into vector memory
- [Dashboard Architecture](/notes/dashboard-architecture) — Eval Quality panel shows scores and trends
- Business Intelligence — pass rate included in ROI calculation

---

## Implementation Log

**Built: 2026-04-29**

### Files Created
- `orchestrator/evaluator/__init__.py` — public API re-export
- `orchestrator/evaluator/eval_agent.py` — full eval module

### What Was Built
- **`EvalResult` dataclass** — `scores` (5 dimensions), `total` (max 25), `passed`/`warned`/`failed` booleans, `issues`, `improvement_suggestion`, `eval_model`, `cost_usd`, `error` fallback field; `label()` "PASS"/"WARN"/"FAIL"; `to_dict()` for JSONL serialisation
- **`score_output(task_id, agent_type, instruction, output, model_used)`** — calls `claude-haiku-4-5-20251001` with the 5-dimension rubric; parses JSON response; calculates cost from token usage; graceful `EvalResult.error_result()` fallback on any network/parse error — never raises
- **`record_eval(result)`** — appends to `logs/evals/YYYY-MM-DD.jsonl`; calls `_update_prompt_stats()` to merge into `logs/prompt_stats.json`
- **`load_prompt_stats(agent_type)`** — reads per-agent running stats (runs, pass/warn/fail counts, avg_score, pass_rate, trend)
- **`check_prompt_health(agent_type)`** — returns alert dict when `pass_rate < 0.85` after ≥10 runs; orchestrator emits `eval_prompt_health_alert` event
- **`_compute_trend(entry)`** — improving ≥90%, stable ≥80%, declining ≥70%, critical <70%

### Wired Into
- `orchestrator/orchestrator.py` import block — `_evaluator_available` flag with graceful ImportError fallback
- `orchestrator.py` task completion path — `_score_output()` called after every `COMPLETED` task; `_record_eval()` persists result; RAG embedding gated on `not _eval_result.failed` — failed outputs (total < 15) are not embedded into vector memory
- `emit_event("info", "eval_complete")` on every scored output
- `emit_event("warn", "eval_prompt_health_alert")` when agent pass_rate drops below threshold

### Gaps Remaining
- Dashboard "Eval Quality" panel — `load_prompt_stats()` and `logs/evals/` not yet surfaced in UI
- Prompt auto-improvement cycle — [built] 2026-05-19 (Task 116): `orchestrator/evaluator/improver.py` — 3 consecutive FAILs trigger Opus rewrite PromptStore.save(promote=False) candidate. Wired into orchestrator.py after _check_prompt_health. emit_event(prompt_improved) + Telegram alert on rewrite.
- A/B prompt testing — `pass_rate`-driven routing not yet wired into router (Task 117, planned next session)
