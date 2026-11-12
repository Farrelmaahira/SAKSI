import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/hooks/use-notifications'
import type { Session } from '@/interfaces/auth'
import type { Notif } from '@/interfaces/notifications'
import { db } from '@/lib/db/db'
import { notificationsFor } from '@/lib/notifications/notifications-for'
import { toNotif } from '@/lib/notifications/to-notif'
import { useReadIds } from '@/lib/notifications/use-read-ids'

/* The bell's panel: to-dos derived on this device plus server activity, which are unread, and which tab is open. */
export function useNotificationPanel(session: Session) {
  const d = db.use()
  const server = useNotifications(session.userId)
  const read = useReadIds(session.userId)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const [tab, setTab] = useState<Notif['kind']>(session.role.role === 'warga' ? 'aktivitas' : 'tindakan')

  // Perlu tindakan: derived on this device; Aktivitas: GET /notifications
  const todos = notificationsFor(session, d)
  const all = [...todos, ...server.items.map(toNotif)]
  const seen = new Set([...read, ...server.items.filter((n) => n.dibaca).map((n) => `n:${n.id}`)])
  const unread = all.filter((n) => !seen.has(n.id))

  // Close the panel when the page changes.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  return {
    open,
    toggle: () => setOpen((o) => !o),
    setOpen,
    tab,
    setTab,
    server,
    todos,
    seen,
    unread,
    shown: all.filter((n) => n.kind === tab),
    count: (k: Notif['kind']) => unread.filter((n) => n.kind === k).length,
  }
}
