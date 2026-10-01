import { ShieldAlert } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { SeverityBadge } from '../../components/common/SeverityBadge'
import { mockAnomalies } from '../../data/mockAnomalies'

export default function AnomalyDetectionPage() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / DETECTION QUEUE" title="ANOMALY DETECTION" subtitle="Inspect demo flags and their associated telemetry channels" />
    <DemoDataNotice>Detection flags are pre-authored mock records; no model is connected.</DemoDataNotice>
    <Panel title="FLAGGED OBSERVATIONS" icon={ShieldAlert} className="page-panel wide route-panel">
      <DataTable headers={['TIME (UTC)', 'SUBSYSTEM', 'OBSERVATION', 'DETAIL', 'SEVERITY']} rows={mockAnomalies.map((anomaly) => ({
        id: anomaly.id,
        cells: [anomaly.timestampUtc, anomaly.subsystem, anomaly.title, anomaly.detail, <SeverityBadge severity={anomaly.severity} key={anomaly.severity} />],
      }))} />
    </Panel>
  </main>
}