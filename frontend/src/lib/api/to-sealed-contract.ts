import type { SealedContract } from '@/interfaces/contract'
import type { TemplateKey } from '@/interfaces/drafting'
import type { PublicContractDetail, PublicContractSummary } from '@/lib/api/reports'
import { backendJenis, templates } from '@/data/drafting'
import { fmtDate } from '@/lib/dates/fmt-date'
import { clausesFromText } from '@/lib/api/clauses-from-text'

/* Public API contract -> the shape the public portal renders. Only what the server sends: no invented progress, milestones or reports. */
export function toSealedContract(c: PublicContractSummary | PublicContractDetail): SealedContract {
  const key = (Object.keys(backendJenis) as TemplateKey[]).find((k) => backendJenis[k] === c.jenis)
  const detail = 'isiTeks' in c ? c : null
  return {
    code: c.nomor,
    apiId: c.id,
    type: key ? templates[key].label : c.jenis.replace(/_/g, ' '),
    title: c.judul,
    village: c.villageName || '-',
    first: c.villageName ? `Pemerintah ${c.villageName}` : 'Pemerintah desa',
    second: c.counterpartyNama || 'Pihak kedua',
    value: c.nilai,
    duration: `Sampai ${fmtDate(c.tenggat)}`,
    start: '-',
    progress: c.status === 'selesai' ? 100 : 0,
    clauses: detail ? clausesFromText(detail.isiTeks) : [],
    milestones: [],
    reports: [],
    hash: detail?.sha256Hash ?? '',
  }
}
