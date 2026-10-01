import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  state?: 'critical' | 'warning' | 'nominal' | 'default'
}

export function MetricCard({ label, value, detail, icon: Icon, state = 'default' }: MetricCardProps) {
  return <section className="metric-card" aria-label={`${label}: ${value}`}>
    <div className="metric-top"><span>{label}</span><Icon className="metric-icon" size={14} aria-hidden="true" /></div>
    <div className={`metric-value ${state}`}>{value}</div>
    <div className="metric-detail">{detail}</div>
  </section>
}