'use client'

import Icon from '@/components/atoms/Icon'
import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'primary' | 'dark' | 'ghost' | 'danger' | 'light'
  icon?: string
  to?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  small?: boolean
}

/* Compact action button for panels and tables. Primary = blue, dark = ink, ghost = outline. */

export default function Btn({ children, variant = 'primary', icon, to, onClick, type = 'button', disabled, small }: Props) {
  const cls = `dbtn dbtn-${variant} ${small ? 'dbtn-sm' : ''}`
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  )
  if (to)
    return (
      <Link className={cls} href={to}>
        {inner}
      </Link>
    )
  return (
    <button className={cls} type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  )
}
