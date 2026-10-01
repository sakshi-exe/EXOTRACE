import { Clock3 } from 'lucide-react'
import { mockTimeline } from '../../data/mockTimeline'
import { SeverityBadge } from '../common/SeverityBadge'
import { Panel } from '../common/Panel'

export function RecentEvents({ className = '' }: { className?: string }) {
  return <Panel title="RECENT EVENTS" icon={Clock3} className={className}>
    <ol className="event-list">{mockTimeline.map((event) => <li className="event-row" key={event.timestampUtc}>
      <time className="event-time">{event.timestampUtc}</time>
      <span className={`event-node ${event.severity.toLowerCase()}`} aria-hidden="true" />
      <div className="event-content">
        <div className="event-meta"><span>{event.subsystem}</span><SeverityBadge severity={event.severity} /></div>
        <div className="event-text">{event.description}</div>
      </div>
    </li>)}</ol>
  </Panel>
}