import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { fillSealHashes } from '@/lib/db/fill-seal-hashes'

export function resetDemo() {
  db.reset()
  auditStore.reset()
  void fillSealHashes()
}
