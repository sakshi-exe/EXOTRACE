import type {
  AnomalyResponse,
  HypothesisResponse,
  MissionOverviewResponse,
  TelemetryResponse,
  TimelineResponse,
} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`EXOTRACE API request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export const exotraceApi = {
  missionOverview: (missionId: string) => get<MissionOverviewResponse>(`/missions/${missionId}/overview`),
  telemetry: (missionId: string) => get<TelemetryResponse>(`/missions/${missionId}/telemetry`),
  anomalies: (missionId: string) => get<AnomalyResponse>(`/missions/${missionId}/anomalies`),
  timeline: (missionId: string) => get<TimelineResponse>(`/missions/${missionId}/timeline`),
  hypotheses: (missionId: string) => get<HypothesisResponse>(`/missions/${missionId}/hypotheses`),
}