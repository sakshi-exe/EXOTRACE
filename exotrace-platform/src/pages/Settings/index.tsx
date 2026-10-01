import { Settings } from 'lucide-react'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'
import { mockMission } from '../../data/mockMission'

export default function SettingsPage() {
  return <main className="page-content">
    <PageHeading eyebrow="SYSTEM / WORKSPACE" title="SETTINGS" subtitle="Current prototype workspace configuration" />
    <DemoDataNotice>Workspace values below describe this demo session only.</DemoDataNotice>
    <Panel title="MISSION WORKSPACE" icon={Settings} className="page-panel wide route-panel">
      <dl className="report-facts settings-facts">
        <div><dt>Mission context</dt><dd>{mockMission.name}</dd></div>
        <div><dt>Data mode</dt><dd>{mockMission.dataMode}</dd></div>
        <div><dt>API integration</dt><dd>Typed client available · demo fixtures currently displayed</dd></div>
        <div><dt>Analysis models</dt><dd>Not implemented</dd></div>
      </dl>
    </Panel>
  </main>
}