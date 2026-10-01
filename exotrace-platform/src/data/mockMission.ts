import type { Mission } from '../types/mission'
import type { SubsystemStatus } from '../types/anomaly'
import type { Investigation } from '../types/investigation'

export const mockMission = {
  id: 'SAT-X01',
  name: 'SAT-X01',
  state: 'FAILED',
  healthPercent: 42,
  anomalyCount: 17,
  criticalEventCount: 4,
  firstPrecursorMinutes: 37,
  lastUpdateUtc: '14:48:23 UTC',
  dataMode: 'DEMO DATA',
} satisfies Mission

export const mockSubsystemStatuses = [
  { name: 'POWER', state: 'CRITICAL', detail: 'Bus voltage variance' },
  { name: 'THERMAL', state: 'WARNING', detail: 'Battery temperature trend' },
  { name: 'COMMUNICATION', state: 'CRITICAL', detail: 'Signal-to-noise degradation' },
  { name: 'ATTITUDE CONTROL', state: 'WARNING', detail: 'Pointing error increased' },
  { name: 'ONBOARD COMPUTER', state: 'CRITICAL', detail: 'Subsystem failure reported' },
  { name: 'PAYLOAD', state: 'DEGRADED', detail: 'Standby state reported' },
] satisfies SubsystemStatus[]

export const mockInvestigation = {
  id: 'INV-SAT-X01-DEMO',
  missionId: mockMission.id,
  state: 'COMPLETE',
  summary: 'Demonstration sequence assembled; no validated failure conclusion.',
  completedAtUtc: mockMission.lastUpdateUtc,
  hypothesisCount: 3,
  dataMode: 'DEMO DATA',
} satisfies Investigation