'use client'

import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { useServerContract } from '@/hooks/use-server-contract'
import { db } from '@/lib/db/db'
import { scopeContracts } from '@/lib/db/scope-contracts'
import { listPublicContracts } from '@/lib/api/list-public-contracts'
import type { DContract } from '@/interfaces/db'
import type { TemplateKey } from '@/interfaces/drafting'
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
import CancelContractButton from '@/components/organisms/CancelContractButton'

export default function KontrakDetailTemplate() {
  const { code = '' } = useParams<{ code: string }>()
  const { session } = useDash()
  const d = db.use()
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [dbContract, setDbContract] = useState<DContract | null>(null)
  // links from the API (notifications, termin) use the server id instead of the local code
  const scopedC = scopeContracts(d, session.role).find((x) => x.code === code || String(x.apiId) === code)

  useEffect(() => {
    if (session.role.role === 'warga' && !scopedC) {
      let active = true
      listPublicContracts().then((r) => (r.ok ? r.data : [])).then((list) => {
        if (!active || !list) return
        const found = list.find((x) => x.nomor === code || String(x.id) === code)
        if (found) {
          setDbContract({
            code: found.nomor,
            title: found.judul,
            template: (found.jenis as TemplateKey) || 'pengadaan',
            counterpartyId: 'cp-maju',
            villageId: 'sukamaju',
            status: found.status === 'selesai' ? 'selesai' : 'berjalan',
            createdAt: '2026-11-06',
            versions: [
              {
                no: 1,
                at: '2026-11-06',
                answers: {
                  work: found.judul,
                  value: found.nilai,
                  deadline: found.tenggat || '2026-12-31',
                  scheme: 'Sekaligus',
                  terms: 1,
                  method: 'Pengadaan Langsung',
                },
                clauses: [],
                audit: { at: '2026-11-06', score: 100, findings: [] },
              },
            ],
            reviews: [],
            signatures: {},
            seals: [],
            terms: [],
            progress: [],
            history: [],
            selfReport: false,
          })
        }
      })
      return () => {
        active = false
      }
    }
  }, [code, scopedC, session.role])

  const c = scopedC || dbContract
  const loading = useServerContract(code, session.role, !c && session.role.role !== 'warga')

  if (!c && loading) return <Empty art="document-ready_o5d5" title="Memuat kontrak…" text="Mengambil kontrak dari server." />

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
      <nav className="[&_a]:items-center [&_a]:inline-flex [&_a]:text-[1.3rem] [&_a]:gap-8 [&_a]:tracking-[0.04em] [&_a]:text-dim [&_a]:pt-10 [&_a]:uppercase [&_a:hover]:text-blue">
        <Link href="/dashboard/kontrak">
          <Icon name="arrow" className="flip" />
          Kontrak
        </Link>
      </nav>
      <header className="items-center flex flex-wrap gap-y-16 gap-x-24 justify-between px-0 pb-4 pt-0">
        <div>
          <p className="text-[1.25rem] tracking-[0.06em] text-dim uppercase [&_code]:font-code [&_code]:tracking-[0]">
            <code>{c.code}</code> · {templates[c.template].label} · {villageById(c.villageId)?.name}
          </p>
          <h1 className="text-[3.6rem] font-[320] tracking-[-0.035em] leading-[1.05] mt-6 max-w-800 md:text-[4.4rem]">{c.title}</h1>
          <div className="items-center flex flex-wrap text-[1.4rem] gap-y-6 gap-x-16 mt-14">
            <StatusBadge status={c.status} />
            <span>{counterpartyById(c.counterpartyId)?.name}</span>
            <span>{formatRp(valueOf(c))}</span>
            {readOnly && (
              <span className="items-center inline-flex gap-6 text-dim">
                <Icon name="eye" /> Hanya baca
              </span>
            )}
          </div>
        </div>
        <div className="items-center flex flex-wrap gap-10">
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
          <CancelContractButton c={c} session={session} />
        </div>
      </header>
      <Tabs items={items} value={tab} onChange={go} />
      <div className="[animation:pop_0.3s_ease-out] grid gap-20" role="tabpanel">
        <Active c={c} session={session} go={go} />
      </div>
    </>
  )
}
