import { useDash } from '@/hooks/use-dash'
import { villages } from '@/data/master'
import { scopeAllReports } from '@/lib/dash/scope-all-reports'
import { db } from '@/lib/db/db'
import { isClosed } from '@/lib/db/is-closed'
import { riskOf } from '@/lib/db/risk-of'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'

/* The regency auditor's home: contracts and reports in the region, escalations, and contracts ranked by risk. */
export function useInspHome() {
  const { session } = useDash()
  const d = db.use()
  const r = session.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const regionVillages = villages.filter((v) => v.regionId === r.regionId)
  const openEsc = reports.filter((x) => x.flow === 'diteruskan')
  const risky = contracts.map((c) => ({ c, ...riskOf(c, scopeAllReports(d, c.villageId)) })).sort((a, b) => b.score - a.score)

  // per village of the region: its contracts and its open (not closed) citizen reports
  const villageRows = regionVillages.map((v) => ({ v, contracts: contracts.filter((c) => c.villageId === v.id), openReports: scopeAllReports(d, v.id).filter((x) => !isClosed(x)).length }))

  return { session, role: r, contracts, villageRows, openEsc, risky }
}
