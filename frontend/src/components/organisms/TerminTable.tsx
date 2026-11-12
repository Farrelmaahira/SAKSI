import Badge from '@/components/atoms/Badge'
import DataTable from '@/components/molecules/DataTable'
import NumCell from '@/components/molecules/NumCell'
import PayTermButton from '@/components/molecules/PayTermButton'
import type { DContract } from '@/interfaces/db'
import { formatRp } from '@/lib/contracts/format-rp'
import { daysUntil } from '@/lib/dates/days-until'
import { fmtDate } from '@/lib/dates/fmt-date'
import { isActive } from '@/lib/db/is-active'
import { cn } from '@/lib/utils'

interface Props {
  c: DContract
  canPay: boolean
  busy: boolean
  onPay: (no: number, apiId?: number) => void
}

const COLUMNS = ['Termin', { label: 'Persen', numeric: true as const }, { label: 'Jumlah', numeric: true as const }, 'Rencana', 'Status']

/* The payment schedule: each term with its share, amount, planned date and whether it is paid */
export default function TerminTable({ c, canPay, busy, onPay }: Props) {
  return (
    <DataTable columns={COLUMNS}>
      {c.terms.map((t) => {
        const overdue = !t.paidDate && daysUntil(t.planDate) < 0 && isActive(c)
        return (
          <tr key={t.no}>
            <td>
              <strong>{t.label}</strong>
            </td>
            <NumCell label="Persen">{t.percent}%</NumCell>
            <NumCell label="Jumlah">{formatRp(t.amount)}</NumCell>
            <td className={cn(overdue && 'text-red')} data-label="Rencana">{fmtDate(t.planDate)}</td>
            <td data-label="Status">
              {t.paidDate ? (
                <Badge tone="done">Dibayar {fmtDate(t.paidDate)}</Badge>
              ) : canPay ? (
                <PayTermButton term={t} overdue={overdue} disabled={busy} onPay={() => onPay(t.no, t.apiId)} />
              ) : (
                <Badge tone={overdue ? 'red' : 'muted'}>{overdue ? 'Lewat jatuh tempo' : t.submitted ? 'Diajukan penyedia' : 'Belum dibayar'}</Badge>
              )}
            </td>
          </tr>
        )
      })}
    </DataTable>
  )
}
