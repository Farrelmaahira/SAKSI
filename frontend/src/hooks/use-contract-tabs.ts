import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { allTabs } from '@/data/dash-tabs'
import { tabsFor } from '@/data/dash'
import type { Session } from '@/interfaces/auth'
import type { DContract } from '@/interfaces/db'
import { tabItems } from '@/lib/dash/tab-items'
import { allReports } from '@/lib/db/all-reports'
import { db } from '@/lib/db/db'
import { isClosed } from '@/lib/db/is-closed'

/* The tabs a role sees on a contract, the one picked in the address (?tab=), and a way to switch. */
export function useContractTabs(c: DContract, session: Session) {
  const d = db.use()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const allow = tabsFor[session.role.role]
  const tabs = allTabs.filter((t) => !allow || allow.includes(t.key))
  const wanted = params.get('tab')
  const tab = tabs.some((t) => t.key === wanted) ? wanted! : 'ringkasan'
  const openReports = allReports(d).filter((r) => r.contractCode === c.code && !isClosed(r)).length

  return {
    tab,
    items: tabItems(tabs, c, openReports),
    Active: tabs.find((t) => t.key === tab)!.C,
    go: (k: string) => router.replace(k === 'ringkasan' ? pathname : `${pathname}?tab=${k}`, { scroll: false }),
  }
}
