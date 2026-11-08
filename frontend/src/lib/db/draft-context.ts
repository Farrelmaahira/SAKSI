import { villageById } from '@/lib/master/village-by-id'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageHeads, villages } from '@/data/master'

export function draftContext(villageId: string, counterpartyId: string) {
  const village = villageById(villageId) ?? villages[0]
  const party = counterpartyById(counterpartyId) ?? { id: '', name: 'Pihak kedua', type: 'Penyedia' as const, address: '', email: '', contact: '-' }
  const head = villageHeads[village.id] ?? villageHeads[villageId] ?? 'Kepala Desa'
  return { village, head, party }
}
