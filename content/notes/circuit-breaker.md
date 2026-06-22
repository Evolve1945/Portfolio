## What It Is
The Circuit Breaker is a failure protection mechanism built into the Orchestrator. When a specific agent fails 5 times in a row, the Circuit Breaker "trips" — it temporarily suspends all task dispatch to that agent, preventing the system from repeatedly hammering a broken service. After a recovery period (default: 60 seconds), it allows one test request through. If that succeeds, the circuit "closes" and the agent returns to normal operation. If not, the wait doubles and the process repeats.

## Why It Matters
Without a circuit breaker, a broken agent would cause an avalanche: every task routed to it would fail, each failure would trigger a retry, each retry would fail again, and the entire system would be consumed handling failures from a single broken component. This is called a cascading failure, and it is one of the most common ways distributed systems collapse. The Circuit Breaker contains the damage to the failed component, keeps the rest of the system running, and recovers gracefully once the problem is fixed.

## How It Works
The Circuit Breaker has three states — Closed (normal), Open (suspended), and Half-Open (testing). In the Closed state, tasks flow normally. Each failure increments a counter. When the failure count reaches the threshold (5), the breaker opens. In the Open state, any dispatch attempt immediately fails with a "circuit open" error — no call is made to the agent. After the recovery interval, the state transitions to Half-Open.

In the Half-Open state, exactly one task is allowed through. A concurrent lock prevents multiple test requests from sneaking in simultaneously (this is a known race condition that has been explicitly fixed in the codebase). If the test task succeeds, the breaker closes and the counter resets. If it fails, the breaker reopens and the recovery interval doubles (exponential backoff: 60s 120s 240s ...).

Each circuit breaker is attached to a specific agent type. The researcher agent's circuit breaker trips independently of the coder agent's. An event is emitted to the dashboard and RAG memory every time a breaker opens or closes, so the history of failures is fully observable.

## Current Status
 Built — Three-state machine, threshold-based tripping, exponential backoff recovery, Half-Open race condition fix, and dashboard event emission are all live.

## Key Files
- `orchestrator/orchestrator.py` — `CircuitBreaker` class embedded in the main orchestrator module

## Open Questions / Known Gaps
- The failure threshold (5) and recovery interval (60s) are currently hardcoded; these should be configurable via environment variables.

## Related
- Components/Orchestrator — uses the Circuit Breaker for every agent dispatch
- Components/Agent Mesh — the agents being protected against cascading failures
- [Components/Watchdog](/notes/watchdog) — complements the Circuit Breaker by restarting crashed processes
