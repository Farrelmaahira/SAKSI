import { villageById } from '@/lib/master/village-by-id'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageHeads } from '@/data/master'

export function draftContext(villageId: string, counterpartyId: string) {
  const village = villageById(villageId)!
  const party = counterpartyById(counterpartyId) ?? { id: '', name: 'Pihak kedua', type: 'Penyedia' as const, address: '', email: '', contact: '-' }
  return { village, head: villageHeads[villageId] ?? '-', party }
}
