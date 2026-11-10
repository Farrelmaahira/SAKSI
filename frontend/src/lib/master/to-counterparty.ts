import type { CounterpartyResponse } from '@/lib/api/contracts'
import type { Counterparty, CounterpartyType } from '@/interfaces/master'

const TYPES: Record<string, CounterpartyType> = { umkm: 'UMKM', bumdes: 'BUMDes', penerima_hibah: 'Penerima hibah', penyewa: 'Penyewa' }

/* Maps a backend counterparty to the store shape; the backend sends no email, so a placeholder one is derived from the name. */
export function toCounterparty(c: CounterpartyResponse): Counterparty {
  return {
    id: String(c.id),
    name: c.nama,
    type: TYPES[c.jenis?.toLowerCase() ?? ''] ?? 'Penyedia',
    email: `${c.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@rekanan.id`,
    contact: c.nama,
    address: c.alamat || '-',
    invited: false,
  }
}
