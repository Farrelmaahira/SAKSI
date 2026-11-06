import type { Session } from '@/interfaces/auth'
import type { Db } from '@/interfaces/db'
import type { NavCounts } from '@/interfaces/dash'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isClosed } from '@/lib/db/is-closed'
import { nextStep } from '@/lib/db/next-step'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'

/* Badges on the sidebar: what is waiting for this role */
export function navCounts(data: Db, session: Session): NavCounts {
  const role = session.role
  const reports = scopeReports(data, role)
  const contracts = scopeContracts(data, role)
  return {
    reports:
      role.role === 'perangkat_desa'
        ? reports.filter((r) => !isClosed(r) && !desaAnswered(r)).length
        : role.role === 'bpd'
          ? reports.filter((r) => r.flow === 'baru').length
          : reports.filter((r) => r.flow === 'diteruskan').length,
    contracts: contracts.filter((c) => nextStep(c)?.who === role.role && nextStep(c)?.tab !== 'progres').length,
  }
}
