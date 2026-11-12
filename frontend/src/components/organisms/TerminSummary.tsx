import Callout from '@/components/atoms/Callout'
import Stat from '@/components/molecules/Stat'
import StatGrid from '@/components/molecules/StatGrid'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { paymentSummary } from '@/lib/db/payment-summary'
import { paidOf } from '@/lib/db/paid-of'
import { valueOf } from '@/lib/db/value-of'

/* Contract value, how much is paid, physical progress, and a warning when payment runs ahead of the work */
export default function TerminSummary({ c }: { c: DContract }) {
  const { paidPct, progress, ahead } = paymentSummary(c)
  return (
    <>
      <StatGrid>
        <Stat label="Nilai kontrak" value={formatRp(valueOf(c))} tone="ink" shrink={false} />
        <Stat label="Sudah dibayar" value={`${paidPct}%`} hint={formatRp(paidOf(c))} tone={ahead ? 'red' : 'ink'} />
        <Stat label="Progres fisik" value={`${progress}%`} tone="ink" />
      </StatGrid>
      {ahead && <Callout tone="red" icon="alert">Pembayaran {paidPct}% lebih tinggi dari progres {progress}%. Pastikan pekerjaan sudah diverifikasi sebelum membayar termin berikutnya.</Callout>}
    </>
  )
}
