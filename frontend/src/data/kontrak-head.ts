import type { RoleKey } from '@/interfaces/auth'

/* Title and intro of the contract list page, per role. */
export const kontrakHead: Record<RoleKey, { title: string; desc: string }> = {
  perangkat_desa: { title: 'Kontrak desa', desc: 'Semua kontrak desa dari draf sampai selesai.' },
  pihak_kedua: { title: 'Kontrak saya', desc: 'Kontrak tempat usaha Anda menjadi pihak kedua. Draf yang belum dikirim desa tidak tampil di sini.' },
  bpd: { title: 'Kontrak diawasi', desc: 'Kontrak desa yang sudah dikirim untuk ditinjau. Hanya bisa dibaca.' },
  inspektorat: { title: 'Kontrak diawasi', desc: 'Kontrak semua desa di wilayah Anda. Hanya bisa dibaca.' },
  warga: { title: 'Kontrak desa', desc: 'Kontrak desa yang sedang berjalan dan dapat dipantau oleh masyarakat.' },
  admin_daerah: { title: 'Kontrak wilayah', desc: 'Kontrak desa di wilayah Anda. Hanya bisa dibaca.' },
}
