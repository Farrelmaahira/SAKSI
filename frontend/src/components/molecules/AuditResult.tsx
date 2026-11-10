import type { ContractAudit } from '@/interfaces/api'
import type { Clause } from '@/interfaces/drafting'
import Badge from '@/components/atoms/Badge'
import { cn } from '@/lib/utils'

interface Props { audit: ContractAudit; clauses?: Clause[] }

const SEV: Record<'kritis' | 'saran', string> = {
  kritis: '[.d-findings_&]:bg-red [.d-findings_&]:text-white',
  saran: '[.d-findings_&]:bg-blue [.d-findings_&]:text-white',
}

export default function AuditResult({ audit, clauses = [] }: Props) {
  const name = (kode: string) => (kode ? (clauses.find((c) => c.key === kode)?.title ?? `Pasal ${kode}`) : 'Temuan umum')
  return (
    <div className="grid gap-16">
      <div className="items-center flex flex-wrap gap-14">
        <strong className={cn('text-[5.6rem] font-[300] tracking-[-0.04em] leading-[1]', audit.skor >= 85 ? 'text-green' : audit.skor >= 65 ? 'text-blue' : 'text-red')}>
          {Math.round(audit.skor)}
        </strong>
        <span className="grid text-[1.4rem]">
          Skor audit
          <small className="text-[1.2rem] text-dim">Model: {audit.model || 'tidak disebutkan server'}</small>
        </span>
      </div>
      {!audit.findings.length && <p className="text-[1.4rem] leading-[1.5] text-dim">Tidak ada temuan.</p>}
      <ul className="grid gap-8 list-none list-outside [&_li]:rounded-[1.4rem] [&_li]:grid [&_li]:gap-6 [&_li]:justify-items-start [&_li]:p-14 [&_strong]:font-[450] [&_p]:text-[1.35rem] [&_p]:leading-[1.5] d-findings">
        {audit.findings.map((f, i) => (
          <li key={i} className={`${SEV[f.tingkat]} sev-${f.tingkat}`}>
            <Badge tone={f.tingkat === 'kritis' ? 'red' : 'tint'}>{f.tingkat === 'kritis' ? 'Kritis' : 'Saran'}</Badge>
            <strong>{name(f.kodePasal)}</strong>
            <p>{f.pesan}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
