from fastapi import APIRouter, HTTPException

from app.repositories.demo_repository import DemoRepository
from app.schemas.investigation import (
    AnomalyResponse,
    HypothesisResponse,
    InvestigationReport,
    TelemetryResponse,
    TimelineResponse,
)

router = APIRouter(prefix="/missions/{mission_id}", tags=["investigations"])


def require_mission(mission_id: str) -> None:
    if DemoRepository.mission_for(mission_id) is None:
        raise HTTPException(status_code=404, detail="Mission not found")


@router.get("/telemetry", response_model=TelemetryResponse)
def telemetry(mission_id: str) -> TelemetryResponse:
    require_mission(mission_id)
    return TelemetryResponse(metadata=DemoRepository.metadata(), mission_id=mission_id, points=DemoRepository.telemetry)


@router.get("/anomalies", response_model=AnomalyResponse)
def anomalies(mission_id: str) -> AnomalyResponse:
    require_mission(mission_id)
    return AnomalyResponse(metadata=DemoRepository.metadata(), mission_id=mission_id, anomalies=DemoRepository.anomalies)


@router.get("/timeline", response_model=TimelineResponse)
def timeline(mission_id: str) -> TimelineResponse:
    require_mission(mission_id)
    return TimelineResponse(metadata=DemoRepository.metadata(), mission_id=mission_id, events=DemoRepository.events)


@router.get("/hypotheses", response_model=HypothesisResponse)
def hypotheses(mission_id: str) -> HypothesisResponse:
    require_mission(mission_id)
    return HypothesisResponse(metadata=DemoRepository.metadata(), mission_id=mission_id, hypotheses=DemoRepository.hypotheses)


@router.get("/report", response_model=InvestigationReport)
def report(mission_id: str) -> InvestigationReport:
    require_mission(mission_id)
    return DemoRepository.report_for(mission_id)