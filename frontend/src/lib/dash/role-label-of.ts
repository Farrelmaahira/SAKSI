const LABELS: Record<string, string> = {
  kades: 'Kepala Desa',
  perangkat_desa: 'Perangkat Desa',
  penyedia: 'Penyedia',
  bpd: 'BPD',
  inspektorat: 'Inspektorat',
  admin_daerah: 'Admin Daerah',
  warga: 'Warga',
}

/* Backend role key (users.role) -> label */
export const roleLabelOf = (role: string) => LABELS[role] ?? role
