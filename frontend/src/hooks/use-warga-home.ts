import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { useNotifications } from '@/hooks/use-notifications'
import type { DReport } from '@/interfaces/db'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import { listReports } from '@/lib/api/list-reports'
import type { PublicContractSummary } from '@/lib/api/reports'
import { toDReport } from '@/lib/api/to-dreport'
import { isClosed } from '@/lib/db/is-closed'
import { toNotif } from '@/lib/notifications/to-notif'

/* The citizen's home: their reports, recent notifications and the published contracts, all from the server. */
export function useWargaHome() {
  const { session } = useDash()
  const server = useNotifications(session.userId)
  const notifs = server.items.map(toNotif)
  const read = server.items.filter((x) => x.dibaca).map((x) => `n:${x.id}`)
  const [reports, setReports] = useState<DReport[]>([])
  const [contracts, setContracts] = useState<PublicContractSummary[]>([])

  useEffect(() => {
    let active = true
    async function loadData() {
      const [reps, cnts] = await Promise.all([
        listReports().then((r) => (r.ok ? r.data : [])),
        listPublicContracts().then((r) => (r.ok ? r.data : [])),
      ])
      if (active) {
        if (reps && reps.length > 0) {
          setReports(reps.map((r) => toDReport(r)))
        }
        if (cnts) {
          setContracts(cnts)
        }
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [session])

  return {
    session,
    server,
    notifs,
    read,
    reports,
    contracts,
    answered: reports.filter((r) => r.actions.length > 0).length,
    inProgress: reports.filter((r) => !isClosed(r)).length,
    closed: reports.filter(isClosed).length,
  }
}
