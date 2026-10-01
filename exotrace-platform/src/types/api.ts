export interface DemoMetadata {
  data_mode: 'DEMO DATA'
  disclaimer: string
}

export interface ApiResponse {
  metadata: DemoMetadata
}

export interface Mission {
  mission_id: string
  name: string
  status: 'FAILED' | 'ACTIVE' | 'NOMINAL'
  health_percent: number
  anomaly_count: number
  events_reviewed: number
  last_update_utc: string
}

export interface MissionOverviewResponse extends ApiResponse {
  mission: Mission
  subsystem_count: number
}

export interface TelemetryPoint {
  timestamp_utc: string
  channel: string
  value: number
  unit: string
}

export interface TelemetryResponse extends ApiResponse {
  mission_id: string
  points: TelemetryPoint[]
}

export interface AnomalyRecord {
  anomaly_id: string
  timestamp_utc: string
  summary: string
  subsystem: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface AnomalyResponse extends ApiResponse {
  mission_id: string
  anomalies: AnomalyRecord[]
}

export interface TimelineEvent {
  timestamp_utc: string
  summary: string
  subsystem: string
  sequence_index: number
}

export interface TimelineResponse extends ApiResponse {
  mission_id: string
  events: TimelineEvent[]
}

export interface CausalHypothesis {
  hypothesis_id: string
  summary: string
  evidence: string[]
  alternatives: string[]
  illustrative_score: number
  validated: false
}

export interface HypothesisResponse extends ApiResponse {
  mission_id: string
  hypotheses: CausalHypothesis[]
}