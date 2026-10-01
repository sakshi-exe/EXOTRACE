import { FileText } from 'lucide-react'
import { HypothesisPanel } from '../../components/causal/HypothesisPanel'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { RecentEvents } from '../../components/timeline/RecentEvents'
import { mockInvestigation } from '../../data/mockMission'

export default function InvestigationReportPage() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / INVESTIGATION RECORD" title="INVESTIGATION REPORT" subtitle="Traceable summary of a demonstration mission review" />
    <DemoDataNotice>This report contains simulated evidence only and has no validated scientific conclusion.</DemoDataNotice>
    <Panel title="CASE SUMMARY" icon={FileText} className="page-panel wide report-panel">
      <dl className="report-facts">
        <div><dt>Investigation</dt><dd>{mockInvestigation.id}</dd></div>
        <div><dt>Mission</dt><dd>{mockInvestigation.missionId}</dd></div>
        <div><dt>Review state</dt><dd>{mockInvestigation.state}</dd></div>
        <div><dt>Conclusion</dt><dd>NO VALIDATED CAUSE</dd></div>
      </dl>
      <p className="report-summary">{mockInvestigation.summary} Temporal association is documented for review; physical causation remains unestablished.</p>
    </Panel>
    <div className="lower-grid report-lower-grid"><RecentEvents /><HypothesisPanel /></div>
  </main>
}