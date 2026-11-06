import type { Session } from '@/interfaces/auth'
import type { Db } from '@/interfaces/db'
import type { AuditLog } from '@/interfaces/audit'
import type { Notif } from '@/interfaces/notifications'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { scopeReports } from '@/lib/db/scope-reports'
import { nextStep } from '@/lib/db/next-step'
import { isClosed } from '@/lib/db/is-closed'
import { desaAnswered } from '@/lib/db/desa-answered'
import { isActive } from '@/lib/db/is-active'
import { daysUntil } from '@/lib/dates/days-until'
import { fmtDate } from '@/lib/dates/fmt-date'
import { scopeLogs } from '@/lib/db/scope-logs'

export function notificationsFor(s: Session, d: Db, logs: AuditLog[]): Notif[] {
  const r = s.role
  const contracts = scopeContracts(d, r)
  const reports = scopeReports(d, r)
  const list: Notif[] = []
  const lastAt = (code: string) => contracts.find((c) => c.code === code)?.history.at(-1)?.at ?? new Date().toISOString()

  for (const c of contracts) {
    const step = nextStep(c)
    if (!step || step.who !== r.role || (r.role === 'perangkat_desa' && (step.tab === 'progres' || step.tab === 'termin'))) continue
    list.push({ id: `step:${c.code}:${c.status}:${step.tab}:${c.versions.length}`, kind: 'tindakan', title: step.text, text: `${c.code} · ${c.title}`, to: `/dashboard/kontrak/${c.code}?tab=${step.tab}`, at: lastAt(c.code), tone: 'blue' })
  }

  const needsMe = reports.filter((x) =>
    r.role === 'perangkat_desa' ? !isClosed(x) && !desaAnswered(x) : r.role === 'bpd' ? x.flow === 'baru' : r.role === 'inspektorat' ? x.flow === 'diteruskan' : false,
  )
  for (const x of needsMe) {
    const title = r.role === 'perangkat_desa' ? 'Laporan warga perlu ditanggapi' : r.role === 'bpd' ? 'Laporan warga baru perlu diverifikasi' : 'Laporan diteruskan BPD'
    list.push({ id: `rep:${x.id}:${x.flow}:${x.actions.length}`, kind: 'tindakan', title, text: `${x.id} · ${x.category}`, to: `/dashboard/kontrak/${x.contractCode}?tab=laporan`, at: x.actions.at(-1)?.at ?? (/^\d{4}-/.test(x.date) ? x.date : lastAt(x.contractCode)), tone: 'red' })
  }

  if (r.role === 'perangkat_desa' || r.role === 'pihak_kedua') {
    const horizon = r.role === 'perangkat_desa' ? 7 : 14
    for (const c of contracts.filter(isActive))
      for (const t of c.terms.filter((t) => !t.paidDate && daysUntil(t.planDate) <= horizon)) {
        const late = daysUntil(t.planDate) < 0
        list.push({
          id: `term:${c.code}:${t.no}`,
          kind: 'tindakan',
          title: `${t.label} ${late ? 'lewat jatuh tempo' : `jatuh tempo ${fmtDate(t.planDate)}`}`,
          text: `${c.code} · ${c.title}`,
          to: `/dashboard/kontrak/${c.code}?tab=termin`,
          at: t.planDate,
          tone: late ? 'red' : 'ink',
        })
      }
  }

  for (const l of scopeLogs(logs, r, d, s.name).filter((l) => l.actor !== s.name && l.action !== 'Masuk').slice(0, 12))
    list.push({
      id: `log:${l.id}`,
      kind: 'aktivitas',
      title: `${l.actor} ${l.action.charAt(0).toLowerCase()}${l.action.slice(1)}`,
      text: [l.contractCode, l.detail].filter(Boolean).join(' · ') || l.role,
      to: l.contractCode ? `/dashboard/kontrak/${l.contractCode}` : '/dashboard',
      at: l.at,
      tone: 'ink',
    })

  return list.sort((a, b) => (a.kind === b.kind ? b.at.localeCompare(a.at) : a.kind === 'tindakan' ? -1 : 1))
}
