import { Cpu, Gauge } from 'lucide-react'
import { mockSubsystemStatuses } from '../../data/mockMission'
import { Panel } from '../common/Panel'

export function SubsystemHealth() {
  return <Panel title="SUBSYSTEM HEALTH" icon={Gauge}>
    <ul className="subsystem-list">{mockSubsystemStatuses.map((subsystem) => <li className="subsystem-row" key={subsystem.name}>
      <Cpu size={13} className="subsystem-icon" aria-hidden="true" />
      <span className="subsystem-name">{subsystem.name}</span>
      <span className={`subsystem-state ${subsystem.state.toLowerCase()}`}>{subsystem.state}</span>
      <span className="subsystem-detail">{subsystem.detail}</span>
    </li>)}</ul>
  </Panel>
}