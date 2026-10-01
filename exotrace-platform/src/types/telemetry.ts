export interface TelemetryPoint {
  timestampUtc: string
  busVoltageV: number
  currentA: number
  batteryStatePercent: number
  temperatureC: number
  communicationSnrDb: number
  attitudeErrorDeg: number
  anomalous: boolean
}