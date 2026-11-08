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
        <div className="items-center flex flex-wrap gap-12 justify-between">
          <Chips
            items={(['semua', 'kontrak', 'laporan', 'akun'] as AuditFilter[]).map((k) => ({
              key: k,
              label: { semua: 'Semua', kontrak: 'Kontrak', laporan: 'Laporan warga', akun: 'Akun & lainnya' }[k],
              count: k === 'semua' ? scoped.length : scoped.filter((l) => kindOf(l) === k).length,
            }))}
            value={filter}
            onChange={setFilter}
          />
          <label className="items-center bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[3rem] flex flex-[1_1_26rem] gap-8 max-w-400 min-h-42 py-0 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none [&_input]:flex-1 [&_input]:text-[1.4rem] [&_input]:min-w-0 [&_input]:[outline:0]">
            <Icon name="search" />
            <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">Cari aktivitas</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, tindakan, atau kode" />
          </label>
        </div>
        {list.length ? (
          <div className="my-0 -mx-20 overflow-x-auto py-0 px-20 md:my-0 md:-mx-24 md:py-0 md:px-24">
            <table className="[border-collapse:collapse] text-[1.4rem] min-w-720 w-full [&_th]:border-b-[0.15rem] [&_th]:border-b-ink [&_th]:[border-bottom-style:solid] [&_th]:text-[1.2rem] [&_th]:font-[400] [&_th]:tracking-[0.04em] [&_th]:text-dim [&_th]:pt-0 [&_th]:pr-12 [&_th]:pb-10 [&_th]:pl-0 [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_td]:border-b-[0.1rem] [&_td]:border-b-[#ececea] [&_td]:[border-bottom-style:solid] [&_td]:pt-14 [&_td]:pr-12 [&_td]:pb-14 [&_td]:pl-0 [&_td]:align-middle [&_tbody_tr:hover_td]:bg-soft [&_td_a:not(.d-row-link):not(.d-step)]:text-blue [&_td_a:not(.d-row-link):not(.d-step)]:font-code [&_td_a:not(.d-row-link):not(.d-step)]:text-[1.25rem] max-md:min-w-0 max-md:[&_thead]:[clip-path:inset(50%)] max-md:[&_thead]:h-1 max-md:[&_thead]:overflow-hidden max-md:[&_thead]:absolute max-md:[&_thead]:w-1 max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block! max-md:[&_td]:block! max-md:[&_tr]:border-b-[0.1rem] max-md:[&_tr]:border-b-[#ececea] max-md:[&_tr]:[border-bottom-style:solid] max-md:[&_tr]:py-12 max-md:[&_tr]:px-0 max-md:[&_td]:border-0 max-md:[&_td]:border-none max-md:[&_td]:min-h-28 max-md:[&_td]:pt-4 max-md:[&_td]:pr-0 max-md:[&_td]:pb-4 max-md:[&_td]:pl-110 max-md:[&_td]:relative! max-md:[&_td]:text-left max-md:[&_td]:whitespace-normal max-md:[&_td:not([data-label])]:pl-0 max-md:[&_td[data-label]::before]:text-dim max-md:[&_td[data-label]::before]:content-[attr(data-label)] max-md:[&_td[data-label]::before]:text-[1.15rem] max-md:[&_td[data-label]::before]:left-0 max-md:[&_td[data-label]::before]:tracking-[0.04em] max-md:[&_td[data-label]::before]:leading-[2rem] max-md:[&_td[data-label]::before]:absolute max-md:[&_td[data-label]::before]:uppercase max-md:[&_td[data-label]::before]:top-6 max-md:[&_td[data-label]::before]:w-100 max-md:[&_tbody_tr:hover_td]:[background:none] d-table">
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
                    <td className="whitespace-nowrap" data-label="Waktu">{fmtDateTime(l.at)}</td>
                    <td data-label="Pelaku">
                      <strong>{l.actor}</strong>
                      <small className="block text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{l.role}</small>
                    </td>
                    <td data-label="Tindakan">
                      {l.action}
                      {l.detail && <small className="block text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{l.detail}</small>}
                    </td>
                    <td data-label="Kontrak">{l.contractCode ? <Link href={`/dashboard/kontrak/${l.contractCode}`}>{l.contractCode}</Link> : <span className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">-</span>}</td>
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
