import type { AnomalySeverity } from '../../types/anomaly'

export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  return <span className={`severity-badge ${severity.toLowerCase()}`}>
    <span className="severity-indicator" aria-hidden="true" />{severity}
  </span>
}