import {
  Activity, AlertTriangle, BrainCircuit, Check, ChevronDown,
  ChevronRight, Clock3, Database, Download, FileText, Gauge, Orbit,
  Radio, RefreshCw, Satellite, ShieldAlert, Settings, SlidersHorizontal,
  Waypoints, Zap,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { Link, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'

const missionNav = [
  { label: 'Mission Overview', path: '/mission', icon: Satellite },
  { label: 'Telemetry Explorer', path: '/telemetry', icon: Activity },
  { label: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert },
  { label: 'Failure Timeline', path: '/timeline', icon: Clock3 },
  { label: 'Causal Analysis', path: '/causal-analysis', icon: Waypoints },
  { label: 'Investigation Report', path: '/report', icon: FileText },
]

const systemNav = [
  { label: 'Data Sources', path: '/data-sources', icon: Database },
  { label: 'Model Status', path: '/model-status', icon: BrainCircuit },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const pageDetails: Record<string, { title: string; subtitle: string; section: string }> = {
  '/telemetry': { title: 'TELEMETRY EXPLORER', subtitle: 'Review synchronized spacecraft measurements', section: 'SIGNAL REVIEW' },
  '/anomalies': { title: 'ANOMALY DETECTION', subtitle: 'Inspect flagged intervals and their source signals', section: 'DETECTION QUEUE' },
  '/timeline': { title: 'FAILURE TIMELINE', subtitle: 'Reconstruct the sequence surrounding the reported failure', section: 'TEMPORAL RECONSTRUCTION' },
  '/causal-analysis': { title: 'CAUSAL ANALYSIS', subtitle: 'Compare provisional explanations against available evidence', section: 'HYPOTHESIS REVIEW' },
  '/report': { title: 'INVESTIGATION REPORT', subtitle: 'A traceable summary of this demonstration investigation', section: 'DRAFT REPORT' },
  '/data-sources': { title: 'DATA SOURCES', subtitle: 'Telemetry inputs configured for this prototype', section: 'SOURCE REGISTRY' },
  '/model-status': { title: 'MODEL STATUS', subtitle: 'Planned analysis components and readiness boundaries', section: 'RESEARCH PIPELINE' },
  '/settings': { title: 'SETTINGS', subtitle: 'Mission workspace configuration', section: 'WORKSPACE' },
}

function Sidebar() {
  return <aside className="sidebar">
    <Link className="brand" to="/mission" aria-label="EXOTRACE mission overview">
      <span className="brand-mark"><Orbit size={19} strokeWidth={1.7} /></span>
      <span className="brand-copy"><span className="brand-name">EXOTRACE</span><span className="brand-subtitle">SPACECRAFT MISSION FORENSICS</span></span>
    </Link>
    <div className="sidebar-scroll">
      <NavGroup label="MISSION CONTROL" items={missionNav} />
      <NavGroup label="SYSTEM" items={systemNav} />
    </div>
    <div className="sidebar-bottom">
      <div className="online-status"><span className="status-dot" /><span>System Status</span><small>ONLINE</small></div>
      <div className="version">EXOTRACE v0.1.0<br />Research Prototype</div>
    </div>
  </aside>
}

function NavGroup({ label, items }: { label: string; items: typeof missionNav }) {
  return <div className="nav-group">
    <div className="nav-label">{label}</div>
    {items.map(({ label: itemLabel, path, icon: Icon }) => <NavLink key={path} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={path}>
      <Icon size={15} strokeWidth={1.7} /><span>{itemLabel}</span>
    </NavLink>)}
  </div>
}

function TopBar() {
  return <header className="topbar">
    <div className="topbar-left">
      <div className="mission-select"><Satellite size={15} /><span>SAT-X01</span><ChevronDown className="mission-caret" size={13} /></div>
      <span className="header-divider" />
      <div className="header-state"><span className="status-dot" />FAILED</div>
    </div>
    <div className="topbar-right">
      <span className="demo-badge"><AlertTriangle size={11} />DEMO DATA</span>
      <span className="header-meta update"><Clock3 size={12} />14:48:23 UTC</span>
      <span className="investigation-state">INVESTIGATION COMPLETE</span>
    </div>
  </header>
}

function Shell() {
  const location = useLocation()
  const compactNav = [...missionNav, ...systemNav]
  return <div className="app-shell">
    <Sidebar />
    <div className="main-area"><TopBar /><Outlet /></div>
    <nav className="mobile-nav" aria-label="Primary navigation">
      {compactNav.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} aria-label={label} className={location.pathname === path ? 'active' : ''}><Icon size={16} /><span>{label.split(' ')[0]}</span></NavLink>)}
    </nav>
  </div>
}

const telemetry = [
  { time: '14:05', voltage: 28.2, current: 4.1, thermal: 22.8 },
  { time: '14:10', voltage: 28.1, current: 4.0, thermal: 22.9 },
  { time: '14:15', voltage: 27.4, current: 4.2, thermal: 23.1 },
  { time: '14:20', voltage: 27.2, current: 3.8, thermal: 23.5 },
  { time: '14:25', voltage: 26.7, current: 4.7, thermal: 24.3 },
  { time: '14:30', voltage: 25.9, current: 4.4, thermal: 26.1 },
  { time: '14:35', voltage: 25.5, current: 3.9, thermal: 27.4 },
  { time: '14:40', voltage: 24.8, current: 3.5, thermal: 28.6 },
  { time: '14:45', voltage: 23.7, current: 3.1, thermal: 29.2 },
  { time: '14:48', voltage: 22.8, current: 2.7, thermal: 30.1 },
]

const eventRows = [
  { time: '14:11:08', label: 'Voltage instability detected', detail: 'Power bus · 28.1 V → 27.4 V', state: 'warning' },
  { time: '14:16:42', label: 'Current fluctuation', detail: 'Power subsystem · variance elevated', state: 'warning' },
  { time: '14:22:07', label: 'Thermal deviation', detail: 'Battery module · +2.1 °C trend', state: 'warning' },
  { time: '14:31:42', label: 'Communication degradation', detail: 'Link margin · intermittent dropouts', state: 'info' },
  { time: '14:43:11', label: 'Attitude instability', detail: 'ADCS · pointing error increasing', state: 'warning' },
  { time: '14:48:23', label: 'Subsystem failure reported', detail: 'Mission state changed to FAILED', state: 'critical' },
]

function PageHeading({ eyebrow, title, subtitle, actions = true }: { eyebrow: string; title: string; subtitle: string; actions?: boolean }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>
    {actions && <div className="heading-actions"><button className="icon-button" title="Refresh view" aria-label="Refresh view"><RefreshCw size={14} /></button><button className="outline-button"><Download size={13} />Export</button></div>}
  </div>
}

function MetricCard({ label, value, detail, icon: Icon, valueClass = '' }: { label: string; value: string; detail: React.ReactNode; icon: typeof Activity; valueClass?: string }) {
  return <section className="metric-card"><div className="metric-top">{label}<Icon className="metric-icon" size={14} /></div><div className={`metric-value ${valueClass}`}>{value}</div><div className="metric-detail">{detail}</div></section>
}

function PanelHeading({ title, icon: Icon, action }: { title: string; icon: typeof Activity; action?: string }) {
  const href = action === 'View timeline' ? '/timeline' : action === 'View telemetry' ? '/telemetry' : '/causal-analysis'
  return <div className="panel-heading"><div className="panel-title"><Icon size={14} />{title}</div>{action && <Link className="panel-action" to={href}>{action}<ChevronRight size={12} /></Link>}</div>
}

function TelemetryChart() {
  return <section className="panel chart-panel">
    <PanelHeading title="TELEMETRY SIGNATURE" icon={Activity} action="View telemetry" />
    <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry} margin={{ top: 10, right: 11, left: -18, bottom: 0 }}>
      <defs><linearGradient id="voltageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#64b5f6" stopOpacity={0.18} /><stop offset="95%" stopColor="#64b5f6" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid stroke="#1c2a38" strokeDasharray="2 5" vertical={false} />
      <XAxis dataKey="time" tick={{ fill: '#748597', fontSize: 9, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#263644' }} tickLine={false} />
      <YAxis domain={[20, 32]} tick={{ fill: '#748597', fontSize: 9, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ background: '#111b27', border: '1px solid #2b3a4a', color: '#e7edf5', fontSize: 10 }} labelStyle={{ color: '#93a1b0' }} />
      <ReferenceLine x="14:30" stroke="#e6ad5b" strokeDasharray="3 4" />
      <Area type="monotone" dataKey="voltage" name="Bus voltage (V)" stroke="#64b5f6" strokeWidth={1.8} fill="url(#voltageFill)" dot={false} activeDot={{ r: 3 }} />
      <Area type="monotone" dataKey="thermal" name="Battery temp (°C)" stroke="#e6ad5b" strokeWidth={1.5} fill="none" dot={false} activeDot={{ r: 3 }} />
    </AreaChart></ResponsiveContainer></div>
    <div className="chart-legend"><span className="legend-item"><i className="legend-swatch" />Bus voltage</span><span className="legend-item"><i className="legend-swatch temp" />Battery temperature</span><span className="chart-note">14:05—14:48 UTC · illustrative</span></div>
  </section>
}

function EventTimeline() {
  return <section className="panel timeline-panel"><PanelHeading title="TEMPORAL RECONSTRUCTION" icon={Clock3} action="View timeline" />
    <div className="event-list">{eventRows.map((event) => <div className="event-row" key={event.time}><time className="event-time">{event.time}</time><span className={`event-node ${event.state}`} /><div><div className="event-text">{event.label}</div><div className="event-sub">{event.detail}</div></div></div>)}</div>
  </section>
}

function Hypotheses() {
  const items = [
    { name: 'Power bus degradation preceding thermal rise', copy: 'Temporal order is consistent with a power-side precursor; correlation is not causal confirmation.', confidence: '0.62', width: '62%' },
    { name: 'Battery thermal excursion as contributing factor', copy: 'Temperature trend rises after voltage variance in this demonstration trace.', confidence: '0.48', width: '48%' },
    { name: 'Attitude-control response to bus instability', copy: 'Sequence is plausible but subsystem cross-checks are not available in this dataset.', confidence: '0.31', width: '31%' },
  ]
  return <section className="panel"><PanelHeading title="PROVISIONAL HYPOTHESES · DEMO SCORES" icon={Waypoints} action="Review analysis" />
    <div className="hypothesis-list">{items.map((item, index) => <div className="hypothesis" key={item.name}><span className="hypothesis-number">0{index + 1}</span><div><div className="hypothesis-title">{item.name}</div><div className="hypothesis-copy">{item.copy}</div></div><div><div className="confidence">{item.confidence}*</div><div className="confidence-bar"><span style={{ width: item.width }} /></div></div></div>)}<div className="hypothesis-footnote">* Illustrative score only; not a calibrated probability.</div></div>
  </section>
}

function Subsystems() {
  const rows = [
    ['Power bus', '22.8 V', 'CRITICAL', 'critical'],
    ['Battery thermal', '30.1 °C', 'WARNING', 'warning'],
    ['Communications', '−8.4 dB', 'DEGRADED', 'warning'],
    ['Attitude control', '2.7° error', 'CRITICAL', 'critical'],
    ['Payload', 'Standby', 'NOMINAL', 'nominal'],
  ]
  return <section className="panel"><PanelHeading title="SUBSYSTEM SNAPSHOT" icon={Gauge} />
    <div className="subsystem-list">{rows.map(([name, value, state, tone]) => <div className="subsystem-row" key={name}><span className="subsystem-name">{name}</span><span className="subsystem-value">{value}</span><span className={`subsystem-state ${tone}`}>{state}</span></div>)}</div>
  </section>
}

function MissionOverview() {
  return <main className="page-content">
    <PageHeading eyebrow="MISSION CONTROL / SAT-X01" title="MISSION CONTROL" subtitle="Spacecraft health and investigation overview" />
    <div className="metrics-grid">
      <MetricCard label="MISSION STATUS" value="FAILED" detail="Reported 14:48:23 UTC" icon={AlertTriangle} valueClass="failed" />
      <MetricCard label="MISSION HEALTH" value="42%" detail={<><span className="up">↓ 18 pts</span> across event window</>} icon={Gauge} />
      <MetricCard label="ANOMALIES" value="17" detail="6 high-priority flags" icon={ShieldAlert} />
      <MetricCard label="EVENTS REVIEWED" value="64" detail="Across 5 subsystem channels" icon={Zap} />
    </div>
    <div className="page-grid"><TelemetryChart /><EventTimeline /></div>
    <div className="lower-grid"><Hypotheses /><Subsystems /></div>
    <div className="data-caveat"><AlertTriangle size={13} />DEMO DATA · All telemetry, statuses, event sequences, and hypothesis scores are simulated for interface demonstration. Not a validated spacecraft diagnosis.</div>
  </main>
}

const anomalyRows = [
  ['AN-017', 'Voltage instability', 'Power bus', '14:11:08', 'HIGH'],
  ['AN-016', 'Current fluctuation', 'Power subsystem', '14:16:42', 'HIGH'],
  ['AN-015', 'Thermal deviation', 'Battery module', '14:22:07', 'MEDIUM'],
  ['AN-014', 'Packet loss increase', 'Communications', '14:31:42', 'MEDIUM'],
  ['AN-013', 'Pointing error growth', 'Attitude control', '14:43:11', 'HIGH'],
]

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td className={index === 0 || cell.includes(':') ? 'table-mono' : ''} key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table>
}

function SecondaryPage() {
  const { pathname } = useLocation()
  const page = pageDetails[pathname] ?? pageDetails['/telemetry']
  const isAnomalies = pathname === '/anomalies'
  const isTimeline = pathname === '/timeline'
  const isCausal = pathname === '/causal-analysis'
  const isReport = pathname === '/report'
  const isSources = pathname === '/data-sources'
  const isModels = pathname === '/model-status'
  const isSettings = pathname === '/settings'
  const panels = isSources ? [['SOURCE', 'FORMAT', 'RECORDS', 'STATUS'], ['SAT-X01 telemetry stream', 'CSV · demo fixture', '64 samples', 'DEMO DATA'], ['Mission event log', 'JSON · demo fixture', '17 events', 'DEMO DATA']] : isModels ? [['COMPONENT', 'ROLE', 'STATUS', 'IMPLEMENTATION'], ['Change-point detection', 'Future interface', 'PLANNED', 'Not implemented'], ['Anomaly scoring', 'Future interface', 'PLANNED', 'Not implemented'], ['Causal graph inference', 'Future interface', 'PLANNED', 'Not implemented']] : [['CHANNEL', 'LATEST VALUE', 'UNIT', 'FLAG'], ['Bus voltage', '22.8', 'V', 'DEMO'], ['Battery temperature', '30.1', '°C', 'DEMO'], ['Link margin', '−8.4', 'dB', 'DEMO']]
  return <main className="page-content">
    <PageHeading eyebrow={`MISSION CONTROL / ${page.section}`} title={page.title} subtitle={page.subtitle} />
    <div className="data-caveat"><AlertTriangle size={13} />DEMO DATA · Prototype content is simulated and is not validated mission analysis.</div>
    {isAnomalies && <div className="page-grid" style={{ marginTop: 13 }}><section className="panel page-panel wide"><PanelHeading title="FLAGGED INTERVALS" icon={ShieldAlert} /><SimpleTable headers={['ID', 'OBSERVATION', 'SUBSYSTEM', 'TIME (UTC)', 'PRIORITY']} rows={anomalyRows} /></section><section className="panel page-panel"><PanelHeading title="DETECTION CONFIGURATION" icon={SlidersHorizontal} /><div className="placeholder-content">Detection thresholds shown here are demonstration settings only. No anomaly detection model is connected.</div></section><section className="panel page-panel"><PanelHeading title="REVIEW STATE" icon={Check} /><div className="placeholder-content">17 mock flags · 5 represented in this view<br />Review status: illustrative, not independently verified.</div></section></div>}
    {isTimeline && <div className="page-grid" style={{ marginTop: 13 }}><section className="panel page-panel wide"><PanelHeading title="EVENT SEQUENCE · UTC" icon={Clock3} /><div className="event-list">{eventRows.map((event) => <div className="event-row" key={event.time}><time className="event-time">{event.time}</time><span className={`event-node ${event.state}`} /><div><div className="event-text">{event.label}</div><div className="event-sub">{event.detail}</div></div></div>)}</div></section></div>}
    {isCausal && <div className="page-grid" style={{ marginTop: 13 }}><section className="panel page-panel wide"><PanelHeading title="HYPOTHESIS REGISTER" icon={Waypoints} /><div className="hypothesis-list">{['Power-bus instability may precede thermal deviation', 'Thermal excursion may contribute to downstream subsystem stress', 'Independent communications fault remains an alternative explanation'].map((text, index) => <div className="hypothesis" key={text}><span className="hypothesis-number">0{index + 1}</span><div><div className="hypothesis-title">{text}</div><div className="hypothesis-copy">Evidence shown is simulated; no causal relationship has been established.</div></div><span className="confidence">UNVALIDATED</span></div>)}</div></section></div>}
    {isReport && <section className="panel page-panel" style={{ marginTop: 13 }}><PanelHeading title="INVESTIGATION SUMMARY" icon={FileText} /><div className="report-summary">This prototype report records a simulated sequence of power, thermal, communications, and attitude events for SAT-X01. The ordering and measurements are illustrative UI data only. No root cause has been determined, and no spacecraft diagnosis is claimed.</div></section>}
    {(isSources || isModels || (!isAnomalies && !isTimeline && !isCausal && !isReport)) && <div className="page-grid" style={{ marginTop: 13 }}><section className="panel page-panel wide"><PanelHeading title={isSettings ? 'WORKSPACE PREFERENCES' : page.section} icon={isSources ? Database : isModels ? BrainCircuit : isSettings ? Settings : Radio} /><SimpleTable headers={isSettings ? ['SETTING', 'VALUE', 'SCOPE', 'STATE'] : panels[0]} rows={isSettings ? [['Mission workspace', 'SAT-X01', 'Current session', 'DEMO'], ['Data mode', 'Demonstration fixture', 'All views', 'LOCKED']] : panels.slice(1)} /></section></div>}
    <div className="page-panel" style={{ marginTop: 13 }}><Link to="/mission" className="panel-action">Return to mission overview <ChevronRight size={12} /></Link></div>
  </main>
}

function App() {
  return <Routes><Route element={<Shell />}><Route path="/" element={<MissionOverview />} /><Route path="/mission" element={<MissionOverview />} />
    {Object.keys(pageDetails).map((path) => <Route key={path} path={path} element={<SecondaryPage />} />)}
    <Route path="*" element={<MissionOverview />} />
  </Route></Routes>
}

export default App
