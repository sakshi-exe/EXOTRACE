from pydantic import ConfigDict


class APIModel:
    model_config = ConfigDict(extra="forbid")


DEMO_DISCLAIMER = (
    "Simulated demonstration data only. This response is not a validated "
    "spacecraft diagnosis or scientific finding."
)