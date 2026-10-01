from fastapi import APIRouter, HTTPException

from app.repositories.demo_repository import DemoRepository
from app.schemas.common import DemoMetadata
from app.schemas.mission import MissionListResponse, MissionOverviewResponse

router = APIRouter(prefix="/missions", tags=["missions"])


@router.get("", response_model=MissionListResponse)
def list_missions() -> MissionListResponse:
    return MissionListResponse(metadata=DemoRepository.metadata(), missions=[DemoRepository.mission])


@router.get("/{mission_id}/overview", response_model=MissionOverviewResponse)
def mission_overview(mission_id: str) -> MissionOverviewResponse:
    mission = DemoRepository.mission_for(mission_id)
    if mission is None:
        raise HTTPException(status_code=404, detail="Mission not found")
    return MissionOverviewResponse(metadata=DemoRepository.metadata(), mission=mission, subsystem_count=5)