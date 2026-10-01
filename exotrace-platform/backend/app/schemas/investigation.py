from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import APIResponse


class TelemetryPoint(BaseModel):
    model_config = ConfigDict(extra="forbid")

    timestamp_utc: str
    channel: str
    value: float
    unit: str


class TelemetryResponse(APIResponse):
    mission_id: str
    points: list[TelemetryPoint]


class AnomalyRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    anomaly_id: str
    timestamp_utc: str
    summary: str
    subsystem: str
    priority: Literal["HIGH", "MEDIUM", "LOW"]


class AnomalyResponse(APIResponse):
    mission_id: str
    anomalies: list[AnomalyRecord]


class TimelineEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    timestamp_utc: str
    summary: str
    subsystem: str
    sequence_index: int


class TimelineResponse(APIResponse):
    mission_id: str
    events: list[TimelineEvent]


class CausalHypothesis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hypothesis_id: str
    summary: str
    evidence: list[str]
    alternatives: list[str]
    illustrative_score: float = Field(ge=0, le=1)
    validated: Literal[False] = False


class HypothesisResponse(APIResponse):
    mission_id: str
    hypotheses: list[CausalHypothesis]


class InvestigationReport(APIResponse):
    mission_id: str
    title: str
    summary: str
    conclusion: Literal["NO_VALIDATED_CONCLUSION"] = "NO_VALIDATED_CONCLUSION"