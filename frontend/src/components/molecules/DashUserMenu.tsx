'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import { useOutsideClose } from '@/hooks/use-outside-close'
import type { Session } from '@/interfaces/auth'
import { initials } from '@/lib/dash/initials'

interface Props {
  session: Session
  onSignOut: () => void
}

export default function DashUserMenu({ session, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useOutsideClose(open, ref, close)

  return (
    <div className="app-user" ref={ref}>
      <button type="button" className="app-user-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="app-avatar">{initials(session.name)}</span>
        <span className="app-user-text">
          <strong>{session.name}</strong>
          <small>{session.role.title}</small>
        </span>
      </button>
      {open && (
        <div className="app-user-menu" role="menu">
          <p>
            <strong>{session.name}</strong>
            <small>{session.email}</small>
          </p>
          <Link role="menuitem" href="/dashboard/profil" onClick={close}>
            <Icon name="user" />
            Profil
          </Link>
          <button role="menuitem" type="button" onClick={onSignOut}>
            <Icon name="logout" />
            Keluar
          </button>
        </div>
      )}
    </div>
  )
}
