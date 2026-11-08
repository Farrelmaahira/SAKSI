'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import { isActive } from '@/lib/db/is-active'
import { isEditable } from '@/lib/db/is-editable'
import { valueOf } from '@/lib/db/value-of'
import { daysUntil } from '@/lib/dates/days-until'
import { isClosed } from '@/lib/db/is-closed'
import { desaAnswered } from '@/lib/db/desa-answered'
import { openCritical } from '@/lib/db/open-critical'
import type { Todo } from '@/interfaces/dash'
import { isLate } from '@/lib/db/is-late'
import { deadlineOf } from '@/lib/db/deadline-of'
import { formatRp } from '@/lib/contracts/format-rp'
import { fmtDate } from '@/lib/dates/fmt-date'
import { nextStep } from '@/lib/db/next-step'
import PageHead from '@/components/molecules/PageHead'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { greeting } from '@/lib/dash/greeting'
import Btn from '@/components/atoms/Btn'
import Stat from '@/components/molecules/Stat'
import { rpShort } from '@/lib/dash/rp-short'
import Panel from '@/components/molecules/Panel'
import TodoList from '@/components/molecules/TodoList'
import Link from 'next/link'
import Activity from '@/components/molecules/Activity'
import { scopeLogs } from '@/lib/db/scope-logs'

export default function DesaHome() {
  const { session } = useDash()
  const d = db.use()
  const logs = auditStore.use()
  const r = session.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const year = new Date().getFullYear()
  const active = contracts.filter(isActive)
  const yearValue = contracts.filter((c) => !isEditable(c) && new Date(c.createdAt).getFullYear() === year).reduce((s, c) => s + valueOf(c), 0)
  const due = contracts.flatMap((c) => c.terms.filter((t) => !t.paidDate && daysUntil(t.planDate) <= 7 && isActive(c)).map((t) => ({ c, t })))
  const unanswered = reports.filter((x) => !isClosed(x) && !desaAnswered(x))
  const critical = contracts.filter(isEditable).reduce((s, c) => s + openCritical(c), 0)

  const todos: Todo[] = [
    ...contracts
      .filter((c) => isLate(c))
      .map((c) => ({ key: `late-${c.code}`, c, text: `Progres terlambat ${-daysUntil(deadlineOf(c))} hari`, tab: 'progres', tone: 'red' as const })),
    ...unanswered.map((x) => {
      const c = contracts.find((k) => k.code === x.contractCode)!
      return { key: `rep-${x.id}`, c, text: `Laporan warga belum ditanggapi: ${x.category.toLowerCase()}`, tab: 'laporan', tone: 'red' as const, when: x.id }
    }),
    ...due.map(({ c, t }) => ({
      key: `term-${c.code}-${t.no}`,
      c,
      text: `${t.label} ${daysUntil(t.planDate) < 0 ? 'lewat jatuh tempo' : 'jatuh tempo'} (${formatRp(t.amount)})`,
      tab: 'termin',
      tone: daysUntil(t.planDate) < 0 ? ('red' as const) : ('blue' as const),
      when: fmtDate(t.planDate),
    })),
    ...contracts.flatMap((c) => {
      const n = nextStep(c)
      return n && n.who === 'perangkat_desa' && n.tab !== 'progres' && n.tab !== 'termin' ? [{ key: `step-${c.code}`, c, text: n.text, tab: n.tab, tone: 'blue' as const }] : []
    }),
  ]

  return (
    <>
      <PageHead
        label={`Beranda · ${wilayahLabel(r)}`}
        title={`${greeting()}, ${session.name.split(' ')[0]}.`}
        desc="Ringkasan kontrak desa hari ini. Mulai dari daftar “Perlu tindakan”."
        actions={
          <Btn to="/dashboard/kontrak/baru" icon="plus">
            Buat kontrak
          </Btn>
        }
      />
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[repeat(5,minmax(0,1fr))] d-stats">
        <Stat label="Kontrak aktif" value={active.length} hint={`${contracts.length} kontrak total`} icon="file" to="/dashboard/kontrak" />
        <Stat label={`Nilai kontrak ${year}`} value={rpShort(yearValue)} hint="Kontrak yang sudah dikirim" icon="wallet" tone="ink" />
        <Stat label="Termin jatuh tempo" value={due.length} hint="7 hari ke depan atau lewat" icon="clock" tone={due.some(({ t }) => daysUntil(t.planDate) < 0) ? 'red' : 'blue'} />
        <Stat label="Laporan belum ditanggapi" value={unanswered.length} hint="Dari warga" icon="flag" tone={unanswered.length ? 'red' : 'blue'} to="/dashboard/laporan" />
        <Stat label="Temuan AI kritis" value={critical} hint="Di draf yang belum dikirim" icon="alert" tone={critical ? 'red' : 'blue'} />
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Perlu tindakan" desc={todos.length ? `${todos.length} hal menunggu Anda` : undefined}>
          <TodoList items={todos} empty="Semua beres. Tidak ada yang menunggu Anda." />
        </Panel>
        <Panel title="Aktivitas terakhir" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/jejak-audit">Lihat semua</Link>}>
          <Activity logs={scopeLogs(logs, r, d).slice(0, 7)} />
        </Panel>
      </div>
    </>
  )
}
