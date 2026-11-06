'use client'

import { useRouter } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import { db } from '@/lib/db/db'
import { useState } from 'react'
import type { VerifyResult } from '@/interfaces/verify'
import { scopeContracts } from '@/lib/db/scope-contracts'
import type { SealedContract } from '@/interfaces/contract'
import { toPublic } from '@/lib/db/to-public'
import NotAllowed from '@/components/molecules/NotAllowed'
import { addAudit } from '@/lib/audit/add-audit'
import { roleLabels } from '@/data/auth'
import { shortHash } from '@/lib/contracts/short-hash'
import { regionOfContract } from '@/lib/db/region-of-contract'
import PageHead from '@/components/molecules/PageHead'
import VerifyDoc from '@/components/organisms/VerifyDoc'
import Panel from '@/components/molecules/Panel'
import Badge from '@/components/atoms/Badge'
import { villageById } from '@/lib/master/village-by-id'
import { fmtDate } from '@/lib/dates/fmt-date'
import Empty from '@/components/molecules/Empty'

export default function VerifikasiSegelTemplate() {
  const { session } = useDash()
  const router = useRouter()
  const d = db.use()
  const [checks, setChecks] = useState<(VerifyResult & { at: string })[]>([])
  const sealed = scopeContracts(d, session.role).filter((c) => c.seals.some((s) => s.hash))
  // Registry of every seal in the chain, so older versions are recognised as well
  const registry: SealedContract[] = sealed.flatMap((c) => c.seals.filter((s) => s.hash).map((s) => ({ ...toPublic(c, []), hash: s.hash })))

  if (session.role.role !== 'bpd' && session.role.role !== 'inspektorat') return <NotAllowed />

  const onResult = (r: VerifyResult) => {
    setChecks((list) => [{ ...r, at: new Date().toISOString() }, ...list].slice(0, 8))
    const c = sealed.find((x) => x.code === r.match?.code)
    addAudit({
      actor: session.name,
      role: roleLabels[session.role.role],
      action: r.match ? 'Memverifikasi segel: dokumen asli' : 'Memverifikasi segel: tidak cocok',
      detail: `${r.name} · ${shortHash(r.hash)}`,
      contractCode: r.match?.code,
      villageId: c?.villageId ?? session.role.villageId,
      regionId: c ? regionOfContract(c) : session.role.regionId,
    })
  }

  return (
    <>
      <PageHead label="Verifikasi segel" title="Periksa keaslian dokumen" desc="Unggah salinan kontrak yang Anda terima. SAKSI menghitung SHA-256 di peramban dan mencocokkannya dengan segel kontrak di wilayah Anda." />
      <section className="d-panel d-panel-ink">
        <VerifyDoc registry={registry} onOpen={(code) => router.push(`/dashboard/kontrak/${code}?tab=segel`)} onResult={onResult} />
      </section>
      <div className="d-grid-2">
        <Panel title="Pemeriksaan sesi ini" desc="Setiap pemeriksaan juga tercatat di jejak audit.">
          {checks.length ? (
            <ul className="d-list">
              {checks.map((x, i) => (
                <li key={i}>
                  <div>
                    <strong>{x.name}</strong>
                    <small>
                      <code>{shortHash(x.hash)}</code>
                    </small>
                  </div>
                  <Badge tone={x.match ? 'done' : 'red'}>{x.match ? `Asli · ${x.match.code}` : 'Tidak cocok'}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="d-muted">Belum ada dokumen yang diperiksa.</p>
          )}
        </Panel>
        <Panel title="Kontrak tersegel" desc={`${sealed.length} kontrak di wilayah Anda`}>
          {sealed.length ? (
            <ul className="d-list">
              {sealed.map((c) => {
                const s = c.seals[c.seals.length - 1]
                return (
                  <li key={c.code}>
                    <div>
                      <strong>{c.title}</strong>
                      <small>
                        <code>{c.code}</code> · {villageById(c.villageId)?.name} · v{s.versionNo} · {fmtDate(s.at)}
                      </small>
                    </div>
                    <code className="d-hash-short">{shortHash(s.hash)}</code>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty title="Belum ada kontrak tersegel." />
          )}
        </Panel>
      </div>
    </>
  )
}
