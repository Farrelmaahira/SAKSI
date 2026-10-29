import { clauses } from '@/data/simulator'
import type { Contract } from '@/interfaces/contract'
import { formatRp } from '@/lib/contracts/format-rp'
import { today } from './today'

/* The contract the simulation produces, holding only the clauses the user placed. */
export function buildSimContract(code: string, placed: string[], v: number): Contract {
  return {
    code,
    type: 'Pengadaan',
    title: 'Pengadaan semen dan pasir untuk perbaikan jalan Dusun Krajan',
    village: 'Desa Sukamaju, Kec. Cibeber',
    first: 'Pemerintah Desa Sukamaju, diwakili Kepala Desa Hendra Wijaya',
    second: 'CV Maju Bersama, diwakili Rina Kartika',
    value: v,
    valueNote: 'termasuk ongkos kirim dan pajak',
    duration: '30 hari kalender',
    start: today(),
    progress: 10,
    clauses: clauses
      .filter((c) => placed.includes(c.id))
      .map((c) => ({ title: c.title, text: c.id === 'nilai' ? `${formatRp(v)}, sudah termasuk ongkos kirim dan pajak.` : c.text })),
    milestones: [
      { label: 'Kontrak disahkan dan dipublikasikan', date: today(), status: 'done' },
      { label: 'Material tiba di balai desa', date: 'Menunggu', status: 'current' },
      { label: 'Pengerjaan jalan', date: 'Belum dimulai', status: 'pending' },
      { label: 'Serah terima dan berita acara', date: 'Target 30 hari', status: 'pending' },
    ],
    reports: [],
    fromSimulation: true,
  }
}
