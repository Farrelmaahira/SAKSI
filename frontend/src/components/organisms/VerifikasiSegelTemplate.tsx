'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDash } from '@/hooks/use-dash'
import type { VerifyResult } from '@/interfaces/verify'
import type { ApiResult, SealItem } from '@/interfaces/api'
import { listSeals } from '@/lib/api/list-seals'
import NotAllowed from '@/components/molecules/NotAllowed'
import { shortHash } from '@/lib/contracts/short-hash'
import PageHead from '@/components/molecules/PageHead'
import VerifyDoc from '@/components/organisms/VerifyDoc'
import Panel from '@/components/molecules/Panel'
import Badge from '@/components/atoms/Badge'
import FormAlert from '@/components/atoms/FormAlert'
import { fmtDate } from '@/lib/dates/fmt-date'
import Empty from '@/components/molecules/Empty'

export default function VerifikasiSegelTemplate() {
  const { session } = useDash()
  const router = useRouter()
  const [checks, setChecks] = useState<VerifyResult[]>([])
  const [seals, setSeals] = useState<ApiResult<SealItem[]> | null>(null)
  const allowed = session.role.role === 'bpd' || session.role.role === 'inspektorat'

  useEffect(() => {
    if (!allowed) return
    let active = true
    listSeals().then((r) => active && setSeals(r))
    return () => {
      active = false
    }
  }, [allowed])

  if (!allowed) return <NotAllowed />
  // the server records every matching check in seal_verifications; this list is only the current session
  const onResult = (r: VerifyResult) => setChecks((list) => [r, ...list].slice(0, 8))
  const sealed = seals?.ok ? seals.data : []

  return (
    <>
      <PageHead label="Verifikasi segel" title="Periksa keaslian dokumen" desc="Unggah salinan kontrak yang Anda terima. SAKSI menghitung SHA-256 di peramban dan mencocokkannya dengan segel kontrak di wilayah Anda." />
      <section className="[align-content:start] rounded-[2rem] grid gap-16 bg-ink text-white py-30 px-24 md:p-40 d-panel-ink">
        <VerifyDoc onOpen={(_, id) => router.push(`/dashboard/kontrak/${id}?tab=segel`)} onResult={onResult} />
      </section>
      <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
        <Panel title="Pemeriksaan sesi ini" desc="Pemeriksaan yang cocok tercatat di server.">
          {checks.length ? (
            <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
              {checks.map((x, i) => (
                <li key={i}>
                  <div>
                    <strong>{x.name}</strong>
                    <small>
                      <code>{shortHash(x.hash)}</code>
                    </small>
                  </div>
                  <Badge tone={x.match ? 'done' : 'red'}>{x.match ? `Asli · ${x.match.code} v${x.match.version}` : 'Tidak cocok'}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum ada dokumen yang diperiksa.</p>
          )}
        </Panel>
        <Panel title="Kontrak tersegel" desc={seals?.ok ? `${sealed.length} segel di wilayah Anda` : undefined}>
          {!seals ? (
            <p className="text-[1.4rem] text-dim" role="status">Memuat segel…</p>
          ) : !seals.ok ? (
            <FormAlert>{seals.error}</FormAlert>
          ) : sealed.length ? (
            <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
              {sealed.map((x) => (
                <li key={x.sealId}>
                  <div>
                    <strong>{x.judul}</strong>
                    <small>
                      <code>{x.nomor}</code> · {x.villageName} · v{x.nomorVersi} · {fmtDate(x.waktuSegel)} · {x.jumlahVerifikasi} kali diverifikasi
                    </small>
                  </div>
                  <code className="text-blue font-code text-[1.2rem]">{shortHash(x.sha256)}</code>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Belum ada kontrak tersegel." text={session.role.role === 'inspektorat' ? 'Segel muncul bila desanya ada di wilayah Anda atau kontraknya ditugaskan kepada Anda.' : undefined} />
          )}
        </Panel>
      </div>
    </>
  )
}
