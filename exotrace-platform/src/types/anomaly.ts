export type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface Anomaly {
  id: string
  timestampUtc: string
  subsystem: string
  title: string
  detail: string
  severity: AnomalySeverity
}

export interface TimelineEvent {
  timestampUtc: string
  subsystem: string
  description: string
  severity: AnomalySeverity
}

export interface SubsystemStatus {
  name: string
  state: 'CRITICAL' | 'WARNING' | 'DEGRADED' | 'NOMINAL'
  detail: string
}