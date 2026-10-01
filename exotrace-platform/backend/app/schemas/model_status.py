from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.common import APIResponse


class ModelStatus(BaseModel):
    model_config = ConfigDict(extra="forbid")

    component: str
    purpose: str
    status: Literal["PLANNED", "NOT_IMPLEMENTED"] = "PLANNED"


class ModelStatusResponse(APIResponse):
    components: list[ModelStatus]