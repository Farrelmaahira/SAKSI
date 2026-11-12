export interface RegionRuleForm {
  langsung: string
  penawaran: string
  dasar: string
  sejak: string
}

/* First problem with a new procurement threshold rule, or the parsed amounts. */
export function validateRegionRule(f: RegionRuleForm): { error: string } | { langsung: number; penawaran: number } {
  const langsung = Number(f.langsung)
  const penawaran = Number(f.penawaran)
  if (!(langsung > 0) || !(penawaran > 0)) return { error: 'Isi kedua ambang dengan angka rupiah.' }
  if (penawaran < langsung) return { error: 'Ambang penawaran harus lebih besar dari ambang pembelian langsung.' }
  if (f.dasar.trim().length < 5 || !f.sejak) return { error: 'Lengkapi dasar hukum dan tanggal berlaku.' }
  return { langsung, penawaran }
}
