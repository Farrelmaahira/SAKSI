'use client'

import { useEffect, useState } from 'react'
import type { ApiResult, AuditReport } from '@/interfaces/api'
import { getAuditReport } from '@/lib/api/get-audit-report'
import { publishAuditReport } from '@/lib/api/publish-audit-report'
import Panel from '@/components/molecules/Panel'
import RowList from '@/components/molecules/RowList'
import Badge from '@/components/atoms/Badge'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import { fmtDate } from '@/lib/dates/fmt-date'

interface Props { id: number; userId: number; onChange: () => void }

/* GET /audit-reports/{id} with findings; the inspektorat who wrote a draft can publish it (POST /{id}/terbit) */
export default function LhpDetail({ id, userId, onChange }: Props) {
  const [res, setRes] = useState<{ id: number; r: ApiResult<AuditReport> } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAuditReport(id).then((r) => active && setRes({ id, r }))
    return () => {
      active = false
    }
  }, [id])

  const current = res?.id === id ? res.r : null
  if (!current) return <Panel><p className="text-[1.4rem] text-dim" role="status">Memuat LHP…</p></Panel>
  if (!current.ok) return <Panel><FormAlert>{current.error}</FormAlert></Panel>
  const x = current.data

  const publish = async () => {
    setBusy(true)
    setError('')
    const r = await publishAuditReport(x.id)
    setBusy(false)
    if (!r.ok) return setError(r.error)
    setRes({ id, r: { ok: true, data: { ...x, ...r.data, findings: x.findings } } })
    onChange()
  }

  return (
    <Panel
      title={`${x.jenis === 'uji_petik' ? 'Uji petik' : 'LHP'} · ${x.contractJudul}`}
      desc={`${x.villageName} · disusun ${x.penyusunNama}${x.terbitPada ? ` · terbit ${fmtDate(x.terbitPada)}` : ''}`}
      action={<Badge tone={x.status === 'terbit' ? 'done' : 'muted'}>{x.status === 'terbit' ? 'Terbit' : 'Draf'}</Badge>}
    >
      <p className="text-[1.5rem] leading-[1.55] whitespace-pre-line">{x.ringkasan}</p>
      {x.findings?.length ? (
        <RowList>
          {x.findings.map((f, i) => (
            <li key={f.id ?? i}>
              <div>
                <strong>{f.temuan}</strong>
                <small>Objek: {f.objek.toUpperCase()} · Rekomendasi: {f.rekomendasi || '-'}</small>
              </div>
              <Badge tone={f.tingkat === 'kritis' ? 'red' : 'muted'}>{f.tingkat === 'kritis' ? 'Kritis' : 'Saran'}</Badge>
            </li>
          ))}
        </RowList>
      ) : (
        <p className="text-[1.4rem] text-dim">Tidak ada temuan.</p>
      )}
      {error && <FormAlert>{error}</FormAlert>}
      {x.status === 'draf' && x.penyusunUserId === userId && (
        <div>
          <Btn onClick={publish} disabled={busy}>{busy ? 'Menerbitkan…' : 'Terbitkan LHP'}</Btn>
        </div>
      )}
    </Panel>
  )
}
