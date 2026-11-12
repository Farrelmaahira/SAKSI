import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import type { DContract, DReport } from '@/interfaces/db'

interface Props {
  r: DReport
  contract?: DContract
  /* village staff do not see who reported */
  hideReporter: boolean
}

/* Facts of a report: which contract and clause, where, how many photos, who reported */
export default function ReportMeta({ r, contract, hideReporter }: Props) {
  return (
    <ul className="grid text-[1.3rem] gap-8 list-none list-outside text-dim [&_li]:items-start [&_li]:flex [&_li]:gap-8 [&_li]:leading-[1.5] [&_a]:text-blue [&_a]:font-code [&_a]:whitespace-nowrap d-report-meta">
      <li>
        <Icon name="file" />
        <Link href={`/dashboard/kontrak/${r.contractCode}?tab=laporan`}>{r.contractCode}</Link>
        {contract && <span>· {contract.title}</span>}
      </li>
      <li>
        <Icon name="doc" />
        <span>Pasal: {r.clause}</span>
      </li>
      {r.location && (
        <li>
          <Icon name="pin" />
          <span>Lokasi: {r.location}</span>
        </li>
      )}
      <li>
        <Icon name="image" />
        <span>{r.photos} foto bukti</span>
      </li>
      <li>
        <Icon name="user" />
        <span>{hideReporter ? 'Pelapor: identitas dirahasiakan' : `Pelapor: ${r.reporterName ?? r.reporter}`}</span>
      </li>
    </ul>
  )
}
