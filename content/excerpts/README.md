# Ecosystem — selected code excerpts

Small, standalone excerpts from a larger **private** system (the "Ecosystem"): a
self-healing, multi-agent AI orchestrator. Shared to show how I write code — the full
system, its operational config, and any keys stay private.

- `circuit-breaker.py` — three-state circuit breaker, with the race-condition fix (B2)
- `model-router.py` — multi-model failover router (Claude → GPT-4o → Gemini)

To publish these as a standalone public repo: create a new public repo (e.g.
`ecosystem-excerpts`), copy this folder's files in, and push. The portfolio renders
them on the Ecosystem case study regardless.
