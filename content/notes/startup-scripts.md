"C:\Windows\System32\llama.cpp\build\bin\Release\llama-server.exe" -m "D:\models\qwen3.6-27b-mtp\Qwen3.6-27B-Q3_K_S.gguf" -ngl 99 -c 8192 -fa on --parallel 1 --port 11435 --host 127.0.0.1 --cache-type-k q4_0 --cache-type-v q4_0 --spec-type draft-mtp --spec-draft-n-max 3

> PowerShell scripts for launching the ecosystem in development mode and installing it as a permanent Windows service.

---

## Local LLM — llama.cpp (Qwen3.6-27B)

> Start this in a dedicated terminal BEFORE the dashboard. The dashboard auto-detects it on port 11435.

### Start llama server (verified working 2026-05-20)

```
"C:\Windows\System32\llama.cpp\build\bin\Release\llama-server.exe" -m "D:\models\qwen3.6-27b-mtp\Qwen3.6-27B-Q3_K_S.gguf" -ngl 99 -c 8192 -fa on --parallel 1 --port 11435 --host 127.0.0.1 --cache-type-k q4_0 --cache-type-v q4_0 --spec-type draft-mtp --spec-draft-n-max 3
```

Wait for: `server is listening on http://127.0.0.1:11435` and `speculative decoding context initialized`

### Verify

```
curl http://localhost:11435/health
# expected: {"status":"ok"}
```

### Key flags (do not remove)

| Flag | Why it matters |
|---|---|
| `-fa on` | Flash attention — prevents O(n2) speed decay on long Qwen3 thinking chains |
| `--parallel 1` | Single slot — full 8192 context per request. Without this, n_parallel=4 caps generation at 2048 tokens (thinking fills the budget, answer is empty) |
| `--cache-type-k q4_0 --cache-type-v q4_0` | 4-bit KV cache — fits in VRAM (saves ~550 MB vs default) |
| `--spec-type draft-mtp --spec-draft-n-max 3` | MTP speculative decoding — 77 tok/s effective (vs 46 tok/s without), 75.8% draft acceptance |

### Performance

- Model: Qwen3.6-27B Q3_K_S (unsloth MTP-GGUF) — 12.6 GB
- Speed: ~77 tok/s effective (MTP enabled)
- VRAM: ~13.6 GB of 16 GB
- Context: 8192 tokens (full, per-slot)
- Port: 11435

### Rebuild after git pull

```
cd C:\Windows\System32\llama.cpp
git pull
cmake -B build -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=120
cmake --build build --config Release -j 8
```

---

## Development Mode

### `start_dev.ps1`

Launches the orchestrator and dashboard in a single terminal for development. Processes share the terminal window and can be stopped with Ctrl+C.

```powershell
.\setup\start_dev.ps1
```

### `start_mesh.ps1`

Launches all 23 agent servers (ports 8770-8792) plus the orchestrator and dashboard. Required when `USE_HTTP_MESH=true`.

```powershell
.\start_mesh.ps1 # all agents + orchestrator + dashboard
.\start_mesh.ps1 -Agent coder # launch only the coder agent
```

---

## Windows Service (Production)

### `setup\install_service.ps1`

Registers the watchdog as a permanent Windows service that starts automatically on boot. Tries NSSM first; falls back to Windows Task Scheduler if NSSM is not installed.

```powershell
.\setup\install_service.ps1 # auto-detect NSSM vs Task Scheduler
.\setup\install_service.ps1 -Mode NSSM # force NSSM
.\setup\install_service.ps1 -Mode TaskScheduler # force Task Scheduler
.\setup\install_service.ps1 -DryRun # preview without installing
```

What it configures:
- Service name: `ClaudeEcosystem` (NSSM) or task name `Claude Ecosystem Watchdog` (Task Scheduler)
- Triggers: Boot + Logon, with 15-30 second startup delay
- Restart policy: up to 10 automatic restarts on failure
- Stdout/stderr logged to `logs/service.log`
- Environment variables forwarded from `.env` file

### `setup\restart_service.ps1`

Stops and restarts the running service cleanly.

```powershell
.\setup\restart_service.ps1
```

### `setup\uninstall_service.ps1`

Removes the service registration completely. Does not delete any project files.

```powershell
.\setup\uninstall_service.ps1
```

---

## Manual Single-Process Launch

```bash
# Orchestrator only
python orchestrator/orchestrator.py

# Dashboard only
python dashboard/main.py

# Single agent server
python orchestrator/mesh/agent_server.py --agent coder --port 8771

# Watchdog only
python watchdog.py
```

---

## Startup Order

When running manually, start in this order to avoid connection errors:

1. Orchestrator (`:8765`) — must be running before the dashboard tries to proxy to it
2. Dashboard (`:8766`) — depends on orchestrator for API proxying
3. Agent servers (`:8770-8792`) — only needed if `USE_HTTP_MESH=true`
4. Watchdog — monitors all of the above; can start at any point

The service scripts and `start_mesh.ps1` handle this ordering automatically.

---

## Related Nodes

- Self-Healing System — the watchdog that these scripts start
- [HTTP Agent Mesh](/notes/http-agent-mesh) — the agent servers managed by start_mesh.ps1
- Environment Configuration — .env file required before running any script
- Always-On Service — full Task 15 implementation details
