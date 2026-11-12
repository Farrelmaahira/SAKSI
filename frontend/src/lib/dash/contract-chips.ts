import type { KontrakFilter } from '@/interfaces/dash'
import type { DContract } from '@/interfaces/db'
import { groupOf } from '@/lib/dash/group-of'

interface Chip {
  key: KontrakFilter
  label: string
  count: number
}

/* Filter chips of the contract list with their counts; "Draf" is for villages, "Dibatalkan" only appears when there are some. */
export function contractChips(all: DContract[], needsMe: (c: DContract) => boolean, isDesa: boolean): Chip[] {
  const count = (f: KontrakFilter) => (f === 'semua' ? all.length : f === 'tindakan' ? all.filter(needsMe).length : all.filter((c) => groupOf(c) === f).length)
  return [
    { key: 'semua', label: 'Semua', count: count('semua') },
    { key: 'tindakan', label: 'Perlu tindakan saya', count: count('tindakan') },
    ...(isDesa ? [{ key: 'draf' as const, label: 'Draf', count: count('draf') }] : []),
    { key: 'proses', label: 'Tinjau & tanda tangan', count: count('proses') },
    { key: 'aktif', label: 'Berjalan', count: count('aktif') },
    { key: 'selesai', label: 'Selesai', count: count('selesai') },
    ...(count('batal') ? [{ key: 'batal' as const, label: 'Dibatalkan', count: count('batal') }] : []),
  ]
}
