'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { useState } from 'react'
import type { AuditFilter } from '@/interfaces/dash'
import NotAllowed from '@/components/molecules/NotAllowed'
import { scopeLogs } from '@/lib/db/scope-logs'
import { kindOf } from '@/lib/dash/kind-of'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import Chips from '@/components/molecules/Chips'
import Icon from '@/components/atoms/Icon'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import Link from 'next/link'
import { villageById } from '@/lib/master/village-by-id'
import Empty from '@/components/molecules/Empty'

export default function JejakAuditTemplate() {
  const { session } = useDash()
  const d = db.use()
  const logs = auditStore.use()
  const [filter, setFilter] = useState<AuditFilter>('semua')
  const [q, setQ] = useState('')
  if (session.role.role === 'pihak_kedua') return <NotAllowed />

  const scoped = scopeLogs(logs, session.role, d)
  const t = q.trim().toLowerCase()
  const list = scoped.filter((l) => (filter === 'semua' || kindOf(l) === filter) && (!t || [l.actor, l.action, l.detail, l.contractCode].some((v) => v?.toLowerCase().includes(t))))

  return (
    <>
      <PageHead label="Jejak audit" title="Jejak audit" desc="Setiap tindakan penting tercatat otomatis dan tidak bisa dihapus dari dashboard." />
      <Panel>
        <div className="d-toolbar">
          <Chips
            items={(['semua', 'kontrak', 'laporan', 'akun'] as AuditFilter[]).map((k) => ({
              key: k,
              label: { semua: 'Semua', kontrak: 'Kontrak', laporan: 'Laporan warga', akun: 'Akun & lainnya' }[k],
              count: k === 'semua' ? scoped.length : scoped.filter((l) => kindOf(l) === k).length,
            }))}
            value={filter}
            onChange={setFilter}
          />
          <label className="d-search">
            <Icon name="search" />
            <span className="sr-only">Cari aktivitas</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, tindakan, atau kode" />
          </label>
        </div>
        {list.length ? (
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pelaku</th>
                  <th>Tindakan</th>
                  <th>Kontrak</th>
                  {session.role.role === 'inspektorat' && <th>Desa</th>}
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id}>
                    <td className="d-nowrap" data-label="Waktu">{fmtDateTime(l.at)}</td>
                    <td data-label="Pelaku">
                      <strong>{l.actor}</strong>
                      <small className="d-block d-muted">{l.role}</small>
                    </td>
                    <td data-label="Tindakan">
                      {l.action}
                      {l.detail && <small className="d-block d-muted">{l.detail}</small>}
                    </td>
                    <td data-label="Kontrak">{l.contractCode ? <Link href={`/dashboard/kontrak/${l.contractCode}`}>{l.contractCode}</Link> : <span className="d-muted">-</span>}</td>
                    {session.role.role === 'inspektorat' && <td data-label="Desa">{villageById(l.villageId)?.name ?? '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Tidak ada aktivitas yang cocok." />
        )}
      </Panel>
    </>
  )
}
