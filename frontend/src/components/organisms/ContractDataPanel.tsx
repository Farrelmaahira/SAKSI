import Panel from '@/components/molecules/Panel'
import SummaryList from '@/components/molecules/SummaryList'
import { templates } from '@/data/drafting'
import { villageHeads } from '@/data/master'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { daysUntil } from '@/lib/dates/days-until'
import { fmtDate } from '@/lib/dates/fmt-date'
import { deadlineOf } from '@/lib/db/deadline-of'
import { isActive } from '@/lib/db/is-active'
import { isLate } from '@/lib/db/is-late'
import { latestVersion } from '@/lib/db/latest-version'
import { valueOf } from '@/lib/db/value-of'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'

/* The deadline with how late it is, or how many days are left */
const deadlineText = (c: DContract) => `${fmtDate(deadlineOf(c))}${isLate(c) ? ` · terlambat ${-daysUntil(deadlineOf(c))} hari` : isActive(c) ? ` · ${daysUntil(deadlineOf(c))} hari lagi` : ''}`

/* The basics of the contract: type, both parties, value, method, deadline and version */
export default function ContractDataPanel({ c }: { c: DContract }) {
  const cp = counterpartyById(c.counterpartyId)
  const ver = latestVersion(c)
  return (
    <Panel title="Data kontrak">
      <SummaryList
        rows={[
          ['Jenis', templates[c.template].label],
          ['Pihak pertama', `Pemerintah ${villageById(c.villageId)?.name}, Kepala Desa ${villageHeads[c.villageId]}`],
          ['Pihak kedua', `${cp?.name} · ${cp?.contact}`],
          ['Nilai', `${formatRp(valueOf(c))}${c.template === 'sewa' ? ' per tahun' : ''}`],
          ['Metode', ver.answers.method],
          ['Tenggat', isLate(c) ? <span key="d" className="text-red">{deadlineText(c)}</span> : deadlineText(c)],
          ['Versi', `Versi ${ver.no} · skor audit ${ver.audit.score}`],
        ]}
      />
    </Panel>
  )
}
