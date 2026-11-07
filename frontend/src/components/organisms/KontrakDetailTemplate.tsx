'use client'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import { allTabs } from '@/data/dash-tabs'
import { tabsFor } from '@/data/dash'
import { nextStep } from '@/lib/db/next-step'
import { allReports } from '@/lib/db/all-reports'
import { isClosed } from '@/lib/db/is-closed'
import type { TabItem } from '@/interfaces/dash'
import { openCritical } from '@/lib/db/open-critical'
import Link from 'next/link'
import Icon from '@/components/atoms/Icon'
import { templates } from '@/data/drafting'
import { villageById } from '@/lib/master/village-by-id'
import StatusBadge from '@/components/atoms/StatusBadge'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import { formatRp } from '@/lib/contracts/format-rp'
import { valueOf } from '@/lib/db/value-of'
import { isPublic } from '@/lib/db/is-public'
import Tabs from '@/components/molecules/Tabs'

export default function KontrakDetailTemplate() {
  const { code = '' } = useParams<{ code: string }>()
  const { session } = useDash()
  const d = db.use()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const c = scopeContracts(d, session.role).find((x) => x.code === code)

  if (!c)
    return (
      <Empty
        art="document-warning_2es6"
        title={`Kontrak ${code} tidak ditemukan.`}
        text="Kontrak mungkin bukan bagian dari wilayah atau usaha Anda, atau belum dikirim desa."
        action={<Btn to="/dashboard/kontrak">Ke daftar kontrak</Btn>}
      />
    )

  const allow = tabsFor[session.role.role]
  const tabs = allTabs.filter((t) => !allow || allow.includes(t.key))
  const tab = tabs.some((t) => t.key === params.get('tab')) ? params.get('tab')! : 'ringkasan'
  const go = (k: string) => router.replace(k === 'ringkasan' ? pathname : `${pathname}?tab=${k}`, { scroll: false })
  const step = nextStep(c)
  const openReports = allReports(d).filter((r) => r.contractCode === c.code && !isClosed(r)).length
  const items: TabItem[] = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    badge: t.key === 'laporan' ? openReports : t.key === 'audit' ? openCritical(c) : t.key === 'peninjauan' ? c.reviews.filter((r) => !r.resolved).length : undefined,
    done:
      (t.key === 'tanda-tangan' && Boolean(c.signatures.desa && c.signatures.pihak && c.signatures.meterai)) ||
      (t.key === 'segel' && c.seals.length > 0) ||
      (t.key === 'publikasi' && Boolean(c.publication)) ||
      (t.key === 'spk' && Boolean(c.spk)),
  }))
  const Active = tabs.find((t) => t.key === tab)!.C
  const readOnly = session.role.role === 'bpd' || session.role.role === 'inspektorat'

  return (
    <>
      <nav className="d-back">
        <Link href="/dashboard/kontrak">
          <Icon name="arrow" className="flip" />
          Kontrak
        </Link>
      </nav>
      <header className="d-detail-head">
        <div>
          <p className="d-label">
            <code>{c.code}</code> · {templates[c.template].label} · {villageById(c.villageId)?.name}
          </p>
          <h1 className="d-title">{c.title}</h1>
          <div className="d-detail-meta">
            <StatusBadge status={c.status} />
            <span>{counterpartyById(c.counterpartyId)?.name}</span>
            <span>{formatRp(valueOf(c))}</span>
            {readOnly && (
              <span className="d-readonly">
                <Icon name="eye" /> Hanya baca
              </span>
            )}
          </div>
        </div>
        <div className="d-head-actions">
          {isPublic(c) && (
            <Btn variant="ghost" icon="globe" to={`/lacak?q=${c.code}`}>
              Lihat di portal
            </Btn>
          )}
          {step && step.who === session.role.role && tab !== step.tab && (
            <Btn icon="arrow" onClick={() => go(step.tab)}>
              {step.text}
            </Btn>
          )}
        </div>
      </header>
      <Tabs items={items} value={tab} onChange={go} />
      <div className="d-tab-body" role="tabpanel">
        <Active c={c} session={session} go={go} />
      </div>
    </>
  )
}
