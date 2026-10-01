import type { Anomaly } from '../types/anomaly'

export const mockAnomalies: Anomaly[] = [
  { id: 'AN-017', timestampUtc: '14:11:08 UTC', subsystem: 'POWER', title: 'Voltage instability detected', detail: 'Bus voltage varied from its preceding demonstration baseline.', severity: 'HIGH' },
  { id: 'AN-016', timestampUtc: '14:16:42 UTC', subsystem: 'POWER', title: 'Current fluctuation detected', detail: 'Current series shows increased variation in the mock trace.', severity: 'HIGH' },
  { id: 'AN-015', timestampUtc: '14:22:07 UTC', subsystem: 'THERMAL', title: 'Temperature deviation detected', detail: 'Battery temperature trend departs from the mock baseline.', severity: 'MEDIUM' },
  { id: 'AN-014', timestampUtc: '14:31:42 UTC', subsystem: 'COMMUNICATION', title: 'Communication degradation', detail: 'Signal-to-noise ratio trends downward in the mock trace.', severity: 'CRITICAL' },
  { id: 'AN-013', timestampUtc: '14:43:11 UTC', subsystem: 'ATTITUDE', title: 'Attitude instability', detail: 'Attitude error increases in the mock trace.', severity: 'MEDIUM' },
]