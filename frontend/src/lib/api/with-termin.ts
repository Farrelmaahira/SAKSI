import type { ContractStatus, DContract } from '@/interfaces/db'
import type { ContractTermin } from '@/interfaces/api'
import { statusOrder } from '@/data/db'

const day = (iso?: string | null) => (iso ? iso.slice(0, 10) : '')

/* Puts the server's SPK, terms and progress onto the local contract so the existing tabs render them unchanged. */
export function withTermin(c: DContract, t: ContractTermin): DContract {
  const terms = t.terms ?? []
  return {
    ...c,
    status: (statusOrder as readonly string[]).includes(t.status) ? (t.status as ContractStatus) : c.status,
    spk: t.spk ? { number: t.spk.nomor, date: day(t.spk.tanggal), start: day(t.spk.mulai), end: day(t.spk.selesai) } : undefined,
    terms: terms.map((x) => ({
      no: x.urutan,
      label: terms.length === 1 ? 'Pembayaran penuh' : `Termin ${x.urutan}`,
      percent: x.persen,
      amount: x.status === 'dibayar' ? (x.realisasiNominal ?? x.nominal) : x.nominal,
      planDate: day(x.jatuhTempo),
      paidDate: x.status === 'dibayar' ? day(x.tanggalRealisasi) || day(x.jatuhTempo) : undefined,
      apiId: x.id,
      submitted: x.status === 'jatuh_tempo',
    })),
    progress: (t.progress ?? []).map((p) => ({
      id: String(p.id),
      percent: p.persenSelesai,
      note: p.catatan,
      at: p.waktu,
      by: p.pelaporNama || 'Pelapor',
      role: 'pihak_kedua',
      photos: p.bukti?.length ?? 0,
    })),
  }
}
