'use client'

import type { Session } from '@/interfaces/auth'
import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { useReadIds } from '@/lib/notifications/use-read-ids'
import { useCallback, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useOutsideClose } from '@/hooks/use-outside-close'
import type { Notif } from '@/interfaces/notifications'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import Icon from '@/components/atoms/Icon'
import { markRead } from '@/lib/notifications/mark-read'
import Link from 'next/link'
import { when } from '@/lib/dash/when'

interface Props { session: Session }

export default function Notifications({ session }: Props) {
  const d = db.use()
  const logs = auditStore.use()
  const read = useReadIds(session.userId)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const [tab, setTab] = useState<Notif['kind']>(session.role.role === 'warga' ? 'aktivitas' : 'tindakan')
  const ref = useRef<HTMLDivElement>(null)

  const all = notificationsFor(session, d, logs)
  const unread = all.filter((n) => !read.includes(n.id))
  const shown = all.filter((n) => n.kind === tab)
  const count = (k: Notif['kind']) => unread.filter((n) => n.kind === k).length

  // Close the panel when the page changes.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  const close = useCallback(() => setOpen(false), [])
  useOutsideClose(open, ref, close)

  return (
    <div className="app-notif" ref={ref}>
      <button
        type="button"
        className={`app-icon-btn app-bell ${open ? 'is-on' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread.length ? `Notifikasi, ${unread.length} belum dibaca` : 'Notifikasi'}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" />
        {unread.length > 0 && <span className="app-bell-count">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      {open && (
        <div className="app-notif-panel" role="dialog" aria-label="Notifikasi">
          <header>
            <strong>Notifikasi</strong>
            <button type="button" className="d-link" disabled={!unread.length} onClick={() => markRead(session.userId, all.map((n) => n.id))}>
              Tandai semua dibaca
            </button>
          </header>
          <div className="app-notif-tabs" role="tablist">
            {(['tindakan', 'aktivitas'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
                {k === 'tindakan' ? 'Perlu tindakan' : 'Aktivitas'}
                {count(k) > 0 && <span>{count(k)}</span>}
              </button>
            ))}
          </div>
          {shown.length ? (
            <ul>
              {shown.map((n) => {
                const isNew = !read.includes(n.id)
                return (
                  <li key={n.id}>
                    <Link href={n.to} className={isNew ? 'is-new' : ''} onClick={() => markRead(session.userId, [n.id])}>
                      <span className={`app-notif-mark tone-${n.tone}`} aria-hidden="true">
                        <Icon name={n.kind === 'aktivitas' ? 'clock' : n.tone === 'red' ? 'alert' : 'arrow'} />
                      </span>
                      <span className="app-notif-body">
                        <strong>{n.title}</strong>
                        <small>{n.text}</small>
                        <small>{when(n.at)}</small>
                      </span>
                      {isNew && <span className="app-notif-dot" aria-label="Belum dibaca" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="app-notif-empty">{tab === 'tindakan' ? 'Tidak ada yang menunggu Anda.' : 'Belum ada aktivitas dari pihak lain.'}</p>
          )}
        </div>
      )}
    </div>
  )
}
