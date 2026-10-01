import { AlertTriangle } from 'lucide-react'

export function DemoDataNotice({ children = 'Simulated fixture values; not validated spacecraft telemetry or a diagnosis.' }: { children?: string }) {
  return <div className="data-caveat" role="note">
    <AlertTriangle size={13} aria-hidden="true" />
    <span><strong>DEMO DATA</strong> · {children}</span>
  </div>
}