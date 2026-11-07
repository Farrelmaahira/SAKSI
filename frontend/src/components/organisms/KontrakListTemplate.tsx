'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { useEffect, useMemo, useState } from 'react'
import { fetchPublicContracts } from '@/lib/api/reports'
import type { KontrakFilter } from '@/interfaces/dash'
import type { DContract } from '@/interfaces/db'
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

export default function KontrakListTemplate() {
  const { session } = useDash()
  const d = db.use()
  const role = session.role
  const [dbContracts, setDbContracts] = useState<DContract[] | null>(null)

  useEffect(() => {
    if (role.role === 'warga') {
      let active = true
      fetchPublicContracts().then((res) => {
        if (active && res && res.length > 0) {
          const mapped: DContract[] = res.map((c) => ({
            code: c.nomor,
            title: c.judul,
            template: (c.jenis as any) || 'pengadaan',
            templateId: c.jenis,
            counterpartyId: 'cp-maju',
            villageId: 'sukamaju',
            status: c.status === 'selesai' ? 'selesai' : 'berjalan',
            amount: c.nilai,
            createdAt: '2026-11-06',
            versions: [],
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
      return () => {
        active = false
      }
    }
  }, [role.role])

  const all = (role.role === 'warga' && dbContracts !== null) ? dbContracts : scopeContracts(d, role)
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
        <div className="d-toolbar">
          <Chips items={chips} value={filter} onChange={setFilter} />
          <label className="d-search">
            <Icon name="search" />
            <span className="sr-only">Cari kontrak</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode, judul, atau pihak" />
          </label>
        </div>
        {list.length ? (
          <div className="d-table-wrap">
            <table className="d-table">
              <thead>
                <tr>
                  <th>Kontrak</th>
                  {role.role === 'inspektorat' && <th>Desa</th>}
                  <th>{role.role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua'}</th>
                  <th className="num">Nilai</th>
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
                        <Link className="d-row-link" href={`/dashboard/kontrak/${c.code}`}>
                          <code>{c.code}</code>
                          <strong>{c.title}</strong>
                          <small>
                            {templates[c.template].label} · tenggat {fmtDate(deadlineOf(c))}
                          </small>
                        </Link>
                      </td>
                      {role.role === 'inspektorat' && <td data-label="Desa">{villageById(c.villageId)?.name}</td>}
                      <td data-label={role.role === 'pihak_kedua' ? 'Desa' : 'Pihak kedua'}>{role.role === 'pihak_kedua' ? villageById(c.villageId)?.name : counterpartyById(c.counterpartyId)?.name}</td>
                      <td className="num" data-label="Nilai">{formatRp(valueOf(c))}</td>
                      <td data-label="Status">
                        <StatusBadge status={c.status} />
                      </td>
                      <td data-label="Progres">
                        {isActive(c) || c.status === 'selesai' ? (
                          <div className="d-cell-progress">
                            <Bar value={progressOf(c)} tone={isLate(c) ? 'red' : 'blue'} />
                            <span>{progressOf(c)}%</span>
                            {isLate(c) && <em className="is-red">Terlambat</em>}
                          </div>
                        ) : (
                          <span className="d-muted">-</span>
                        )}
                      </td>
                      <td data-label="Berikutnya">
                        {step ? (
                          <Link className={`d-step ${mine ? 'is-mine' : ''}`} href={`/dashboard/kontrak/${c.code}?tab=${step.tab}`}>
                            {mine && <Icon name="arrow" />}
                            {step.text}
                          </Link>
                        ) : (
                          <span className="d-muted">{statusLabels[c.status]}</span>
                        )}
                        {isDesa && isEditable(c) && openCritical(c) > 0 && <small className="is-red d-block">{openCritical(c)} temuan kritis</small>}
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
