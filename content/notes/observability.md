> **Full-stack visibility** into every task, agent, tool call, and token — structured logging, distributed tracing, and real-time metrics. Inspired by AWS CloudWatch + X-Ray.

---

## Three Pillars

### 1. Logs — Structured JSON (CloudWatch-style)

Every event emitted as structured JSON to a rotating log file:

```json
{
 "timestamp": "2026-04-26T14:32:00.123Z",
 "level": "INFO",
 "event": "tool_call",
 "trace_id": "trace-abc123",
 "span_id": "span-def456",
 "pipeline": "code-review",
 "stage": "Security Scan",
 "agent_id": "security-01",
 "task_id": "task-uuid",
 "tool": "bash",
 "args": {"command": "pip audit"},
 "duration_ms": 340,
 "tokens_in": 180,
 "tokens_out": 95,
 "status": "success"
}
```

Log levels: `DEBUG` | `INFO` | `WARN` | `ERROR` | `CRITICAL`

---

### 2. Traces — Distributed Tracing (X-Ray-style)

Every pipeline run gets a `trace_id`. Every stage/agent/tool call is a `span`:

```
trace: code-review-2026-04-26-14h32
│
├── span: Stage[Security Scan] 14:32:00 14:32:08 (8s)
│ ├── span: Agent[security-01] warmup 14:32:00 14:32:01 (1s)
│ ├── span: tool[bash] pip audit 14:32:01 14:32:03 (2s)
│ ├── span: tool[grep] find secrets 14:32:03 14:32:05 (2s)
│ └── span: tool[write] findings.json 14:32:05 14:32:08 (3s)
│
├── span: Stage[Code Analysis] 14:32:08 14:32:22 (14s)
│ └── ...
│
└── span: Stage[Deploy] 14:32:22 14:32:55 (33s)
 └── ...
```

Traces written to `logs/traces/trace-{id}.json` and visualised in [Dashboard](/notes/dashboard).

---

### 3. Metrics — Time-Series KPIs

```python
METRICS = {
 # Performance
 "pipeline_duration_ms": Histogram,
 "stage_duration_ms": Histogram,
 "tool_call_latency_ms": Histogram,

 # Quality
 "pipeline_success_rate": Gauge, # % pipelines completing without error
 "agent_error_rate": Gauge, # errors per agent per hour
 "retry_rate": Counter,

 # Cost
 "tokens_in_total": Counter,
 "tokens_out_total": Counter,
 "cost_usd_total": Counter,
 "cost_per_pipeline": Histogram,

 # Business
 "tasks_completed_per_hour": Gauge,
 "sla_breach_count": Counter,
 "time_saved_estimate_min": Counter, # vs manual baseline
}
```

---

## Log Storage

```
logs/
├── events/
│ ├── 2026-04-26.jsonl append-only structured log
│ └── 2026-04-25.jsonl
├── traces/
│ ├── trace-abc123.json
│ └── trace-def456.json
├── metrics/
│ └── metrics.json rolling 7-day metrics
└── errors/
 └── errors.jsonl error-only log for fast triage
```

---

## Alerting Rules

| Metric | Threshold | Action |
|---|---|---|
| Pipeline failure | Any | Desktop notification + Obsidian incident note |
| Agent error rate | >20% in 5 min | Mark agent unhealthy, page orchestrator |
| Token cost | >$0.50 in 1 hour | Warn user, activate aggressive compression |
| SLA breach | Task >2x expected time | Escalate to user |
| Disk space (logs) | >1GB | Auto-rotate, compress old logs |

---

## Query Interface (CloudWatch Insights-style)

```python
# Query logs programmatically
results = log_query(
 filter="level=ERROR AND pipeline=code-review",
 time_range="last_24h",
 fields=["timestamp", "agent_id", "tool", "error_message"],
 limit=50
)
```

Also queryable from Claude via MCP tool `query_logs`.

---

## Related Nodes

- [Dashboard](/notes/dashboard) — metrics and traces visualised here
- Business Intelligence — cost and ROI derived from metrics
- Agent Pool — per-agent health metrics
- [Reliability Patterns](/notes/reliability-patterns) — alerts trigger reliability responses
