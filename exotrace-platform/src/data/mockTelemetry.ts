import type { TelemetryPoint } from '../types/telemetry'

const SAMPLE_COUNT = 24
const WINDOW_MINUTES = 43
const PRECURSOR_MINUTE = 6

function formatMissionTime(minutesAfterStart: number): string {
  const totalMinutes = 14 * 60 + 5 + minutesAfterStart
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const minutes = (totalMinutes % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:00 UTC`
}

function createDemoPoint(index: number): TelemetryPoint {
  const progress = index / (SAMPLE_COUNT - 1)
  const elapsedMinutes = Math.round(progress * WINDOW_MINUTES)
  const powerDrift = Math.max(0, (elapsedMinutes - PRECURSOR_MINUTE) / (WINDOW_MINUTES - PRECURSOR_MINUTE))
  const thermalDrift = Math.max(0, (elapsedMinutes - 17) / 26)
  const communicationDrift = Math.max(0, (elapsedMinutes - 26) / 17)
  const attitudeDrift = Math.max(0, (elapsedMinutes - 34) / 9)
  const fluctuation = Math.sin(index * 1.7)

  return {
    timestampUtc: formatMissionTime(elapsedMinutes),
    busVoltageV: Number((28.2 - powerDrift * 5.4 + fluctuation * 0.12).toFixed(2)),
    currentA: Number((4.1 - powerDrift * 1.25 + Math.sin(index * 2.3) * powerDrift * 0.48).toFixed(2)),
    batteryStatePercent: Number((94 - powerDrift * 24 - index * 0.08).toFixed(1)),
    temperatureC: Number((22.8 + thermalDrift * 7.3 + fluctuation * 0.18).toFixed(1)),
    communicationSnrDb: Number((12.1 - communicationDrift * 8.7 + fluctuation * 0.22).toFixed(1)),
    attitudeErrorDeg: Number((0.18 + attitudeDrift * 2.5 + Math.abs(fluctuation) * attitudeDrift * 0.16).toFixed(2)),
    anomalous: elapsedMinutes >= PRECURSOR_MINUTE,
  }
}

export const mockTelemetry: TelemetryPoint[] = Array.from(
  { length: SAMPLE_COUNT },
  (_, index) => createDemoPoint(index),
)