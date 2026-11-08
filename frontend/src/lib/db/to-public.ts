import type { DContract, DReport } from '@/interfaces/db'
import type { Contract } from '@/interfaces/contract'
import { seedContracts } from '@/data/seed-contracts'
import { villageById } from '@/lib/master/village-by-id'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { latestVersion } from '@/lib/db/latest-version'
import { templates } from '@/data/drafting'
import { villageHeads } from '@/data/master'
import { fmtDate } from '@/lib/dates/fmt-date'
import { progressOf } from '@/lib/db/progress-of'
import { milestonesOf } from '@/lib/db/milestones-of'
import { toPublicReport } from '@/lib/db/to-public-report'
import { pubFields } from '@/data/db'

export function toPublic(c: DContract, reports: DReport[]): Contract {
  const seed = seedContracts.find((s) => s.code === c.code)
  const v = villageById(c.villageId) ?? { id: c.villageId || 'sukamaju', name: 'Desa Sukamaju', district: 'Kec. Cibeber', regionId: 'kab-cianjur', code: '3203152005' }
  const cp = counterpartyById(c.counterpartyId)
  const ver = latestVersion(c)
  const base: Contract = seed
    ? { ...seed }
    : {
        code: c.code,
        type: templates[c.template].label,
        title: c.title,
        village: `${v.name}, ${v.district}`,
        first: `Pemerintah ${v.name}, diwakili Kepala Desa ${villageHeads[c.villageId] ?? '-'}`,
        second: cp ? `${cp.name}, diwakili ${cp.contact}` : 'Pihak kedua',
        value: ver.answers.value,
        valueNote: c.template === 'sewa' ? 'per tahun' : undefined,
        duration: `Sampai ${fmtDate(ver.answers.deadline)}`,
        start: fmtDate(c.spk?.start ?? c.signatures.desa?.at ?? c.createdAt),
        progress: 0,
        clauses: ver.clauses.map(({ title, text }) => ({ title, text })),
        milestones: [],
        reports: [],
      }
  return {
    ...base,
    progress: progressOf(c),
    milestones: seed ? seed.milestones : milestonesOf(c),
    reports: reports.filter((r) => r.contractCode === c.code).map(toPublicReport),
    hidden: c.publication ? pubFields.filter((f) => !c.publication!.fields.includes(f)) : undefined,
  }
}
