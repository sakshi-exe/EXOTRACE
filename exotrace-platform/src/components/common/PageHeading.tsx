import type { ReactNode } from 'react'

interface PageHeadingProps {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeading({ eyebrow, title, subtitle, actions }: PageHeadingProps) {
  return <div className="page-heading">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {actions && <div className="heading-actions">{actions}</div>}
  </div>
}