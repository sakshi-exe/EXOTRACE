export interface Mission {
  id: string
  name: string
  state: 'FAILED' | 'ACTIVE' | 'NOMINAL'
  healthPercent: number
  anomalyCount: number
  criticalEventCount: number
  firstPrecursorMinutes: number
  lastUpdateUtc: string
  dataMode: 'DEMO DATA'
}