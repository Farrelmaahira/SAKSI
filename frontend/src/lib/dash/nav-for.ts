import type { RoleKey } from '@/interfaces/auth'
import type { NavCounts, NavItem } from '@/interfaces/dash'

/* Sidebar entries per role */
export function navFor(role: RoleKey, counts: NavCounts): NavItem[] {
  const home = { to: '/dashboard', label: 'Beranda', icon: 'home', end: true }
  const audit = { to: '/dashboard/jejak-audit', label: 'Jejak Audit', icon: 'clock' }
  const seal = { to: '/dashboard/verifikasi-segel', label: 'Verifikasi Segel', icon: 'shield' }
  if (role === 'warga')
    return [
      home,
      { to: '/dashboard/laporan/baru', label: 'Buat Laporan', icon: 'plus' },
      { to: '/dashboard/laporan', label: 'Laporan Saya', icon: 'flag', badge: counts.reports, end: true }, // exact match, or it stays lit on Buat Laporan
      { to: '/dashboard/notifikasi', label: 'Notifikasi', icon: 'bell' },
      { to: '/dashboard/profil', label: 'Profil', icon: 'user' },
    ]
  if (role === 'perangkat_desa')
    return [
      home,
      { to: '/dashboard/kontrak', label: 'Kontrak', icon: 'file', badge: counts.contracts },
      { to: '/dashboard/kontrak/baru', label: 'Buat Kontrak', icon: 'plus' },
      { to: '/dashboard/laporan', label: 'Laporan Warga', icon: 'flag', badge: counts.reports },
      audit,
      { to: '/dashboard/profil', label: 'Profil Desa', icon: 'user' },
    ]
  if (role === 'pihak_kedua')
    return [
      home,
      { to: '/dashboard/kontrak', label: 'Kontrak Saya', icon: 'file', badge: counts.contracts },
      { to: '/dashboard/termin', label: 'Termin', icon: 'wallet' },
      { to: '/dashboard/profil', label: 'Profil Usaha', icon: 'user' },
    ]
  if (role === 'bpd')
    return [
      home,
      { to: '/dashboard/kontrak', label: 'Kontrak Diawasi', icon: 'eye' },
      { to: '/dashboard/laporan', label: 'Laporan Warga', icon: 'flag', badge: counts.reports },
      seal,
      audit,
      { to: '/dashboard/profil', label: 'Profil', icon: 'user' },
    ]
  return [
    home,
    { to: '/dashboard/kontrak', label: 'Kontrak Diawasi', icon: 'eye' },
    { to: '/dashboard/laporan', label: 'Laporan Eskalasi', icon: 'flag', badge: counts.reports },
    { to: '/dashboard/termin', label: 'Termin vs Realisasi', icon: 'chart' },
    { to: '/dashboard/lhp', label: 'Uji Petik dan LHP', icon: 'doc', note: 'Rancangan' },
    seal,
    audit,
    { to: '/dashboard/profil', label: 'Profil', icon: 'user' },
  ]
}
