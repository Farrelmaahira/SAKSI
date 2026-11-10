import type { ApiNotification } from '@/interfaces/api'
import type { Notif } from '@/interfaces/notifications'

const TITLES: Record<string, string> = {
  kontrak_ditinjau: 'Pihak kedua mengirim tinjauan',
  kontrak_ditandatangani: 'Kontrak ditandatangani',
  kontrak_disegel: 'Kontrak disegel',
  laporan_baru: 'Laporan warga baru',
  progres_dilaporkan: 'Progres pekerjaan dilaporkan',
  termin_dibayar: 'Termin dibayar',
  lhp_terbit: 'LHP diterbitkan Inspektorat',
  pengawas_ditugaskan: 'Anda ditugaskan mengawasi kontrak',
  laporan_ditanggapi: 'Laporan Anda ditanggapi',
  laporan_diteruskan: 'Laporan Anda diteruskan',
  laporan_ditutup: 'Laporan Anda ditutup',
}

const RED = new Set(['laporan_baru', 'lhp_terbit'])

/* Server notification -> list row. tautan is untrusted: only same-site paths; report detail has no page yet, so it opens the report list. */
export function toNotif(n: ApiNotification): Notif {
  const path = typeof n.tautan === 'string' && n.tautan.startsWith('/') && !n.tautan.startsWith('//') && !n.tautan.includes('\\') ? n.tautan : '/dashboard'
  return {
    id: `n:${n.id}`,
    kind: 'aktivitas',
    title: TITLES[n.jenis] ?? 'Pemberitahuan',
    text: n.pesan,
    to: /^\/dashboard\/laporan\/\d+/.test(path) ? '/dashboard/laporan' : path,
    at: n.dibuatPada,
    tone: RED.has(n.jenis) ? 'red' : n.jenis === 'termin_dibayar' || n.jenis === 'kontrak_disegel' ? 'blue' : 'ink',
  }
}
