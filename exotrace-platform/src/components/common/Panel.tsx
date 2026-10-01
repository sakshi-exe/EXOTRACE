import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface PanelProps {
  title: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, icon: Icon, action, className = '', children }: PanelProps) {
  return <section className={`panel ${className}`}>
    <div className="panel-heading">
      <h2 className="panel-title">{Icon && <Icon size={14} aria-hidden="true" />}{title}</h2>
      {action}
    </div>
    {children}
  </section>
}