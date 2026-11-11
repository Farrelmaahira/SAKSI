'use client'

import ApiRowList from '@/components/molecules/ApiRowList'
import Panel from '@/components/molecules/Panel'
import { useAdminOversight } from '@/hooks/use-admin-oversight'
import { jenisLabel } from '@/lib/admin/jenis-label'
import { fmtDate } from '@/lib/dates/fmt-date'
import AssignPengawasForm from './AssignPengawasForm'

/* Pengawas accounts in the region (GET /admin/pengawas) and contract assignments (GET/POST /admin/oversight-assignments) */
export default function AdminOversight() {
  const admin = useAdminOversight()
  return (
    <>
      <Panel title="Pengawas di wilayah Anda" desc="Akun BPD dan Inspektorat yang bisa ditugaskan.">
        <ApiRowList
          result={admin.pengawas}
          loading="Memuat pengawas…"
          empty="Belum ada akun pengawas di wilayah ini."
          toRow={(p) => ({ key: p.userId, title: p.nama, sub: `${p.email}${p.villageName ? ` · ${p.villageName}` : ''}`, badge: jenisLabel(p.jenis) })}
        />
      </Panel>
      <Panel title="Penugasan pengawas" desc="Pengawas yang ditugaskan bisa membaca kontrak itu dan mendapat notifikasi.">
        <ApiRowList
          result={admin.assigned}
          loading="Memuat penugasan…"
          empty="Belum ada penugasan."
          toRow={(a) => ({ key: a.id, title: a.contractJudul, sub: `${a.villageName} · ${a.pengawasNama} · sejak ${fmtDate(a.ditetapkanPada)}`, badge: jenisLabel(a.jenis) })}
        />
        <AssignPengawasForm admin={admin} />
      </Panel>
    </>
  )
}
