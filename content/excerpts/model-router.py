"""
Multi-model failover router — excerpt from a larger private system (the "Ecosystem").

Tries each model adapter in order; on a recoverable failure (rate limit / 5xx /
timeout) it moves to the next. Production chain: Claude -> GPT-4o -> Gemini.
The ModelAdapter interface is summarised below; the provider adapters and any
API keys are NOT part of this excerpt.
"""
from __future__ import annotations

import logging
from typing import Optional, Protocol

log = logging.getLogger("router")


class Usage:
    tokens_in: int
    tokens_out: int
    cost_usd: float


class FailoverError(Exception):
    """Recoverable error (rate limit / 5xx / timeout) — try the next model."""
    reason: str


class AllModelsFailedError(Exception):
    pass


class ModelAdapter(Protocol):
    model_id: str

    def complete(self, messages: list[dict], system: str,
                 max_tokens: int, timeout_s: float) -> tuple[str, Usage]: ...


class ModelRouter:
    """Failover chain: try each adapter in sequence; recover on the first that works.

    Thread-safe: adapters are stateless per call; the router holds no mutable state.
    """

    def __init__(self, adapters: list[ModelAdapter]):
        if not adapters:
            raise ValueError("ModelRouter requires at least one adapter")
        self.adapters = adapters
        log.info("ModelRouter ready — chain: %s",
                 " -> ".join(a.model_id for a in adapters))

    def complete(self, messages: list[dict], system: str, max_tokens: int,
                 timeout_s: float = 60.0,
                 task_id: Optional[str] = None) -> tuple[str, str, Usage]:
        last_error: Optional[FailoverError] = None

        for idx, adapter in enumerate(self.adapters):
            try:
                text, usage = adapter.complete(messages, system, max_tokens, timeout_s)
                if idx > 0:
                    log.info("Router recovered on %s (skipped %d model(s))",
                             adapter.model_id, idx)
                return text, adapter.model_id, usage

            except FailoverError as exc:
                last_error = exc
                if idx + 1 < len(self.adapters):
                    log.warning("Router failover %s -> %s  reason=%s",
                                adapter.model_id, self.adapters[idx + 1].model_id, exc.reason)
                else:
                    log.error("Router: all models failed — last reason=%s", exc.reason)

        raise AllModelsFailedError(
            f"All {len(self.adapters)} model(s) failed. Last: {last_error}")
