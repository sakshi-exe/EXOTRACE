from typing import Literal

from pydantic import BaseModel, ConfigDict


class DemoMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    data_mode: Literal["DEMO DATA"] = "DEMO DATA"
    disclaimer: str


class APIResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: DemoMetadata