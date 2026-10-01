import { Orbit } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { missionNavigation, systemNavigation, type NavigationItem } from '../navigation/routeConfig'

function NavigationGroup({ label, items }: { label: string; items: NavigationItem[] }) {
  return <section className="nav-group" aria-label={label}>
    <h2 className="nav-label">{label}</h2>
    {items.map(({ label: itemLabel, path, icon: Icon }) => <NavLink
      key={path}
      to={path}
      end
      title={itemLabel}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
    >
      <Icon size={15} strokeWidth={1.7} aria-hidden="true" /><span>{itemLabel}</span>
    </NavLink>)}
  </section>
}

export function Sidebar() {
  return <aside className="sidebar">
    <NavLink className="brand" to="/mission" aria-label="EXOTRACE mission overview">
      <span className="brand-mark"><Orbit size={19} strokeWidth={1.7} aria-hidden="true" /></span>
      <span className="brand-copy">
        <span className="brand-name">EXOTRACE</span>
        <span className="brand-subtitle">SPACECRAFT MISSION FORENSICS</span>
      </span>
    </NavLink>
    <nav className="sidebar-scroll" aria-label="Main navigation">
      <NavigationGroup label="MISSION CONTROL" items={missionNavigation} />
      <NavigationGroup label="SYSTEM" items={systemNavigation} />
    </nav>
    <div className="sidebar-bottom">
      <div className="online-status"><span className="status-dot" /><span>System Status</span><small>ONLINE</small></div>
      <div className="version">EXOTRACE v0.1.0<br />RESEARCH PROTOTYPE</div>
    </div>
  </aside>
}