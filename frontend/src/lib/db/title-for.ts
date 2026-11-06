import type { TemplateKey } from '@/interfaces/drafting'

export const titleFor = (t: TemplateKey, work: string) => {
  const w = work.trim().replace(/\.$/, '')
  return `${{ pengadaan: 'Pengadaan', hibah: 'Hibah', bumdes: 'Kerja sama', sewa: 'Sewa' }[t]} ${w.charAt(0).toLowerCase()}${w.slice(1)}`
}
