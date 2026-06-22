---
tags: [error, reliability]
created: 2026-04-29
updated: 2026-04-29
status: resolved
---

**Discovered**: 2026-04-29
**Resolved**: 2026-04-29
**File fixed**: `orchestrator/orchestrator.py` — `CircuitBreaker.is_open()`

---

## What Broke

When the circuit breaker entered HALF_OPEN state (attempting recovery after a failure period), multiple worker threads could simultaneously pass the open check and all attempt recovery at once. This defeated the purpose of HALF_OPEN, which is to let exactly one request through to test whether the downstream service has recovered.

In plain terms: instead of one cautious test request, the system would send a burst of requests simultaneously — potentially overloading an already struggling service.

---

## Root Cause

The `is_open()` method checked the circuit state and transitioned to HALF_OPEN without holding a lock across both the check and the state transition. Between the check and the transition, other threads could read the same OPEN state and also decide to transition — leading to multiple threads believing they are the sole recovery probe.

This is a classic "check-then-act" race condition in concurrent programming.

---

## Fix Applied

The HALF_OPEN transition was wrapped in a threading lock held across both the state check and the state change. Once the first thread transitions the circuit to HALF_OPEN, subsequent threads see HALF_OPEN and return `True` (circuit is open, block the request). Only the first thread gets through as the recovery probe.

---

## Impact

Before the fix, a brief service failure could cause a thundering-herd effect during recovery: many threads piling in simultaneously when the circuit first tried to recover. This made recovery harder, not easier.

After the fix, exactly one request acts as the probe. If it succeeds, the circuit closes and normal traffic resumes. If it fails, the circuit re-opens and the recovery timer resets.

---

## Related Nodes

- Orchestration — circuit breaker lives in the orchestrator
- Reliability Patterns — circuit breaker pattern documentation
