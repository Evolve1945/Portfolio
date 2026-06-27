"""
Circuit breaker — excerpt from a larger private system (the "Ecosystem"),
a self-healing multi-agent AI orchestrator.

Three states (CLOSED -> OPEN -> HALF_OPEN -> CLOSED): it stops the orchestrator
from hammering a failing agent, then lets exactly ONE probe test recovery.
Standalone here (the enum + event hook are inlined); no secrets, no external calls.
"""
from __future__ import annotations

import threading
import time
from enum import Enum


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


def emit_event(level: str, kind: str, **fields) -> None:
    """In the real system this writes to the dashboard + memory. No-op here."""


class CircuitBreaker:
    """Three-state circuit breaker.

    Fix B2: the OPEN -> HALF_OPEN transition happens inside one lock acquisition,
    so exactly one thread becomes the recovery probe (no thundering herd).
    record_success() is the only path back to CLOSED.
    """

    def __init__(self, name: str, failure_threshold: int = 5,
                 recovery_timeout: int = 60) -> None:
        self.name = name
        self.state = CircuitState.CLOSED
        self.failures = 0
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.last_failure_time = 0.0
        self._lock = threading.Lock()

    def is_open(self) -> bool:
        with self._lock:
            if self.state == CircuitState.CLOSED:
                return False
            if self.state == CircuitState.HALF_OPEN:
                return True  # one probe already in flight
            # state == OPEN
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN  # exactly one thread wins the lock
                emit_event("info", "circuit_half_open", circuit=self.name)
                return False
            return True

    def record_success(self) -> None:
        with self._lock:
            self.failures = 0
            prev = self.state
            self.state = CircuitState.CLOSED
            if prev != CircuitState.CLOSED:
                emit_event("info", "circuit_closed", circuit=self.name)

    def record_failure(self) -> None:
        with self._lock:
            self.failures += 1
            self.last_failure_time = time.time()
            if self.failures >= self.failure_threshold:
                self.state = CircuitState.OPEN
                emit_event("error", "circuit_opened",
                           circuit=self.name, failures=self.failures)
