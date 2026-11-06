'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { auditStore } from '@/lib/audit/audit-store'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { daysUntil } from '@/lib/dates/days-until'
import { isActive } from '@/lib/db/is-active'
import type { Todo } from '@/interfaces/dash'
import { fmtDate } from '@/lib/dates/fmt-date'
import PageHead from '@/components/molecules/PageHead'
import { greeting } from '@/lib/dash/greeting'
import Stat from '@/components/molecules/Stat'
import { rpShort } from '@/lib/dash/rp-short'
import Panel from '@/components/molecules/Panel'
import TodoList from '@/components/molecules/TodoList'
import Link from 'next/link'
import { formatRp } from '@/lib/contracts/format-rp'
import Badge from '@/components/atoms/Badge'
import ContractMini from '@/components/molecules/ContractMini'
import Activity from '@/components/molecules/Activity'
import { scopeLogs } from '@/lib/db/scope-logs'

export default function PihakHome() {
  const { session } = useDash()
  const d = db.use()
  const logs = auditStore.use()
  const r = session.role
  const cp = counterpartyById(r.counterpartyId)
  const contracts = scopeContracts(d, r)
  const toReview = contracts.filter((c) => c.status === 'ditinjau' && !c.reviewDecision)
  const toSign = contracts.filter((c) => c.status === 'ditinjau' && c.reviewDecision === 'setuju' && !c.signatures.pihak)
  const running = contracts.filter((c) => c.status === 'berjalan' || c.status === 'dipublikasikan')
  const upcoming = contracts.flatMap((c) => c.terms.filter((t) => !t.paidDate && daysUntil(t.planDate) <= 30 && isActive(c)).map((t) => ({ c, t })))

  const todos: Todo[] = [
    ...toReview.map((c) => ({ key: `rv-${c.code}`, c, text: 'Undangan kontrak baru: tinjau dan beri komentar', tab: 'peninjauan', tone: 'blue' as const, when: fmtDate(c.history[c.history.length - 1]?.at) })),
    ...toSign.map((c) => ({ key: `sg-${c.code}`, c, text: 'Draf sudah Anda setujui. Tanda tangani kontrak', tab: 'tanda-tangan', tone: 'blue' as const })),
    ...contracts
      .filter((c) => c.status === 'ditinjau' && c.reviewDecision === 'revisi')
      .map((c) => ({ key: `rvs-${c.code}`, c, text: 'Menunggu desa memperbaiki draf sesuai permintaan Anda', tab: 'peninjauan', tone: 'ink' as const })),
  ]

  return (
    <>
      <PageHead label={`Beranda · ${cp?.name ?? 'Pihak kedua'}`} title={`${greeting()}, ${session.name.split(' ')[0]}.`} desc="Kontrak yang menunggu tinjauan dan tanda tangan Anda ada di sini." />
      <div className="d-stats d-stats-4">
        <Stat label="Menunggu tinjauan" value={toReview.length} icon="eye" tone={toReview.length ? 'red' : 'blue'} to="/dashboard/kontrak" />
        <Stat label="Menunggu tanda tangan" value={toSign.length} icon="sign" tone={toSign.length ? 'red' : 'blue'} />
        <Stat label="Kontrak berjalan" value={running.length} icon="file" />
        <Stat label="Termin akan cair" value={rpShort(upcoming.reduce((s, x) => s + x.t.amount, 0))} hint="30 hari ke depan" icon="wallet" tone="ink" to="/dashboard/termin" />
      </div>
      <div className="d-grid-2">
        <Panel title="Perlu tindakan">
          <TodoList items={todos} empty="Tidak ada undangan atau tanda tangan yang menunggu." />
        </Panel>
        <Panel title="Termin akan cair" action={<Link className="d-link" href="/dashboard/termin">Semua termin</Link>}>
          {upcoming.length ? (
            <ul className="d-list">
              {upcoming.map(({ c, t }) => (
                <li key={`${c.code}-${t.no}`}>
                  <div>
                    <strong>
                      {t.label} · {formatRp(t.amount)}
                    </strong>
                    <small>
                      <code>{c.code}</code> · {c.title}
                    </small>
                  </div>
                  <Badge tone={daysUntil(t.planDate) < 0 ? 'red' : 'tint'}>{fmtDate(t.planDate)}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="d-muted">Belum ada termin dalam 30 hari ke depan.</p>
          )}
        </Panel>
      </div>
      <div className="d-grid-2">
        <Panel title="Kontrak berjalan">
          {running.length ? <div className="d-minis">{running.map((c) => <ContractMini key={c.code} c={c} />)}</div> : <p className="d-muted">Belum ada kontrak berjalan.</p>}
        </Panel>
        <Panel title="Aktivitas terakhir">
          <Activity logs={scopeLogs(logs, r, d, session.name).slice(0, 6)} />
        </Panel>
      </div>
    </>
  )
}
