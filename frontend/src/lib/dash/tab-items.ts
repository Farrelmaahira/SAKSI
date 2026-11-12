import type { TabItem } from '@/interfaces/dash'
import type { DContract } from '@/interfaces/db'
import { openCritical } from '@/lib/db/open-critical'

interface Tab {
  key: string
  label: string
}

/* Tab strip of a contract: each tab with its badge (open items) and whether its step is done. */
export function tabItems(tabs: Tab[], c: DContract, openReports: number): TabItem[] {
  return tabs.map((t) => ({
    key: t.key,
    label: t.label,
    badge: t.key === 'laporan' ? openReports : t.key === 'audit' ? openCritical(c) : t.key === 'peninjauan' ? c.reviews.filter((r) => !r.resolved).length : undefined,
    done:
      (t.key === 'tanda-tangan' && Boolean(c.signatures.desa && c.signatures.pihak && c.signatures.meterai)) ||
      (t.key === 'segel' && c.seals.length > 0) ||
      (t.key === 'publikasi' && Boolean(c.publication)) ||
      (t.key === 'spk' && Boolean(c.spk)),
  }))
}
