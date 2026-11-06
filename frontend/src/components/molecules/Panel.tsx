import { ReactNode } from 'react'

interface Props { title?: string; action?: ReactNode; children: ReactNode; className?: string; desc?: string }

export default function Panel({ title, action, children, className = '', desc }: Props) {
  return (
    <section className={`d-panel ${className}`}>
      {(title || action) && (
        <header className="d-panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {desc && <p>{desc}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}
