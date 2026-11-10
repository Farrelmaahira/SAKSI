import type { ActionKind, DReport, ReportFlow } from '@/interfaces/db'
import type { CreatedReportResponse } from '@/lib/api/reports'

const KINDS: ActionKind[] = ['tanggapan', 'klarifikasi', 'verifikasi', 'eskalasi', 'selesai', 'tindak_lanjut', 'tutup']

const FLOW: Record<string, ReportFlow> = { diverifikasi: 'diverifikasi', ditindaklanjuti: 'ditindaklanjuti', diteruskan: 'diteruskan', selesai: 'ditutup', ditolak: 'ditutup' }

/* Server citizen report -> dashboard report card shape. contractCode is the local code when this device has the contract, else the server id. */
export function toDReport(r: CreatedReportResponse, contractCode = String(r.contractId)): DReport {
  // submitReport sends "[clause] text - Lokasi: place" because the API has no separate fields
  const m = /^\[([^\]]+)\]\s*([\s\S]*?)(?:\s-\sLokasi:\s(.+))?$/.exec(r.deskripsi)
  return {
    id: r.kodePelacakan,
    apiId: r.id,
    contractCode,
    category: r.kategori.replace(/_/g, ' '),
    clause: m?.[1] ?? '-',
    text: m?.[2] ?? r.deskripsi,
    location: m?.[3] ?? (r.lokasiLat != null && r.lokasiLng != null ? `Koordinat (${r.lokasiLat.toFixed(4)}, ${r.lokasiLng.toFixed(4)})` : undefined),
    date: r.dibuatPada,
    reporter: 'Warga terverifikasi',
    reporterName: r.pelaporNama || undefined,
    photos: r.attachments?.length ?? 0,
    flow: FLOW[r.status] ?? 'baru',
    actions: (r.actions ?? []).map((a) => ({ id: String(a.id), at: a.waktu, by: a.aktorNama || 'Petugas', role: 'bpd', kind: KINDS.find((k) => k === a.tindakan) ?? 'tanggapan', text: a.catatan || a.tindakan })),
  }
}
