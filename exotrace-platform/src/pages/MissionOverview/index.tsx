import { Activity, AlertTriangle, Check, Clock3, Gauge, ShieldAlert } from 'lucide-react'
import { HypothesisPanel } from '../../components/causal/HypothesisPanel'
import { TelemetryPanel } from '../../components/charts/TelemetryPanel'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { MetricCard } from '../../components/common/MetricCard'
import { PageHeading } from '../../components/common/PageHeading'
import { RecentEvents } from '../../components/timeline/RecentEvents'
import { SubsystemHealth } from '../../components/telemetry/SubsystemHealth'
import { mockInvestigation, mockMission } from '../../data/mockMission'

export default function MissionOverviewPage() {
  return <main className="page-content">
    <PageHeading eyebrow={`MISSION CONTROL / ${mockMission.id}`} title="MISSION OVERVIEW" subtitle="Trace the anomaly. Reconstruct the failure. Explain the mission." />
    <DemoDataNotice>All mission status and telemetry shown here are simulated research-prototype fixtures.</DemoDataNotice>
    <div className="metrics-grid mission-metrics">
      <MetricCard label="MISSION STATUS" value={mockMission.state} detail="Reported at 14:48:23 UTC" icon={AlertTriangle} state="critical" />
      <MetricCard label="MISSION HEALTH" value={`${mockMission.healthPercent}%`} detail="Demonstration indicator" icon={Gauge} state="warning" />
      <MetricCard label="ANOMALIES" value={String(mockMission.anomalyCount)} detail="Mock review flags" icon={Activity} />
      <MetricCard label="CRITICAL EVENTS" value={String(mockMission.criticalEventCount)} detail="Mock severity labels" icon={ShieldAlert} state="critical" />
      <MetricCard label="FIRST PRECURSOR" value={`${mockMission.firstPrecursorMinutes} min`} detail="Before reported failure · demo" icon={Clock3} state="warning" />
      <MetricCard label="INVESTIGATION" value={mockInvestigation.state} detail="Sequence assembled · no validated cause" icon={Check} state="nominal" />
    </div>
    <TelemetryPanel className="mission-telemetry" />
    <div className="lower-grid mission-lower-grid">
      <RecentEvents />
      <SubsystemHealth />
    </div>
    <HypothesisPanel />
  </main>
}