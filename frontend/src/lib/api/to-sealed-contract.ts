import type { SealedContract } from '@/interfaces/contract'
import type { TemplateKey } from '@/interfaces/drafting'
import type { PublicContractDetail, PublicContractSummary } from '@/lib/api/reports'
import { backendJenis, templates } from '@/data/drafting'
import { fmtDate } from '@/lib/dates/fmt-date'
import { clausesFromText } from '@/lib/api/clauses-from-text'
import { daysUntil } from '@/lib/dates/days-until'
import type { Milestone } from '@/interfaces/contract'

/* Public API contract -> the shape the public portal renders. Only what the server sends: progress and term milestones from `progres`, no invented reports. */
export function toSealedContract(c: PublicContractSummary | PublicContractDetail): SealedContract {
  const key = (Object.keys(backendJenis) as TemplateKey[]).find((k) => backendJenis[k] === c.jenis)
  const detail = 'isiTeks' in c ? c : null
  const p = detail?.progres
  const terms = p?.termin ?? []
  // first unpaid term is the current one; terlambat is computed here from jatuhTempo (the server never sets it)
  const current = terms.findIndex((t) => t.status !== 'dibayar')
  const milestones: Milestone[] = terms.map((t, i) => ({
    label: `Termin ${t.urutan} · ${t.persen}%`,
    date: fmtDate(t.jatuhTempo),
    status: t.status === 'dibayar' ? 'done' : i === current ? 'current' : 'pending',
    note: t.status === 'dibayar' ? 'Sudah dibayar' : t.status === 'jatuh_tempo' ? 'Diajukan untuk dibayar' : daysUntil(t.jatuhTempo) < 0 ? 'Lewat jatuh tempo' : undefined,
  }))
  return {
    code: c.nomor,
    apiId: c.id,
    type: key ? templates[key].label : c.jenis.replace(/_/g, ' '),
    title: c.judul,
    village: c.villageName || '-',
    first: c.villageName ? `Pemerintah ${c.villageName}` : 'Pemerintah desa',
    second: c.counterpartyNama || 'Pihak kedua',
    value: c.nilai,
    duration: `Sampai ${fmtDate(p?.spkSelesai ?? c.tenggat)}`,
    start: p?.spkMulai ? fmtDate(p.spkMulai) : '-',
    progress: p ? Math.round(p.persenTerakhir) : c.status === 'selesai' ? 100 : 0,
    clauses: detail ? clausesFromText(detail.isiTeks) : [],
    milestones,
    paidPercent: p ? Math.round(p.persenDibayar) : undefined,
    reports: [],
    hash: detail?.sha256Hash ?? '',
  }
}
