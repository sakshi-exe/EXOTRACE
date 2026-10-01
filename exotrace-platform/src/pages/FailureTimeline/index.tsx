import { Clock3 } from 'lucide-react'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { RecentEvents } from '../../components/timeline/RecentEvents'

export default function FailureTimelinePage() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / TEMPORAL RECONSTRUCTION" title="FAILURE TIMELINE" subtitle="Review event ordering without treating temporal association as proof of cause" />
    <DemoDataNotice>Event timestamps and sequence are simulated for this interface demonstration.</DemoDataNotice>
    <div className="page-grid route-grid">
      <RecentEvents className="page-panel wide route-panel" />
      <Panel title="INTERPRETATION BOUNDARY" icon={Clock3} className="page-panel wide">
        <p className="placeholder-content">Events are displayed in timestamp order. Their sequence can motivate a failure hypothesis, but temporal correlation alone does not establish physical causation.</p>
      </Panel>
    </div>
  </main>
}