import Link from 'next/link'
import Hint from '@/components/atoms/Hint'
import DataTable from '@/components/molecules/DataTable'
import type { AuditLogItem } from '@/interfaces/api'
import { auditLabelOf } from '@/lib/dash/audit-label-of'
import { roleLabelOf } from '@/lib/dash/role-label-of'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'

interface Props {
  rows: AuditLogItem[]
  /* regency auditors also see which village each row is from */
  withVillage: boolean
}

/* One row per recorded action: when, who, what, on which contract */
export default function AuditTrailTable({ rows, withVillage }: Props) {
  return (
    <DataTable columns={['Waktu', 'Pelaku', 'Tindakan', 'Kontrak', ...(withVillage ? ['Desa'] : [])]}>
      {rows.map((l) => (
        <tr key={l.id}>
          <td className="whitespace-nowrap" data-label="Waktu">{fmtDateTime(l.waktu)}</td>
          <td data-label="Pelaku">
            <strong>{l.aktorNama}</strong>
            <Hint as="small" className="block">{roleLabelOf(l.aktorRole)}</Hint>
          </td>
          <td data-label="Tindakan">
            {auditLabelOf(l)}
            {l.contractJudul && <Hint as="small" className="block">{l.contractJudul}</Hint>}
          </td>
          <td data-label="Kontrak">{l.contractId ? <Link href={`/dashboard/kontrak/${l.contractId}`}>#{l.contractId}</Link> : <Hint as="span">-</Hint>}</td>
          {withVillage && <td data-label="Desa">{l.villageName || '-'}</td>}
        </tr>
      ))}
    </DataTable>
  )
}
