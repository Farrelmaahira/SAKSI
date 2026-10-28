import Link from 'next/link'
import type { ReactNode } from 'react'

export interface PillButtonProps {
  children: string
  tone?: 'light' | 'blue' | 'ink'
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}

/* Pill button: rolling label and a fill that rises from the bottom. Renders a Link, anchor, or button. */
export default function PillButton({ children, tone = 'light', to, href, onClick, type = 'button', disabled }: PillButtonProps) {
  const inner: ReactNode = (
    <>
      <span className="pill-fill" />
      <span className="pill-label">
        <span className="pill-roll">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
      </span>
    </>
  )
  const className = `pill pill-${tone}`
  if (to)
    return (
      <Link className={className} href={to}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a className={className} href={href}>
        {inner}
      </a>
    )
  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  )
}
