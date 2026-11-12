'use client'

import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import Chips from '@/components/molecules/Chips'
import DateFilter from '@/components/molecules/DateFilter'
import Empty from '@/components/molecules/Empty'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import SearchBox from '@/components/molecules/SearchBox'
import AuditTrailTable from '@/components/organisms/AuditTrailTable'
import { useAuditTrail } from '@/hooks/use-audit-trail'
import { useDash } from '@/hooks/use-dash'
import type { AuditFilter } from '@/interfaces/dash'

const CHIPS: { key: AuditFilter; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'kontrak', label: 'Kontrak' },
  { key: 'laporan', label: 'Laporan warga' },
  { key: 'akun', label: 'Akun & lainnya' },
]

export default function JejakAuditTemplate() {
  const { session } = useDash()
  const role = session.role.role
  // GET /audit-logs: desa, BPD, Inspektorat and penyedia (admin daerah and warga have no access)
  const allowed = role !== 'warga' && role !== 'admin_daerah'
  const t = useAuditTrail(allowed)
  const { current, loaded, list } = t

  if (!allowed) return <NotAllowed />

  return (
    <>
      <PageHead label="Jejak audit" title="Jejak audit" desc="Setiap tindakan penting tercatat otomatis dan tidak bisa dihapus dari dashboard." />
      <Panel>
        <div className="items-center flex flex-wrap gap-12 justify-between">
          <Chips items={CHIPS.map((c) => ({ ...c, count: t.count(c.key) }))} value={t.filter} onChange={t.setFilter} />
          <SearchBox label="Cari aktivitas" placeholder="Cari nama, tindakan, atau kontrak" value={t.query} onChange={t.setQuery} />
          <DateFilter label="Dari" value={t.from} max={t.to || undefined} onChange={t.setFrom} />
          <DateFilter label="Sampai" value={t.to} min={t.from || undefined} onChange={t.setTo} />
        </div>
        {!current ? (
          <p className="text-[1.4rem] text-dim" role="status">Memuat jejak audit…</p>
        ) : current.error && !loaded.length ? (
          <FormAlert>{current.error}</FormAlert>
        ) : list.length ? (
          <AuditTrailTable rows={list} withVillage={role === 'inspektorat'} />
        ) : (
          <Empty title={loaded.length ? 'Tidak ada aktivitas yang cocok.' : 'Belum ada aktivitas tercatat.'} text={!loaded.length && role === 'inspektorat' ? 'Aktivitas muncul untuk kontrak di wilayah Anda atau yang ditugaskan kepada Anda.' : undefined} />
        )}
        {current?.error && loaded.length > 0 && <FormAlert>{current.error}</FormAlert>}
        {current?.nextBefore && (
          <Btn variant="ghost" small onClick={t.more} disabled={current.loading}>
            {current.loading ? 'Memuat…' : 'Muat aktivitas lebih lama'}
          </Btn>
        )}
      </Panel>
    </>
  )
}
