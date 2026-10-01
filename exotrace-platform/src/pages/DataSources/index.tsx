import { Database } from 'lucide-react'
import { DemoDataNotice } from '../../components/common/DemoDataNotice'
import { EmptyState } from '../../components/common/DataStates'
import { PageHeading } from '../../components/common/PageHeading'
import { Panel } from '../../components/common/Panel'

export default function DataSourcesPage() {
  return <main className="page-content">
    <PageHeading eyebrow="SYSTEM / SOURCE REGISTRY" title="DATA SOURCES" subtitle="Prototype source and ingestion status" />
    <DemoDataNotice>No live spacecraft source is connected in this research prototype.</DemoDataNotice>
    <Panel title="SOURCE REGISTRY" icon={Database} className="page-panel wide route-panel">
      <div className="source-record"><div><strong>SAT-X01 demonstration fixture</strong><span>Generated telemetry · mission event sequence · in-memory</span></div><span className="source-state">DEMO DATA</span></div>
      <EmptyState title="No live sources connected" detail="Replace the demo repository with a validated mission-data adapter when available." />
    </Panel>
  </main>
}