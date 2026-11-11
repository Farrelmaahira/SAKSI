import { db } from '@/lib/db/db'
import { fillSealHashes } from '@/lib/db/fill-seal-hashes'

export function resetDemo() {
  db.reset()
  void fillSealHashes()
}
