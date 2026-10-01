import {
  Activity, BrainCircuit, Clock3, Database, FileText, Satellite,
  Settings, ShieldAlert, Waypoints,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

export const missionNavigation: NavigationItem[] = [
  { label: 'Mission Overview', path: '/mission', icon: Satellite },
  { label: 'Telemetry Explorer', path: '/telemetry', icon: Activity },
  { label: 'Anomaly Detection', path: '/anomalies', icon: ShieldAlert },
  { label: 'Failure Timeline', path: '/timeline', icon: Clock3 },
  { label: 'Causal Analysis', path: '/causal', icon: Waypoints },
  { label: 'Investigation Report', path: '/investigation', icon: FileText },
]

export const systemNavigation: NavigationItem[] = [
  { label: 'Data Sources', path: '/data-sources', icon: Database },
  { label: 'Model Status', path: '/models', icon: BrainCircuit },
  { label: 'Settings', path: '/settings', icon: Settings },
]