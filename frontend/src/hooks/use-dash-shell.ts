import { useEffect } from 'react'
import { useDashActions } from '@/hooks/use-dash-actions'
import { useDashNav } from '@/hooks/use-dash-nav'
import type { Session } from '@/interfaces/auth'
import { useNavCounts } from '@/hooks/use-nav-counts'
import { navFor } from '@/lib/dash/nav-for'
import { wargaAllowed } from '@/lib/dash/warga-allowed'
import { db } from '@/lib/db/db'
import { fillSealHashes } from '@/lib/db/fill-seal-hashes'

/* Everything the dashboard frame needs besides markup: menu items, sidebar state and actions. */
export function useDashShell(session: Session, onLeaving: () => void) {
  const data = db.use()
  const nav = useDashNav()
  const actions = useDashActions(onLeaving)
  const counts = useNavCounts(data, session, nav.path)

  useEffect(() => {
    void fillSealHashes()
  }, [])

  return {
    nav,
    actions,
    items: navFor(session.role.role, counts),
    blocked: session.role.role === 'warga' && !wargaAllowed(nav.path),
  }
}
