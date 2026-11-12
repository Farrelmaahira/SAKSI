import Panel from '@/components/molecules/Panel'
import LetterPreview from '@/components/organisms/LetterPreviewLazy'
import { villageHeads } from '@/data/master'
import type { DContract } from '@/interfaces/db'
import { latestVersion } from '@/lib/db/latest-version'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'

/* The letter as both parties will read it, with signatures and e-meterai once they are placed */
export default function LetterPanel({ c }: { c: DContract }) {
  return (
    <Panel title="Pratinjau surat" desc="Surat seperti yang akan dibaca kedua pihak. Tanda tangan dan e-meterai muncul di sini begitu dibubuhkan.">
      <LetterPreview
        title={c.title}
        code={c.code}
        village={villageById(c.villageId)?.name ?? ''}
        head={villageHeads[c.villageId] ?? '-'}
        second={counterpartyById(c.counterpartyId)?.name ?? 'Pihak kedua'}
        date={c.createdAt}
        clauses={latestVersion(c).clauses}
        signatures={c.signatures}
      />
    </Panel>
  )
}
