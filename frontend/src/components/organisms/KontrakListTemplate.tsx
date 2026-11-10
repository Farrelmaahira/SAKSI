'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { useEffect, useMemo, useState } from 'react'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import type { KontrakFilter } from '@/interfaces/dash'
import type { ContractStatus, DContract } from '@/interfaces/db'
import type { TemplateKey } from '@/interfaces/drafting'
import { nextStep } from '@/lib/db/next-step'
import { groupOf } from '@/lib/dash/group-of'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { villageById } from '@/lib/master/village-by-id'
import PageHead from '@/components/molecules/PageHead'
import Btn from '@/components/atoms/Btn'
import Panel from '@/components/molecules/Panel'
import Chips from '@/components/molecules/Chips'
import Icon from '@/components/atoms/Icon'
import Link from 'next/link'
import { templates } from '@/data/drafting'
import { fmtDate } from '@/lib/dates/fmt-date'
import { deadlineOf } from '@/lib/db/deadline-of'
import { formatRp } from '@/lib/contracts/format-rp'
import { valueOf } from '@/lib/db/value-of'
import StatusBadge from '@/components/atoms/StatusBadge'
import { isActive } from '@/lib/db/is-active'
import Bar from '@/components/atoms/Bar'
import { progressOf } from '@/lib/db/progress-of'
import { isLate } from '@/lib/db/is-late'
import { statusLabels } from '@/data/db'
import { isEditable } from '@/lib/db/is-editable'
import { openCritical } from '@/lib/db/open-critical'
import Empty from '@/components/molecules/Empty'
import { fetchContractsAPI } from '@/lib/api/contracts'

