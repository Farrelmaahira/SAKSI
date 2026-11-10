'use client'

import { useEffect, useState } from 'react'
import type { TabProps } from '@/interfaces/dash'
import type { ApiResult } from '@/interfaces/api'
import type { DReport } from '@/interfaces/db'
import { db } from '@/lib/db/db'
import { allReports } from '@/lib/db/all-reports'
import { listContractReports } from '@/lib/api/list-contract-reports'
import { listReports } from '@/lib/api/list-reports'
import { toDReport } from '@/lib/api/to-dreport'
import Empty from '@/components/molecules/Empty'
import FormAlert from '@/components/atoms/FormAlert'
import ReportCard from '@/components/organisms/ReportCard'

export default function LaporanTab({ c, session }: TabProps) {
  const d = db.use()
  const role = session.role.role
  const [server, setServer] = useState<{ id: number; result: ApiResult<DReport[]> } | null>(null)
  const [tick, setTick] = useState(0)

  // server contracts: officials get every report on the contract, a citizen only their own (GET /reports is scoped by role)
  useEffect(() => {
    const id = c.apiId
    if (!id) return
    let active = true
    ;(role === 'warga' ? listReports(id) : listContractReports(id)).then((r) => {
      if (active) setServer({ id, result: r.ok ? { ok: true, data: r.data.map((x) => toDReport(x, c.code)) } : r })
    })
    return () => {
      active = false
    }
  }, [c.apiId, c.code, role, tick])

  // contracts that exist only on this device (demo seed) keep their local reports
  const result = c.apiId ? (server?.id === c.apiId ? server.result : null) : { ok: true as const, data: allReports(d).filter((r) => r.contractCode === c.code) }
  if (!result) return <p className="text-[1.4rem] text-dim" role="status">Memuat laporan warga…</p>
  if (!result.ok) return <FormAlert>{result.error}</FormAlert>
  const reports = result.data
  // the server already scopes reports per role; the local demo shows Inspektorat only escalated ones
  const visible = role === 'inspektorat' && !c.apiId ? reports.filter((r) => r.actions.some((a) => a.kind === 'eskalasi')) : reports
  if (!visible.length)
    return <Empty title={role === 'inspektorat' ? 'Tidak ada laporan yang diteruskan untuk kontrak ini.' : 'Belum ada laporan warga untuk kontrak ini.'} text="Warga bisa melapor lewat portal publik dengan kode kontrak." />
  return (
    <div className="grid gap-14">
      {visible.map((r) => (
        <ReportCard key={r.id} report={r} contract={c} session={session} onChanged={() => setTick((t) => t + 1)} />
      ))}
    </div>
  )
}
