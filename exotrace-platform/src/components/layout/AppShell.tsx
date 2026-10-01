import { NavLink, Outlet } from 'react-router-dom'
import { missionNavigation, systemNavigation } from '../navigation/routeConfig'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const mobileNavigation = [...missionNavigation, ...systemNavigation]
  return <div className="app-shell">
    <Sidebar />
    <div className="main-area"><TopBar /><Outlet /></div>
    <nav className="mobile-nav" aria-label="Compact navigation">
      {mobileNavigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end aria-label={label} title={label} className={({ isActive }) => isActive ? 'active' : ''}>
        <Icon size={16} aria-hidden="true" /><span>{label.split(' ')[0]}</span>
      </NavLink>)}
    </nav>
  </div>
}