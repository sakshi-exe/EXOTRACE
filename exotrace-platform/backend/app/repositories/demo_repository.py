from app.core.config import DEMO_DISCLAIMER
from app.schemas.common import DemoMetadata
from app.schemas.investigation import (
    AnomalyRecord,
    CausalHypothesis,
    InvestigationReport,
    TelemetryPoint,
    TimelineEvent,
)
from app.schemas.mission import Mission


class DemoRepository:
    """In-memory fixtures for UI integration; not an operational data source."""

    mission = Mission(
        mission_id="SAT-X01",
        name="SAT-X01",
        status="FAILED",
        health_percent=42,
        anomaly_count=17,
        events_reviewed=64,
        last_update_utc="14:48:23 UTC",
    )

    telemetry = [
        TelemetryPoint(timestamp_utc="14:05:00", channel="bus_voltage", value=28.2, unit="V"),
        TelemetryPoint(timestamp_utc="14:11:08", channel="bus_voltage", value=27.4, unit="V"),
        TelemetryPoint(timestamp_utc="14:16:42", channel="bus_current", value=4.2, unit="A"),
        TelemetryPoint(timestamp_utc="14:22:07", channel="battery_temperature", value=23.5, unit="degC"),
        TelemetryPoint(timestamp_utc="14:31:42", channel="link_margin", value=-8.4, unit="dB"),
        TelemetryPoint(timestamp_utc="14:43:11", channel="pointing_error", value=2.7, unit="deg"),
        TelemetryPoint(timestamp_utc="14:48:23", channel="bus_voltage", value=22.8, unit="V"),
    ]

    anomalies = [
        AnomalyRecord(anomaly_id="AN-017", timestamp_utc="14:11:08", summary="Voltage instability", subsystem="Power bus", priority="HIGH"),
        AnomalyRecord(anomaly_id="AN-016", timestamp_utc="14:16:42", summary="Current fluctuation", subsystem="Power subsystem", priority="HIGH"),
        AnomalyRecord(anomaly_id="AN-015", timestamp_utc="14:22:07", summary="Thermal deviation", subsystem="Battery module", priority="MEDIUM"),
        AnomalyRecord(anomaly_id="AN-014", timestamp_utc="14:31:42", summary="Communication degradation", subsystem="Communications", priority="MEDIUM"),
        AnomalyRecord(anomaly_id="AN-013", timestamp_utc="14:43:11", summary="Attitude instability", subsystem="Attitude control", priority="HIGH"),
    ]

    events = [
        TimelineEvent(timestamp_utc="14:11:08", summary="Voltage instability detected", subsystem="Power bus", sequence_index=1),
        TimelineEvent(timestamp_utc="14:16:42", summary="Current fluctuation", subsystem="Power subsystem", sequence_index=2),
        TimelineEvent(timestamp_utc="14:22:07", summary="Thermal deviation", subsystem="Battery module", sequence_index=3),
        TimelineEvent(timestamp_utc="14:31:42", summary="Communication degradation", subsystem="Communications", sequence_index=4),
        TimelineEvent(timestamp_utc="14:43:11", summary="Attitude instability", subsystem="Attitude control", sequence_index=5),
        TimelineEvent(timestamp_utc="14:48:23", summary="Subsystem failure reported", subsystem="Mission state", sequence_index=6),
    ]

    hypotheses = [
        CausalHypothesis(
            hypothesis_id="H-01",
            summary="Power-bus instability may precede the thermal deviation",
            evidence=["The demonstration event order places voltage variance first."],
            alternatives=["Independent sensor artifact", "Unobserved concurrent subsystem event"],
            illustrative_score=0.62,
        ),
        CausalHypothesis(
            hypothesis_id="H-02",
            summary="An independent communications fault may explain link degradation",
            evidence=["The demonstration sequence includes a later link-margin change."],
            alternatives=["Shared power disturbance", "Ground-link or propagation effects"],
            illustrative_score=0.31,
        ),
    ]

    @staticmethod
    def metadata() -> DemoMetadata:
        return DemoMetadata(disclaimer=DEMO_DISCLAIMER)

    @classmethod
    def mission_for(cls, mission_id: str) -> Mission | None:
        return cls.mission if mission_id == cls.mission.mission_id else None

    @classmethod
    def report_for(cls, mission_id: str) -> InvestigationReport:
        return InvestigationReport(
            metadata=cls.metadata(),
            mission_id=mission_id,
            title="SAT-X01 demonstration investigation",
            summary=(
                "This report contains simulated events for interface demonstration. "
                "No root cause has been established and no diagnosis is claimed."
            ),
        )