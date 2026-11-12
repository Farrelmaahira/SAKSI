import BigProgress from '@/components/molecules/BigProgress'
import CheckList from '@/components/molecules/CheckList'
import Panel from '@/components/molecules/Panel'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { isLate } from '@/lib/db/is-late'
import { paidOf } from '@/lib/db/paid-of'
import { progressOf } from '@/lib/db/progress-of'
import { valueOf } from '@/lib/db/value-of'

/* Progress and payment as bars, plus the four milestones: signed, sealed, published, SPK */
export default function ExecutionPanel({ c }: { c: DContract }) {
  const paid = paidOf(c)
  return (
    <Panel title="Pelaksanaan">
      <BigProgress label="Progres pekerjaan" value={`${progressOf(c)}%`} percent={progressOf(c)} tone={isLate(c) ? 'red' : 'blue'} />
      <BigProgress label="Sudah dibayar" value={<>{formatRp(paid)} <small>dari {formatRp(valueOf(c))}</small></>} percent={(paid / Math.max(1, valueOf(c))) * 100} />
      <CheckList
        items={[
          { icon: 'sign', label: 'Tanda tangan lengkap', on: Boolean(c.signatures.desa && c.signatures.pihak && c.signatures.meterai) },
          { icon: 'shield', label: 'Disegel SHA-256', on: c.seals.length > 0 },
          { icon: 'globe', label: 'Tampil di portal warga', on: Boolean(c.publication) },
          { icon: 'doc', label: 'SPK terbit', on: Boolean(c.spk) },
        ]}
      />
    </Panel>
  )
}
