'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import NotAllowed from '@/components/molecules/NotAllowed'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { isActive } from '@/lib/db/is-active'
import PihakTermin from '@/components/organisms/PihakTermin'
import InspTermin from '@/components/organisms/InspTermin'

export default function TerminTemplate() {
  const { session } = useDash()
  const d = db.use()
  const r = session.role.role
  if (r !== 'pihak_kedua' && r !== 'inspektorat') return <NotAllowed />
  const contracts = scopeContracts(d, session.role).filter((c) => isActive(c) || c.status === 'selesai')
  return r === 'pihak_kedua' ? <PihakTermin contracts={contracts} /> : <InspTermin contracts={contracts} />
}
