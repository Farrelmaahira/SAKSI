import type { CounterpartyResponse } from '@/lib/api/contracts'
import type { Counterparty, CounterpartyType } from '@/interfaces/master'

const TYPES: Record<string, CounterpartyType> = { umkm: 'UMKM', bumdes: 'BUMDes', penerima_hibah: 'Penerima hibah', penyewa: 'Penyewa' }

/* Maps a backend counterparty to the store shape. The email is the real account email from the server, never derived from the name. */
export function toCounterparty(c: CounterpartyResponse): Counterparty {
  return {
    id: String(c.id),
    name: c.nama,
    type: TYPES[c.jenis?.toLowerCase() ?? ''] ?? 'Penyedia',
    email: c.email ?? '',
    contact: c.kontak ?? '',
    address: c.alamat || '-',
    invited: false,
  }
}
