import { Activity } from 'lucide-react'
import {
  CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { mockTelemetry } from '../../data/mockTelemetry'
import type { TelemetryPoint } from '../../types/telemetry'
import { Panel } from '../common/Panel'

type SignalKey = Exclude<keyof TelemetryPoint, 'timestampUtc' | 'anomalous'>

interface SignalDefinition {
  key: SignalKey
  label: string
  unit: string
  color: string
}

const signals: SignalDefinition[] = [
  { key: 'busVoltageV', label: 'Bus Voltage', unit: 'V', color: '#64b5f6' },
  { key: 'currentA', label: 'Current', unit: 'A', color: '#62d3df' },
  { key: 'batteryStatePercent', label: 'Battery State', unit: '%', color: '#7bcba5' },
  { key: 'temperatureC', label: 'Temperature', unit: '°C', color: '#e6ad5b' },
  { key: 'communicationSnrDb', label: 'Communication SNR', unit: 'dB', color: '#91aef1' },
  { key: 'attitudeErrorDeg', label: 'Attitude Error', unit: '°', color: '#ed8585' },
]

function formatTime(value: string): string {
  return value.slice(0, 5)
}

function SignalChart({ signal }: { signal: SignalDefinition }) {
  return <article className="signal-chart" aria-label={`${signal.label} demo telemetry over time`}>
    <h3>{signal.label}<span>{signal.unit}</span></h3>
    <ResponsiveContainer width="100%" height={124}>
      <LineChart data={mockTelemetry} margin={{ top: 7, right: 5, bottom: 1, left: -22 }}>
        <CartesianGrid stroke="#1c2a38" strokeDasharray="2 5" vertical={false} />
        <XAxis dataKey="timestampUtc" tickFormatter={formatTime} interval={11} tick={{ fill: '#748597', fontSize: 8, fontFamily: 'DM Mono' }} axisLine={{ stroke: '#263644' }} tickLine={false} />
        <YAxis width={42} tick={{ fill: '#748597', fontSize: 8, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip labelFormatter={(label) => `${String(label)} · DEMO DATA`} formatter={(value) => [`${String(value)} ${signal.unit}`, signal.label]} contentStyle={{ background: '#111b27', border: '1px solid #2b3a4a', color: '#e7edf5', fontSize: 9 }} />
        <ReferenceArea x1="14:11:00 UTC" x2="14:48:00 UTC" fill="#e6ad5b" fillOpacity={0.055} />
        <ReferenceLine x="14:11:00 UTC" stroke="#e6ad5b" strokeDasharray="3 4" />
        <Line type="monotone" dataKey={signal.key} name={signal.label} stroke={signal.color} strokeWidth={1.7} dot={false} activeDot={{ r: 3 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </article>
}

export function TelemetryPanel({ className = '' }: { className?: string }) {
  return <Panel title="TELEMETRY · SYNCHRONIZED SIGNALS" icon={Activity} className={`chart-panel page-panel wide ${className}`}>
    <div className="chart-annotation"><span className="anomaly-key" />Shaded region: demo anomaly interval beginning 14:11 UTC <span className="chart-note">All channels · UTC</span></div>
    <div className="signal-grid">{signals.map((signal) => <SignalChart key={signal.key} signal={signal} />)}</div>
  </Panel>
}