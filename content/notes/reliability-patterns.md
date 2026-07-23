> Battle-tested patterns from distributed systems engineering — applied to the Claude Ecosystem to make it **self-healing, fault-tolerant, and production-grade**.

---

## 1. Circuit Breaker

Prevents cascading failures when an agent or external service is degraded.

```python
class CircuitBreaker:
 """
 States: CLOSED (normal) OPEN (failing) HALF-OPEN (testing recovery)
 """
 def __init__(self, name, failure_threshold=5, recovery_timeout=60):
 self.name = name
 self.state = "CLOSED"
 self.failures = 0
 self.failure_threshold = failure_threshold
 self.recovery_timeout = recovery_timeout
 self.last_failure_time = None

 def call(self, fn, *args, **kwargs):
 if self.state == "OPEN":
 if time.time() - self.last_failure_time > self.recovery_timeout:
 self.state = "HALF-OPEN"
 else:
 raise CircuitOpenError(f"{self.name} circuit is OPEN")

 try:
 result = fn(*args, **kwargs)
 self._on_success()
 return result
 except Exception as e:
 self._on_failure()
 raise

 def _on_failure(self):
 self.failures += 1
 self.last_failure_time = time.time()
 if self.failures >= self.failure_threshold:
 self.state = "OPEN"
 log.error(f"Circuit {self.name} OPENED after {self.failures} failures")

 def _on_success(self):
 self.failures = 0
 self.state = "CLOSED"
```

---

## 2. Exponential Backoff Retry

```python
def retry_with_backoff(fn, max_retries=3, base_delay=1.0, max_delay=30.0):
 for attempt in range(max_retries):
 try:
 return fn()
 except RetryableError as e:
 if attempt == max_retries - 1:
 raise
 delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
 log.warning(f"Attempt {attempt+1} failed: {e}. Retrying in {delay:.1f}s")
 time.sleep(delay)
```

---

## 3. Dead Letter Queue

Failed tasks that exhaust retries go to the DLQ for human review:

```json
// logs/dlq.jsonl
{
 "task_id": "uuid",
 "pipeline": "code-review",
 "stage": "Deploy",
 "agent": "devops-01",
 "attempts": 3,
 "last_error": "CMake build failed: missing dependency",
 "payload": { ... },
 "queued_at": "2026-04-26T14:32:00Z",
 "status": "awaiting_human_review"
}
```

DLQ items shown prominently in [Dashboard](/notes/dashboard) with one-click retry or dismiss.

---

## 4. Bulkhead Pattern

Isolate agent types so one overloaded agent type can't block others:

```python
BULKHEADS = {
 "vision": ThreadPoolExecutor(max_workers=1), # screen is single resource
 "coder": ThreadPoolExecutor(max_workers=3),
 "researcher": ThreadPoolExecutor(max_workers=5), # stateless, highly parallel
 "security": ThreadPoolExecutor(max_workers=2),
}
```

---

## 5. Timeout Enforcement

Every agent call has a hard timeout:

```python
AGENT_TIMEOUTS = {
 "orchestrator": 120, # 2 min max for planning
 "coder": 300, # 5 min max for coding task
 "researcher": 60, # 1 min max for research
 "security": 180, # 3 min max for scan
 "devops": 600, # 10 min max for deploy
 "vision": 90, # 1.5 min max for screen task
}
```

On timeout: cancel task log retry or DLQ.

---

## 6. Rollback Procedure

When a stage with `gate: rollback` fails:

```python
def rollback_stage(stage: Stage, context: PipelineContext):
 log.warning(f"Rolling back stage: {stage.name}")

 # 1. Run stage-specific undo actions
 if stage.rollback_tasks:
 for task in reversed(stage.rollback_tasks):
 run_task(task, context)

 # 2. Restore files from pre-stage snapshot
 restore_snapshot(context.snapshot_id)

 # 3. Write incident note to Obsidian
 write_incident_note(stage, context)

 # 4. Notify user
 notify(f"Pipeline rolled back at stage: {stage.name}")
```

---

## 7. Health Check Endpoints

```python
@app.get("/health")
def health():
 return {
 "status": "ok",
 "agents": {id: a.status for id, a in agent_pool.items()},
 "circuits": {name: cb.state for name, cb in circuit_breakers.items()},
 "queue_depth": task_queue.size(),
 "dlq_depth": dlq.size(),
 "uptime_seconds": uptime()
 }
```

---

## 8. Graceful Degradation

If a non-critical capability fails, continue with reduced functionality:

```python
DEGRADATION_MAP = {
 "web_search": "use cached results from Obsidian vault",
 "chromadb": "fall back to full-text search",
 "vision": "skip UI tasks, flag for manual review",
 "bash": "skip execution tasks, generate code only",
}
```

---

## Related Nodes

- [Pipeline Manager](/notes/pipeline-manager) — gates and rollback configured per stage
- Agent Pool — circuit breakers per agent type
- [Observability](/notes/observability) — all reliability events logged and alerted
- [Dashboard](/notes/dashboard) — DLQ and circuit states visible in real time

### auto-trigger: vault_audit
- **Time:** 2026-06-10 23:57:28
- **Agent:** `vault-security` `claude-sonnet-4-6`
- **Status:** completed
- **Tokens:** 5,220 **Cost:** $0.05166
- **Output:** <thinking> The user wants me to perform a scheduled vault security audit on VAULT/Knowledge/ and write findings to VAULT/Audits/. Let me use the available tools to: 1. First, read the vault map to understand naming conventions and rules 2. Scan VAULT/Knowledge/ for files 3. Check each file for co …
