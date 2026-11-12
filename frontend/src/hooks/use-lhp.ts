import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import type { ApiResult, AuditReport, TerminListItem } from '@/interfaces/api'
import { listAuditReports } from '@/lib/api/list-audit-reports'
import { listTermin } from '@/lib/api/list-termin'

/* Uji petik and LHP: inspektorat writes and publishes; desa and BPD read the published ones of their village. */
export function useLhp() {
  const { session } = useDash()
  const role = session.role.role
  const isInsp = role === 'inspektorat'
  const allowed = isInsp || role === 'perangkat_desa' || role === 'bpd'
  const [list, setList] = useState<ApiResult<AuditReport[]> | null>(null)
  const [contracts, setContracts] = useState<ApiResult<TerminListItem[]> | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!allowed) return
    let active = true
    listAuditReports().then((x) => active && setList(x))
    return () => {
      active = false
    }
  }, [allowed, reload])

  // contracts in the inspektorat's scope that are signed or later (GET /termin)
  useEffect(() => {
    if (!isInsp) return
    let active = true
    listTermin().then((x) => active && setContracts(x))
    return () => {
      active = false
    }
  }, [isInsp])

  return { session, isInsp, allowed, list, contracts, open, setOpen, refresh: () => setReload((n) => n + 1) }
}