export default function KontrakListTemplate() {
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [dbContracts, setDbContracts] = useState<DContract[] | null>(null)

  useEffect(() => {
    let active = true
    if (role.role === 'warga') {
      listPublicContracts().then((r) => (r.ok ? r.data : [])).then((res) => {
        if (active && res && res.length > 0) {
          const mapped: DContract[] = res.map((c) => ({
            code: c.nomor,
            title: c.judul,
            template: (c.jenis as TemplateKey) || 'pengadaan',
            counterpartyId: 'cp-maju',
            villageId: 'sukamaju',
            status: c.status === 'selesai' ? 'selesai' : 'berjalan',
            createdAt: '2026-11-06',
            versions: [
              {
                no: 1,
                at: '2026-11-06',
                answers: {
                  work: c.judul,
                  value: c.nilai,
                  deadline: c.tenggat || '2026-12-31',
                  scheme: 'Sekaligus',
                  terms: 1,
                  method: 'Pengadaan Langsung',
                },
                clauses: [],
                audit: { at: '2026-11-06', score: 100, findings: [] },
              },
            ],
            reviews: [],
            signatures: {},
            seals: [],
            terms: [],
            progress: [],
            history: [],
            selfReport: false,
          }))
          setDbContracts(mapped)
        }
      })
    } else {
      // Ambil daftar kontrak resmi dari Backend API Go PostgreSQL
      fetchContractsAPI().then((apiList) => {
        if (active && apiList && apiList.length > 0) {
          const mapped: DContract[] = apiList.map((c) => {
            const rawStatus = c.status || 'diaudit'
            const normalizedStatus: ContractStatus =
              rawStatus === 'ditandatangani'
                ? 'ditandatangani'
                : rawStatus === 'ditinjau'
                ? 'ditinjau'
                : rawStatus === 'selesai'
                ? 'selesai'
                : rawStatus === 'berjalan'
                ? 'berjalan'
                : 'diaudit'

            return {
              code: c.contractNumber || `SKS-2026-${String(c.id).padStart(3, '0')}`,
              title: c.title,
              template: (c.category as TemplateKey) || 'pengadaan',
              counterpartyId: '1',
              villageId: 'sukamaju',
              status: normalizedStatus,
              createdAt: c.createdAt ? c.createdAt.slice(0, 10) : '2026-11-08',
              versions: [
                {
                  no: 1,
                  at: c.createdAt ? c.createdAt.slice(0, 10) : '2026-11-08',
                  answers: {
                    work: c.title,
                    value: c.amount,
                    deadline: '2026-12-31',
                    scheme: 'Termin',
                    terms: 2,
                    method: 'Pengadaan Langsung',
                  },
                  clauses: [],
                  audit: { at: '2026-11-08', score: c.integrityScore || 100, findings: [] },
                },
              ],
              reviews: [],
              signatures: {},
              seals: [],
              terms: [],
              progress: [],
              history: [],
              selfReport: false,
            }
          })
          setDbContracts(mapped)
        }
      })
    }
    return () => {
      active = false
    }
  }, [role.role])

  const scopedLocal = scopeContracts(d, role)
  const all = useMemo(() => {
    if (!dbContracts || dbContracts.length === 0) return scopedLocal
    // Gabungkan kontrak API dengan kontrak lokal yang belum ada di API
    const apiCodes = new Set(dbContracts.map((c) => c.code.toLowerCase()))
    const uniqueLocal = scopedLocal.filter((c) => !apiCodes.has(c.code.toLowerCase()))
    return [...dbContracts, ...uniqueLocal]
  }, [dbContracts, scopedLocal])
  const [filter, setFilter] = useState<KontrakFilter>('semua')
  const [q, setQ] = useState('')
  const isDesa = role.role === 'perangkat_desa'
  const needsMe = (c: DContract) => nextStep(c)?.who === role.role && (role.role === 'pihak_kedua' || nextStep(c)?.tab !== 'progres')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return all.filter((c) => {
      if (filter === 'tindakan' && !needsMe(c)) return false
      if (filter !== 'semua' && filter !== 'tindakan' && groupOf(c) !== filter) return false
      if (!term) return true
      return [c.code, c.title, counterpartyById(c.counterpartyId)?.name, villageById(c.villageId)?.name].some((v) => v?.toLowerCase().includes(term))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, filter, q])

  const count = (f: KontrakFilter) => (f === 'semua' ? all.length : f === 'tindakan' ? all.filter(needsMe).length : all.filter((c) => groupOf(c) === f).length)
  const chips: { key: KontrakFilter; label: string; count: number }[] = [
    { key: 'semua', label: 'Semua', count: count('semua') },
    { key: 'tindakan', label: 'Perlu tindakan saya', count: count('tindakan') },
    ...(isDesa ? [{ key: 'draf' as const, label: 'Draf', count: count('draf') }] : []),
    { key: 'proses', label: 'Tinjau & tanda tangan', count: count('proses') },
    { key: 'aktif', label: 'Berjalan', count: count('aktif') },
    { key: 'selesai', label: 'Selesai', count: count('selesai') },
  ]

  const title = { perangkat_desa: 'Kontrak desa', pihak_kedua: 'Kontrak saya', bpd: 'Kontrak diawasi', inspektorat: 'Kontrak diawasi', warga: 'Kontrak desa' }[role.role]
  const desc = {
    perangkat_desa: 'Semua kontrak desa dari draf sampai selesai.',
    pihak_kedua: 'Kontrak tempat usaha Anda menjadi pihak kedua. Draf yang belum dikirim desa tidak tampil di sini.',
    bpd: 'Kontrak desa yang sudah dikirim untuk ditinjau. Hanya bisa dibaca.',
    inspektorat: 'Kontrak semua desa di wilayah Anda. Hanya bisa dibaca.',
    warga: 'Kontrak desa yang sedang berjalan dan dapat dipantau oleh masyarakat.',
  }[role.role]

  return (
    <>
      <PageHead
        label="Kontrak"
        title={title}
        desc={desc}
        actions={
          isDesa && (
            <Btn to="/dashboard/kontrak/baru" icon="plus">
              Buat kontrak
            </Btn>
          )
        }
      />
      <Panel>
        <div className="items-center flex flex-wrap gap-12 justify-between">
          <Chips items={chips} value={filter} onChange={setFilter} />
          <label className="items-center bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[3rem] flex flex-[1_1_26rem] gap-8 max-w-400 min-h-42 py-0 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none [&_input]:flex-1 [&_input]:text-[1.4rem] [&_input]:min-w-0 [&_input]:[outline:0]">
            <Icon name="search" />
            <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">Cari kontrak</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode, judul, atau pihak" />
          </label>
        </div>
        {list.length ? (
          <div className="my-0 -mx-20 overflow-x-auto py-0 px-20 md:my-0 md:-mx-24 md:py-0 md:px-24">
            <table className="[border-collapse:collapse] text-[1.4rem] min-w-720 w-full [&_th]:border-b-[0.15rem] [&_th]:border-b-ink [&_th]:[border-bottom-style:solid] [&_th]:text-[1.2rem] [&_th]:font-[400] [&_th]:tracking-[0.04em] [&_th]:text-dim [&_th]:pt-0 [&_th]:pr-12 [&_th]:pb-10 [&_th]:pl-0 [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_td]:border-b-[0.1rem] [&_td]:border-b-[#ececea] [&_td]:[border-bottom-style:solid] [&_td]:pt-14 [&_td]:pr-12 [&_td]:pb-14 [&_td]:pl-0 [&_td]:align-middle [&_tbody_tr:hover_td]:bg-soft [&_td_a:not(.d-row-link):not(.d-step)]:text-blue [&_td_a:not(.d-row-link):not(.d-step)]:font-code [&_td_a:not(.d-row-link):not(.d-step)]:text-[1.25rem] max-md:min-w-0 max-md:[&_thead]:[clip-path:inset(50%)] max-md:[&_thead]:h-1 max-md:[&_thead]:overflow-hidden max-md:[&_thead]:absolute max-md:[&_thead]:w-1 max-md:block max-md:[&_tbody]:block max-md:[&_tr]:block! max-md:[&_td]:block! max-md:[&_tr]:border-b-[0.1rem] max-md:[&_tr]:border-b-[#ececea] max-md:[&_tr]:[border-bottom-style:solid] max-md:[&_tr]:py-12 max-md:[&_tr]:px-0 max-md:[&_td]:border-0 max-md:[&_td]:border-none max-md:[&_td]:min-h-28 max-md:[&_td]:pt-4 max-md:[&_td]:pr-0 max-md:[&_td]:pb-4 max-md:[&_td]:pl-110 max-md:[&_td]:relative! max-md:[&_td]:text-left max-md:[&_td]:whitespace-normal max-md:[&_td:not([data-label])]:pl-0 max-md:[&_td[data-label]::before]:text-dim max-md:[&_td[data-label]::before]:content-[attr(data-label)] max-md:[&_td[data-label]::before]:text-[1.15rem] max-md:[&_td[data-label]::before]:left-0 max-md:[&_td[data-label]::before]:tracking-[0.04em] max-md:[&_td[data-label]::before]:leading-[2rem] max-md:[&_td[data-label]::before]:absolute max-md:[&_td[data-label]::before]:uppercase max-md:[&_td[data-label]::before]:top-6 max-md:[&_td[data-label]::before]:w-100 max-md:[&_tbody_tr:hover_td]:[background:none] d-table">
              <thead>
                <tr>
                  <th>Kontrak</th>
                  {role.role === 'inspektorat' && <th>Desa</th>}
                  <th>{role.role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua'}</th>
                  <th className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal">Nilai</th>
                  <th>Status</th>
                  <th>Progres</th>
                  <th>Langkah berikutnya</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const step = nextStep(c)
                  const mine = needsMe(c)
                  return (
                    <tr key={c.code}>
                      <td>
                        <Link className="grid gap-2 min-w-220 [&_code]:text-[1.2rem] [&_code]:text-dim [&_strong]:font-[420] [&_strong]:[transition:color_0.2s] [&:hover_strong]:text-blue [&_small]:text-[1.25rem]! [&_small]:text-dim! max-md:min-w-0 d-row-link" href={`/dashboard/kontrak/${c.code}`}>
                          <code>{c.code}</code>
                          <strong>{c.title}</strong>
                          <small>
                            {templates[c.template].label} · tenggat {fmtDate(deadlineOf(c))}
                          </small>
                        </Link>
                      </td>
                      {role.role === 'inspektorat' && <td data-label="Desa">{villageById(c.villageId)?.name}</td>}
                      <td data-label={role.role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua'}>{role.role === 'pihak_kedua' ? villageById(c.villageId)?.name : counterpartyById(c.counterpartyId)?.name}</td>
                      <td className="[.d-table_&]:[font-variant-numeric:tabular-nums] [.d-table_&]:text-right [.d-table_&]:whitespace-nowrap max-md:[.d-table_td&]:text-left max-md:[.d-table_td&]:whitespace-normal" data-label="Nilai">{formatRp(valueOf(c))}</td>
                      <td data-label="Status">
                        <StatusBadge status={c.status} />
                      </td>
                      <td data-label="Progres">
                        {isActive(c) || c.status === 'selesai' ? (
                          <div className="items-center flex text-[1.3rem] gap-10 flex-wrap min-w-140">
                            <Bar value={progressOf(c)} tone={isLate(c) ? 'red' : 'blue'} />
                            <span>{progressOf(c)}%</span>
                            {isLate(c) && <em className="[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic">Terlambat</em>}
                          </div>
                        ) : (
                          <span className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">-</span>
                        )}
                      </td>
                      <td data-label="Berikutnya">
                        {step ? (
                          <Link className={`items-start inline-flex text-[1.35rem] gap-6 leading-[1.35] max-w-260 text-dim [&.is-mine]:text-blue [&.is-mine]:font-[450] [&:hover]:[text-decoration:underline] d-step ${mine ? 'is-mine' : ''}`} href={`/dashboard/kontrak/${c.code}?tab=${step.tab}`}>
                            {mine && <Icon name="arrow" />}
                            {step.text}
                          </Link>
                        ) : (
                          <span className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{statusLabels[c.status]}</span>
                        )}
                        {isDesa && isEditable(c) && openCritical(c) > 0 && <small className="[.app_&]:text-red [.app_em&]:text-[1.2rem] [.app_em&]:not-italic block">{openCritical(c)} temuan kritis</small>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            art="data-reports_l2u3"
            title={all.length ? 'Tidak ada kontrak yang cocok.' : 'Belum ada kontrak.'}
            text={all.length ? 'Coba ubah filter atau kata pencarian.' : isDesa ? 'Mulai dengan membuat kontrak pertama desa.' : 'Kontrak akan tampil di sini setelah dikirim desa.'}
            action={isDesa && !all.length ? <Btn to="/dashboard/kontrak/baru">Buat kontrak</Btn> : undefined}
          />
        )}
      </Panel>
    </>
  )
}
