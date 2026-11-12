import { useState } from 'react'
import type { DContract } from '@/interfaces/db'
import { payTerm } from '@/lib/api/pay-term'
import { setTermin } from '@/lib/api/set-termin'
import { daysFromNow } from '@/lib/dates/days-from-now'
import { latestVersion } from '@/lib/db/latest-version'
import { markPaid } from '@/lib/db/mark-paid'
import { mkTerms } from '@/lib/db/mk-terms'

/* Create the payment schedule and mark terms paid: on the server for server contracts, locally otherwise. */
export function useTerminActions(c: DContract, reload: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // server contracts: the desa sets the schedule once, proposed from the drafted payment scheme
  const createSchedule = async () => {
    if (!c.apiId) return
    setBusy(true)
    setError('')
    const r = await setTermin(c.apiId, mkTerms(latestVersion(c).answers, daysFromNow(0)).map((x) => ({ persen: x.percent, jatuhTempo: x.planDate })))
    setBusy(false)
    if (!r.ok) return setError(r.error)
    reload()
  }

  const pay = async (no: number, termApiId?: number) => {
    if (!c.apiId || !termApiId) return markPaid(c.code, no)
    setBusy(true)
    setError('')
    const r = await payTerm(c.apiId, termApiId)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    reload()
  }

  return { busy, error, createSchedule, pay }
}
