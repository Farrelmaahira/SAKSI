import { ReactNode } from 'react'

interface Props { label: string; title: string; desc?: string; actions?: ReactNode }

export default function PageHead({ label, title, desc, actions }: Props) {
  return (
    <header className="d-head">
      <div>
        <p className="d-label">{label}</p>
        <h1 className="d-title">{title}</h1>
        {desc && <p className="d-desc">{desc}</p>}
      </div>
      {actions && <div className="d-head-actions">{actions}</div>}
    </header>
  )
}
