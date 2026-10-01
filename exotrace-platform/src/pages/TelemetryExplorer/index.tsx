import { Database } from 'lucide-react'
import { TelemetryPanel } from '../../components/charts/TelemetryPanel'
import { DataTable } from '../../components/common/DataTable'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { mockTelemetry } from '../../data/mockTelemetry'

const latest = mockTelemetry[mockTelemetry.length - 1]

const channels = [
  ['Bus Voltage', latest.busVoltageV.toFixed(2), 'V'],
  ['Current', latest.currentA.toFixed(2), 'A'],
  ['Battery State', latest.batteryStatePercent.toFixed(1), '%'],
  ['Temperature', latest.temperatureC.toFixed(1), '°C'],
  ['Communication SNR', latest.communicationSnrDb.toFixed(1), 'dB'],
  ['Attitude Error', latest.attitudeErrorDeg.toFixed(2), '°'],
]

export default function TelemetryExplorerPage() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / SIGNAL REVIEW" title="TELEMETRY EXPLORER" subtitle="Synchronized demonstration channels over the event window" />
    <DemoDataNotice>Generated demo measurements; these are not operational telemetry.</DemoDataNotice>
    <TelemetryPanel className="telemetry-explorer-panel" />
    <Panel title="LATEST SAMPLE · 14:48 UTC" icon={Database} className="page-panel wide channel-table-panel">
      <DataTable headers={['CHANNEL', 'VALUE', 'UNIT', 'SOURCE']} rows={channels.map(([name, value, unit]) => ({ id: name, cells: [name, value, unit, 'DEMO DATA'] }))} />
    </Panel>
  </main>
}