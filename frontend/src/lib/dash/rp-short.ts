import { formatRp } from '@/lib/contracts/format-rp'

export const rpShort = (n: number) => (n >= 1e9 ? `Rp${(n / 1e9).toFixed(1).replace('.', ',')} M` : n >= 1e6 ? `Rp${Math.round(n / 1e6)} jt` : formatRp(n))
