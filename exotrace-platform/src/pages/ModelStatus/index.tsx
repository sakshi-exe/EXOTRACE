import { BrainCircuit } from 'lucide-react'
import { DataTable } from '../../components/common/DataTable'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'

const plannedModels = [
  ['Isolation Forest', 'Baseline anomaly scoring'],
  ['Autoencoder / LSTM Autoencoder', 'Telemetry reconstruction research'],
  ['Temporal CNN / Transformer', 'Sequence modeling research'],
  ['Change-point detection', 'Temporal regime-shift candidates'],
  ['Bayesian networks / GNN', 'Hypothesis relationship research'],
  ['SHAP', 'Future model explanation interface'],
]

export default function ModelStatusPage() {
  return <main className="page-content">
    <PageHeading eyebrow="SYSTEM / RESEARCH PIPELINE" title="MODEL STATUS" subtitle="Planned analysis capabilities and implementation boundary" />
    <DemoDataNotice>No model is trained, loaded, or producing the displayed demonstration values.</DemoDataNotice>
    <Panel title="PLANNED COMPONENTS" icon={BrainCircuit} className="page-panel wide route-panel">
      <DataTable headers={['COMPONENT', 'INTENDED RESEARCH ROLE', 'STATUS']} rows={plannedModels.map(([name, purpose]) => ({
        id: name,
        cells: [name, purpose, <span className="planned-status" key="planned">PLANNED · NOT IMPLEMENTED</span>],
      }))} />
    </Panel>
  </main>
}