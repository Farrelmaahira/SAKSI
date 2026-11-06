import { db } from '@/lib/db/db'
import { sha256 } from '@/lib/contracts/sha256'
import { canonicalText } from '@/lib/db/canonical-text'

/* Seed seals are stored without a hash; compute the real SHA-256 once in the browser */
export async function fillSealHashes() {
  const missing = db.get().contracts.filter((c) => c.seals.some((x) => !x.hash))
  if (!missing.length) return
  const hashes = await Promise.all(missing.map((c) => sha256(canonicalText(c))))
  db.set((d) => ({
    ...d,
    contracts: d.contracts.map((c) => {
      const i = missing.findIndex((m) => m.code === c.code)
      return i < 0 ? c : { ...c, seals: c.seals.map((x) => (x.hash ? x : { ...x, hash: hashes[i] })) }
    }),
  }))
}
