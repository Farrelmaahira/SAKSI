'use client'

import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import type { ApiResult, AuditReport, TerminListItem } from '@/interfaces/api'
import { listAuditReports } from '@/lib/api/list-audit-reports'
import { listTermin } from '@/lib/api/list-termin'
import { apiUserId } from '@/lib/auth/api-user-id'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import RowList from '@/components/molecules/RowList'
import Empty from '@/components/molecules/Empty'
import Badge from '@/components/atoms/Badge'
import FormAlert from '@/components/atoms/FormAlert'
import LhpForm from '@/components/organisms/LhpForm'
import LhpDetail from '@/components/organisms/LhpDetail'

/* Uji petik dan LHP: inspektorat writes and publishes; desa and BPD read published ones of their village */
export default function LhpTemplate() {
  const { session } = useDash()
  const r = session.role.role
  const isInsp = r === 'inspektorat'
  const allowed = isInsp || r === 'perangkat_desa' || r === 'bpd'
  const [list, setList] = useState<ApiResult<AuditReport[]> | null>(null)
  const [contracts, setContracts] = useState<ApiResult<TerminListItem[]> | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!allowed) return
    let active = true
    listAuditReports().then((x) => active && setList(x))
    return () => {
      active = false
    }
  }, [allowed, tick])

  // contracts in the inspektorat's scope that are signed or later (GET /termin)
  useEffect(() => {
    if (!isInsp) return
    let active = true
    listTermin().then((x) => active && setContracts(x))
    return () => {
      active = false
    }
  }, [isInsp])

  if (!allowed) return <NotAllowed />
  const reports = list?.ok ? list.data : []

  return (
    <>
      <PageHead
        label="Uji petik dan LHP"
        title="Uji petik dan Laporan Hasil Pemeriksaan"
        desc={isInsp ? 'Catat temuan atas SPK, termin, atau pasal kontrak, lalu terbitkan LHP ke desa dan BPD.' : 'LHP yang sudah diterbitkan Inspektorat untuk kontrak desa Anda.'}
      />
      <div className="items-start grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] [&>*]:min-w-0">
        <Panel title="Daftar LHP">
          {!list ? (
            <p className="text-[1.4rem] text-dim" role="status">Memuat LHP…</p>
          ) : !list.ok ? (
            <FormAlert>{list.error}</FormAlert>
          ) : reports.length ? (
            <RowList>
              {reports.map((x) => (
                <li key={x.id}>
                  <div>
                    <button type="button" className="text-left [background:none] border-0 p-0 [&:hover_strong]:text-blue" onClick={() => setOpen(x.id)} aria-pressed={open === x.id}>
                      <strong>{x.contractJudul}</strong>
                    </button>
                    <small>
                      {x.jenis === 'uji_petik' ? 'Uji petik' : 'LHP'} · {x.villageName} · {x.jumlahTemuan} temuan
                    </small>
                  </div>
                  <Badge tone={x.status === 'terbit' ? 'done' : 'muted'}>{x.status === 'terbit' ? 'Terbit' : 'Draf'}</Badge>
                </li>
              ))}
            </RowList>
          ) : (
            <Empty
              title="Belum ada LHP."
              text={isInsp ? 'LHP bisa disusun untuk kontrak di wilayah Anda atau yang ditugaskan kepada Anda.' : 'LHP muncul di sini setelah Inspektorat menerbitkannya.'}
            />
          )}
        </Panel>
        <div className="grid gap-20 [&>*]:min-w-0">
          {open !== null && <LhpDetail id={open} userId={apiUserId(session.userId)} onChange={() => setTick((t) => t + 1)} />}
          {isInsp &&
            (!contracts ? (
              <Panel><p className="text-[1.4rem] text-dim" role="status">Memuat kontrak…</p></Panel>
            ) : !contracts.ok ? (
              <Panel><FormAlert>{contracts.error}</FormAlert></Panel>
            ) : contracts.data.length ? (
              <LhpForm
                contracts={contracts.data}
                onCreated={(x) => {
                  setOpen(x.id)
                  setTick((t) => t + 1)
                }}
              />
            ) : (
              <Panel><Empty title="Belum ada kontrak untuk diperiksa." text="Kontrak muncul bila desanya ada di wilayah Anda atau ditugaskan kepada Anda oleh admin daerah." /></Panel>
            ))}
        </div>
      </div>
    </>
  )
}
