'use client'

import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
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
import ActivityFeed from '@/components/molecules/ActivityFeed'

export default function PihakHome() {
  const { session } = useDash()
  const d = db.use()
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
      <div className="grid gap-12 grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(4,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] d-stats">
        <Stat label="Menunggu tinjauan" value={toReview.length} icon="eye" tone={toReview.length ? 'red' : 'blue'} to="/dashboard/kontrak" />
        <Stat label="Menunggu tanda tangan" value={toSign.length} icon="sign" tone={toSign.length ? 'red' : 'blue'} />
        <Stat label="Kontrak berjalan" value={running.length} icon="file" />
        <Stat label="Termin akan cair" value={rpShort(upcoming.reduce((s, x) => s + x.t.amount, 0))} hint="30 hari ke depan" icon="wallet" tone="ink" to="/dashboard/termin" />
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Perlu tindakan">
          <TodoList items={todos} empty="Tidak ada undangan atau tanda tangan yang menunggu." />
        </Panel>
        <Panel title="Termin akan cair" action={<Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href="/dashboard/termin">Semua termin</Link>}>
          {upcoming.length ? (
            <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
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
            <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada termin dalam 30 hari ke depan.</p>
          )}
        </Panel>
      </div>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Kontrak berjalan">
          {running.length ? <div className="grid gap-10">{running.map((c) => <ContractMini key={c.code} c={c} />)}</div> : <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada kontrak berjalan.</p>}
        </Panel>
        <Panel title="Aktivitas terakhir">
          <ActivityFeed limit={6} />
        </Panel>
      </div>
    </>
  )
}
