from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.common import APIResponse


class Mission(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mission_id: str
    name: str
    status: Literal["FAILED", "ACTIVE", "NOMINAL"]
    health_percent: int
    anomaly_count: int
    events_reviewed: int
    last_update_utc: str


class MissionListResponse(APIResponse):
    missions: list[Mission]


class MissionOverviewResponse(APIResponse):
    mission: Mission
    subsystem_count: int