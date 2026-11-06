import { ReactNode } from 'react'
import Icon from '@/components/atoms/Icon'
import Link from 'next/link'

interface Props { label: string; value: ReactNode; hint?: string; tone?: 'blue' | 'red' | 'ink'; to?: string; icon?: string }

export default function Stat({ label, value, hint, tone = 'blue', to, icon }: Props) {
  const body = (
    <>
      <div className="d-stat-top">
        <span>{label}</span>
        {icon && <Icon name={icon} />}
      </div>
      <strong>{value}</strong>
      {hint && <small>{hint}</small>}
    </>
  )
  return to ? (
    <Link className={`d-stat tone-${tone}`} href={to}>
      {body}
    </Link>
  ) : (
    <div className={`d-stat tone-${tone}`}>{body}</div>
  )
}
