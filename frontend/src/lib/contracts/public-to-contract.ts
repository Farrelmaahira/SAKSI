import type { DContract } from '@/interfaces/db'
import type { TemplateKey } from '@/interfaces/drafting'
import type { PublicContractSummary } from '@/lib/api/reports'

const DAY = '2026-11-06'

/* A published contract from the public list, as a read-only contract for the citizen (no clauses, no history). Without the server id nothing else is fetched for it. */
export const publicToContract = (c: PublicContractSummary, withServerId = true): DContract => ({
  apiId: withServerId ? c.id : undefined,
  code: c.nomor,
  title: c.judul,
  template: (c.jenis as TemplateKey) || 'pengadaan',
  counterpartyId: 'cp-maju',
  villageId: 'sukamaju',
  status: c.status === 'selesai' ? 'selesai' : 'berjalan',
  createdAt: DAY,
  versions: [
    {
      no: 1,
      at: DAY,
      answers: { work: c.judul, value: c.nilai, deadline: c.tenggat || '2026-12-31', scheme: 'Sekaligus', terms: 1, method: 'Pengadaan Langsung' },
      clauses: [],
      audit: { at: DAY, score: 100, findings: [] },
    },
  ],
  reviews: [],
  signatures: {},
  seals: [],
  terms: [],
  progress: [],
  history: [],
  selfReport: false,
})
