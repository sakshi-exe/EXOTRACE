import { Waypoints } from 'lucide-react'
import { HypothesisPanel } from '../../components/causal/HypothesisPanel'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { mockHypotheses } from '../../data/mockHypotheses'

export default function CausalAnalysisPage() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / HYPOTHESIS REVIEW" title="CAUSAL ANALYSIS" subtitle="Compare probable causes, supporting evidence, and alternative explanations" />
    <DemoDataNotice>Hypotheses and model confidence values are illustrative and unvalidated.</DemoDataNotice>
    <HypothesisPanel />
    <Panel title="SUPPORTING EVIDENCE · DEMO" icon={Waypoints} className="page-panel wide evidence-panel">
      <div className="evidence-grid">{mockHypotheses.map((hypothesis) => <article className="evidence-item" key={hypothesis.id}>
        <h3>{hypothesis.id} · {hypothesis.label}</h3>
        <ul>{hypothesis.supportingEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
        <p><strong>Temporal association:</strong> {hypothesis.temporalAssociation}</p>
      </article>)}</div>
    </Panel>
  </main>
}