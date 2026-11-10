'use client'

import type { TabProps } from '@/interfaces/dash'
import { isEditable } from '@/lib/db/is-editable'
import AuditPanel from '@/components/organisms/AuditPanel'
import { latestVersion } from '@/lib/db/latest-version'
import { applySuggestion } from '@/lib/db/apply-suggestion'
import Panel from '@/components/molecules/Panel'
import { fmtDate } from '@/lib/dates/fmt-date'
import Badge from '@/components/atoms/Badge'
import Locked from '@/components/atoms/Locked'
import SourceBadge from '@/components/atoms/SourceBadge'

export default function AuditAiTab({ c, session }: TabProps) {
  const canApply = session.role.role === 'perangkat_desa' && isEditable(c)
  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <AuditPanel audit={latestVersion(c).audit} onApply={canApply ? (id) => applySuggestion(c.code, id, session) : undefined} readOnly={!canApply} />
      <Panel title="Skor per versi" desc="Setiap versi diaudit ulang secara otomatis.">
        <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
          {c.versions.map((v) => (
            <li key={v.no}>
              <div>
                <strong>Versi {v.no} <SourceBadge source={v.source} /></strong>
                <small>
                  {fmtDate(v.at)} · {v.audit.findings.filter((f) => !f.applied).length} temuan terbuka
                </small>
              </div>
              <Badge tone={v.audit.score >= 85 ? 'done' : v.audit.score >= 65 ? 'tint' : 'red'}>{v.audit.score}/100</Badge>
            </li>
          ))}
        </ul>
        {!canApply && <Locked text={session.role.role === 'perangkat_desa' ? 'Saran tidak bisa diterapkan karena kontrak sudah dikunci.' : 'Hanya perangkat desa yang bisa menerapkan saran AI.'} />}
      </Panel>
    </div>
  )
}
