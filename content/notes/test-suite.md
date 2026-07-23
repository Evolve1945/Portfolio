> 283 automated tests covering the core orchestrator modules. Added as part of the comprehensive test coverage push (commit 1664176).

---

## What Is Tested

| Test file | Component | What it covers |
|---|---|---|
| `test_budget_guard.py` | `orchestrator/budget/guard.py` | Daily/monthly cap enforcement, per-task token limits, override endpoint |
| `test_contracts.py` | `orchestrator/contracts/` | Contract schema validation, enforcement decisions, allowlist checks |
| `test_dag_executor.py` | `orchestrator/dag/executor.py` | Step execution order, parallel execution, failure cancellation |
| `test_dag_loader.py` | `orchestrator/dag/loader.py` | YAML pipeline parsing, schema validation, cycle detection |
| `test_dag_models.py` | `orchestrator/dag/models.py` | PipelineDef and PipelineTaskDef model validation |
| `test_evaluator.py` | `orchestrator/evaluator/eval_agent.py` | Score parsing, threshold classification, error fallback behaviour |
| `test_router.py` | `orchestrator/router/` | Adapter priority, fallback chain, rate limit / 5xx triggers |
| `test_scheduler_parser.py` | `orchestrator/scheduler/parser.py` | Cron parsing, human-format parsing, edge cases |
| `test_security_sanitizer.py` | `orchestrator/security/sanitizer.py` | Injection pattern detection, base64 expansion, risk classification |
| `test_security_secrets.py` | `orchestrator/security/secrets.py` | Pattern matching for 15 credential types, redaction output |
| `test_security_trust.py` | `orchestrator/security/trust.py` | Trust level assignment, merge logic, downgrade enforcement |

---

## Coverage Summary

283 tests total. All 11 test modules pass as of the last verified run.

Key coverage areas:
- Budget guard: cap enforcement, record(), check_before_call()
- Agent contracts: schema validation, enforcement gate decision
- DAG: parallel execution, cycle detection, failure propagation
- Security: all injection patterns, all secret patterns, trust classification
- Router: fallback chain ordering, error type triggers

---

## Running the Tests

```bash
# All tests
pytest tests/

# Single module
pytest tests/test_security_trust.py -v

# With coverage report
pytest tests/ --cov=orchestrator --cov-report=term-missing
```

Requires `pytest` and `pytest-cov`:
```
pip install pytest pytest-cov
```

---

## Historical Context

The LIFO queue bug (Bug B1) would have been caught immediately by a `test_priority_queue.py` test. The circuit breaker race condition (Bug B2) would have been caught by a `test_circuit_breaker.py` test with concurrent threads. The test suite was added specifically to prevent this class of regression — see the Phase 7 audit recommendations (Task 114).

---

## Known Gaps

- `orchestrator/orchestrator.py` itself (the main engine) does not have integration tests — the plan to test the orchestrator end-to-end (queue + dispatch + circuit breaker together) is tracked in Task 114
- No tests for `watchdog.py` — the watchdog's restart logic requires process management that is difficult to unit-test
- No tests for the Telegram notifier or Discord webhook code

---

## Related Nodes

- [Components/Core/Orchestration](/notes/orchestration) — the primary component under test
- errors/B1-LIFO-queue-fix — bug that motivated adding tests
- errors/B2-circuit-breaker-race — bug that motivated adding tests
- [Review/Architecture Decision Records](/notes/architecture-decision-records) — Task 114 in Project Progress
