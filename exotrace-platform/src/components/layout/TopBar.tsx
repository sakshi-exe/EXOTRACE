import { AlertTriangle, ChevronDown, Clock3, Satellite } from 'lucide-react'
import { mockInvestigation, mockMission } from '../../data/mockMission'

export function TopBar() {
  return <header className="topbar">
    <div className="topbar-left">
      <div className="mission-select" aria-label={`Mission ${mockMission.name}`}>
        <Satellite size={15} aria-hidden="true" /><span>{mockMission.name}</span><ChevronDown className="mission-caret" size={13} aria-hidden="true" />
      </div>
      <span className="header-divider" aria-hidden="true" />
      <div className="header-state"><span className="status-dot" />{mockMission.state}</div>
    </div>
    <div className="topbar-right">
      <span className="demo-badge"><AlertTriangle size={11} aria-hidden="true" />{mockMission.dataMode}</span>
      <span className="header-meta update"><Clock3 size={12} aria-hidden="true" />{mockMission.lastUpdateUtc}</span>
      <span className="investigation-state">INVESTIGATION {mockInvestigation.state}</span>
    </div>
  </header>
}