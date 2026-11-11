'use client'

import FormAlert from '@/components/atoms/FormAlert'
import Activity from '@/components/molecules/Activity'
import { useActivity } from '@/hooks/use-activity'

interface Props {
  limit: number
  /* only the lines of this contract (server id) */
  contractId?: number
  empty?: string
}

/* Recent actions from the server's audit log, with loading and error states */
export default function ActivityFeed({ limit, contractId, empty }: Props) {
  const { items, error, loading } = useActivity(limit, contractId)
  if (loading) return <p className="text-[1.4rem] text-dim" role="status">Memuat aktivitas…</p>
  if (error) return <FormAlert>{error}</FormAlert>
  return <Activity logs={items} empty={empty} />
}
