import type { TimelineEvent } from '../types/anomaly'

export const mockTimeline: TimelineEvent[] = [
  { timestampUtc: '14:11:08 UTC', subsystem: 'POWER', description: 'Voltage instability detected', severity: 'HIGH' },
  { timestampUtc: '14:16:42 UTC', subsystem: 'POWER', description: 'Current fluctuation detected', severity: 'HIGH' },
  { timestampUtc: '14:22:07 UTC', subsystem: 'THERMAL', description: 'Temperature deviation detected', severity: 'MEDIUM' },
  { timestampUtc: '14:31:42 UTC', subsystem: 'COMMUNICATION', description: 'Communication degradation', severity: 'CRITICAL' },
  { timestampUtc: '14:43:11 UTC', subsystem: 'ATTITUDE', description: 'Attitude instability', severity: 'MEDIUM' },
  { timestampUtc: '14:48:23 UTC', subsystem: 'SYSTEM', description: 'Subsystem failure', severity: 'CRITICAL' },
]