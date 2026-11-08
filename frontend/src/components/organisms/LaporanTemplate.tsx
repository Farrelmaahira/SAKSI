'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { useState } from 'react'
import type { LaporanFilter } from '@/interfaces/dash'
import NotAllowed from '@/components/molecules/NotAllowed'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import type { DReport } from '@/interfaces/db'
import { isClosed } from '@/lib/db/is-closed'
import { desaAnswered } from '@/lib/db/desa-answered'
import PageHead from '@/components/molecules/PageHead'
import Chips from '@/components/molecules/Chips'
import Icon from '@/components/atoms/Icon'
import ReportCard from '@/components/organisms/ReportCard'
import Empty from '@/components/molecules/Empty'
import LaporanSayaTemplate from '@/components/organisms/LaporanSayaTemplate'

export default function LaporanTemplate() {
  const { session } = useDash()
  const d = db.use()
  const r = session.role
  const [filter, setFilter] = useState<LaporanFilter>('perlu')
  const [q, setQ] = useState('')
  if (r.role === 'warga') return <LaporanSayaTemplate />
  if (r.role === 'pihak_kedua') return <NotAllowed />

  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const needsMe = (x: DReport) =>
    r.role === 'perangkat_desa' ? !isClosed(x) && !desaAnswered(x) : r.role === 'bpd' ? !isClosed(x) && x.flow !== 'diteruskan' : x.flow === 'diteruskan'
  const match = (x: DReport) => {
    if (filter === 'perlu' && !needsMe(x)) return false
    if (filter === 'proses' && (isClosed(x) || x.flow === 'baru')) return false
    if (filter === 'selesai' && !isClosed(x)) return false
    const t = q.trim().toLowerCase()
    return !t || [x.id, x.contractCode, x.category, x.text, x.location].some((v) => v?.toLowerCase().includes(t))
  }
  const list = reports.filter(match)
  const counts = { perlu: reports.filter(needsMe).length, semua: reports.length, proses: reports.filter((x) => !isClosed(x) && x.flow !== 'baru').length, selesai: reports.filter(isClosed).length }

  const head = {
    perangkat_desa: { title: 'Laporan warga', desc: 'Tanggapi laporan supaya warga tahu tindak lanjutnya. Tanggapan tampil di portal publik.' },
    bpd: { title: 'Laporan warga', desc: 'Verifikasi laporan, minta klarifikasi desa, atau teruskan ke Inspektorat bila perlu pemeriksaan.' },
    inspektorat: { title: 'Laporan eskalasi', desc: 'Laporan yang diteruskan BPD dari desa-desa di wilayah Anda.' },
  }[r.role]

  return (
    <>
      <PageHead label="Laporan warga" title={head.title} desc={head.desc} />
      <div className="items-center flex flex-wrap gap-12 justify-between">
        <Chips
          items={[
            { key: 'perlu', label: 'Perlu tindakan', count: counts.perlu },
            { key: 'semua', label: 'Semua', count: counts.semua },
            { key: 'proses', label: 'Diproses', count: counts.proses },
            { key: 'selesai', label: 'Selesai', count: counts.selesai },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <label className="items-center bg-white border-[0.15rem] border-[#dcdcd8] border-solid rounded-[3rem] flex flex-[1_1_26rem] gap-8 max-w-400 min-h-42 py-0 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:border-blue focus-within:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_input]:[background:none] [&_input]:border-0 [&_input]:border-none [&_input]:flex-1 [&_input]:text-[1.4rem] [&_input]:min-w-0 [&_input]:[outline:0]">
          <Icon name="search" />
          <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">Cari laporan</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode laporan, kontrak, atau isi" />
        </label>
      </div>
      {list.length ? (
        <div className="grid gap-14">
          {list.map((x) => (
            <ReportCard key={x.id} report={x} contract={contracts.find((c) => c.code === x.contractCode)} session={session} />
          ))}
        </div>
      ) : (
        <div className="[align-content:start] bg-white rounded-[2rem] grid gap-16 p-20 md:p-24">
          <Empty title={filter === 'perlu' ? 'Tidak ada laporan yang menunggu Anda.' : 'Tidak ada laporan yang cocok.'} text="Laporan baru dari portal warga muncul di sini secara otomatis." />
        </div>
      )}
    </>
  )
}
