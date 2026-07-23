---
tags: [reliability, monitoring, built]
created: 2026-05-15
updated: 2026-05-15
status: built
---

> Automatically classifies errors in service log files and writes structured diagnostic reports into the Obsidian vault. Called by the Watchdog on every service crash.

---

## What It Does

When a service crashes, the Watchdog calls the Self-Diagnose Engine before attempting a restart. The engine:

1. Reads the crashed service's log file (`logs/{service}.log`)
2. Scans each log line against a library of classification rules (regex patterns with category, severity, and fix hints)
3. Produces a `DiagnosticReport` — a structured summary of what went wrong, how severe it is, and what to try next
4. Writes the report into the Obsidian vault as an error note in internal notes
5. Returns the report to the Watchdog for inclusion in the Discord/Telegram alert

---

## Error Classification

Each classification rule maps a log pattern to:

| Field | Description |
|---|---|
| `pattern` | Regex matched against log lines |
| `category` | Human-readable error type (e.g. `"ImportError"`, `"ConnectionRefused"`, `"BudgetExceeded"`) |
| `severity` | `CRITICAL`, `ERROR`, or `WARNING` |
| `fix_hint` | One-sentence suggested fix shown in the alert and vault note |

Example classification rules (not exhaustive):

| Pattern | Category | Severity | Hint |
|---|---|---|---|
| `ModuleNotFoundError` | `ImportError` | CRITICAL | Run `pip install -r requirements.txt` |
| `ConnectionRefusedError.*8765` | `OrchestratorDown` | CRITICAL | Orchestrator not reachable — check port 8765 |
| `BudgetExceededError` | `BudgetCap` | WARNING | Daily cap hit — tasks will resume tomorrow |
| `PermissionError` | `FilePermission` | ERROR | Check write permissions on logs/ directory |
| `JSONDecodeError` | `ConfigCorrupt` | ERROR | Check schedules.yaml or .env for invalid syntax |

---

## DiagnosticReport Structure

```python
@dataclass
class DiagnosticReport:
 service: str # "orchestrator", "dashboard", "discord_bot"
 timestamp: str # ISO-8601
 log_file: str # path scanned
 findings: list[Finding] # matched rules
 severity: str # highest severity found
 summary: str # one-paragraph plain-English description
 fix_hints: list[str] # deduplicated list of suggested fixes
```

---

## Usage

### Called by Watchdog (automatic)
```python
from orchestrator.diagnostics.self_diagnose import diagnose_service
report = diagnose_service("orchestrator")
# report.summary included in Telegram/Discord crash alert
# report written to vault automatically
```

### CLI (manual scan)
```bash
python -m orchestrator.diagnostics.self_diagnose
# Scans all three services, writes vault notes for any findings
```

---

## Key File

`orchestrator/diagnostics/self_diagnose.py`

---

## Vault Output Format

Reports are appended to internal notes. Each diagnostic entry includes:
- Timestamp
- Severity badge
- Matched error categories
- All fix hints
- Raw log excerpt (first 20 matching lines)

---

## Limitations

- Pattern library covers common Python errors and ecosystem-specific conditions. Novel error types produce a generic "unknown error" finding with no hint.
- Relies on log file being readable at crash time — if the log is missing or empty, the report will indicate "no log data".
- Does not attempt any automatic remediation — it is diagnosis-only. The Watchdog decides whether to restart, and the human decides how to fix root causes.

---

## Related Nodes

- Self-Healing System — Watchdog that calls the engine on crash
- [Components/Core/Observability](/notes/observability) — log files that the engine reads
- errors/ — vault location where diagnostic reports are written
- [Integrations/Telegram](/notes/telegram-integration) — alert messages include the report summary
