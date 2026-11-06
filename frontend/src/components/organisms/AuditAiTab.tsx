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

export default function AuditAiTab({ c, session }: TabProps) {
  const canApply = session.role.role === 'perangkat_desa' && isEditable(c)
  return (
    <div className="d-grid-2 d-grid-wide">
      <AuditPanel audit={latestVersion(c).audit} onApply={canApply ? (id) => applySuggestion(c.code, id, session) : undefined} readOnly={!canApply} />
      <Panel title="Skor per versi" desc="Setiap versi diaudit ulang secara otomatis.">
        <ul className="d-list">
          {c.versions.map((v) => (
            <li key={v.no}>
              <div>
                <strong>Versi {v.no}</strong>
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
