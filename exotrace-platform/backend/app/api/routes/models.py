from fastapi import APIRouter

from app.repositories.demo_repository import DemoRepository
from app.schemas.model_status import ModelStatus, ModelStatusResponse

router = APIRouter(prefix="/models", tags=["models"])


@router.get("/status", response_model=ModelStatusResponse)
def model_status() -> ModelStatusResponse:
    components = [
        ModelStatus(component="Isolation Forest", purpose="Baseline anomaly scoring"),
        ModelStatus(component="Autoencoder family", purpose="Multivariate telemetry reconstruction"),
        ModelStatus(component="Change-point detection", purpose="Temporal regime shifts"),
        ModelStatus(component="Bayesian and graph models", purpose="Hypothesis relationship exploration"),
    ]
    return ModelStatusResponse(metadata=DemoRepository.metadata(), components=components)