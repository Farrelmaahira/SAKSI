'use client'

import ApiRowList from '@/components/molecules/ApiRowList'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import LhpContracts from '@/components/organisms/LhpContracts'
import LhpDetail from '@/components/organisms/LhpDetail'
import { useLhp } from '@/hooks/use-lhp'
import { apiUserId } from '@/lib/auth/api-user-id'

/* Uji petik dan LHP: inspektorat writes and publishes; desa and BPD read published ones of their village */
export default function LhpTemplate() {
  const { session, isInsp, allowed, list, contracts, open, setOpen, refresh } = useLhp()
  if (!allowed) return <NotAllowed />

  return (
    <>
      <PageHead
        label="Uji petik dan LHP"
        title="Uji petik dan Laporan Hasil Pemeriksaan"
        desc={isInsp ? 'Catat temuan atas SPK, termin, atau pasal kontrak, lalu terbitkan LHP ke desa dan BPD.' : 'LHP yang sudah diterbitkan Inspektorat untuk kontrak desa Anda.'}
      />
      <div className="items-start grid gap-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] [&>*]:min-w-0">
        <Panel title="Daftar LHP">
          <ApiRowList
            result={list}
            loading="Memuat LHP…"
            empty="Belum ada LHP."
            emptyText={isInsp ? 'LHP bisa disusun untuk kontrak di wilayah Anda atau yang ditugaskan kepada Anda.' : 'LHP muncul di sini setelah Inspektorat menerbitkannya.'}
            toRow={(x) => ({
              key: x.id,
              title: (
                <button type="button" className="text-left [background:none] border-0 p-0 [&:hover_strong]:text-blue" onClick={() => setOpen(x.id)} aria-pressed={open === x.id}>
                  <strong>{x.contractJudul}</strong>
                </button>
              ),
              sub: `${x.jenis === 'uji_petik' ? 'Uji petik' : 'LHP'} · ${x.villageName} · ${x.jumlahTemuan} temuan`,
              badge: x.status === 'terbit' ? 'Terbit' : 'Draf',
              badgeTone: x.status === 'terbit' ? 'done' : 'muted',
            })}
          />
        </Panel>
        <div className="grid gap-20 [&>*]:min-w-0">
          {open !== null && <LhpDetail id={open} userId={apiUserId(session.userId)} onChange={refresh} />}
          {isInsp && (
            <LhpContracts
              contracts={contracts}
              onCreated={(x) => {
                setOpen(x.id)
                refresh()
              }}
            />
          )}
        </div>
      </div>
    </>
  )
}
