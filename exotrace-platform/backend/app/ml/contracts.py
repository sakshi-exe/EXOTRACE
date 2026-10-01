from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class TelemetryFrame:
    mission_id: str
    timestamps: tuple[str, ...]
    channels: dict[str, tuple[float, ...]]


@dataclass(frozen=True)
class AnomalyCandidate:
    start_utc: str
    end_utc: str
    channel: str
    score: float
    evidence: tuple[str, ...]


class AnomalyDetector(Protocol):
    """Contract only. Implementations require validated data and evaluation."""

    model_id: str

    def detect(self, frame: TelemetryFrame) -> list[AnomalyCandidate]: ...


class ChangePointDetector(Protocol):
    model_id: str

    def detect_change_points(self, frame: TelemetryFrame) -> list[str]: ...


class HypothesisGenerator(Protocol):
    model_id: str

    def generate(self, frame: TelemetryFrame, events: list[AnomalyCandidate]) -> list[str]: ...