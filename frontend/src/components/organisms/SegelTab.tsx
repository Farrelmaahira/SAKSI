'use client'

import type { TabProps } from '@/interfaces/dash'
import { useEffect, useState } from 'react'
import { signedOrLater } from '@/lib/dash/signed-or-later'
import { latestVersion } from '@/lib/db/latest-version'
import { sha256 } from '@/lib/contracts/sha256'
import { canonicalText } from '@/lib/db/canonical-text'
import { sealContract } from '@/lib/db/seal-contract'
import { downloadTxt } from '@/lib/dash/download-txt'
import Panel from '@/components/molecules/Panel'
import Btn from '@/components/atoms/Btn'
import Icon from '@/components/atoms/Icon'
import Locked from '@/components/atoms/Locked'
import Badge from '@/components/atoms/Badge'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'

export default function SegelTab({ c, session }: TabProps) {
  const [current, setCurrent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const last = c.seals[c.seals.length - 1]
  const isDesa = session.role.role === 'perangkat_desa'
  const canSeal = isDesa && signedOrLater(c.status) && (!last || last.versionNo < latestVersion(c).no)

  useEffect(() => {
    let alive = true
    void sha256(canonicalText(c)).then((h) => alive && setCurrent(h))
    return () => {
      alive = false
    }
  }, [c])

  const seal = async () => {
    setBusy(true)
    await sealContract(c.code, session)
    setBusy(false)
  }
  const download = () => {
    // The file holds exactly the sealed canonical text, so "Verifikasi Segel" can match its hash
    downloadTxt(`${c.code}-tersegel-simulasi-pdf.txt`, canonicalText(c))
  }
  const intact = last && current ? last.hash === current : null

  return (
    <div className="grid gap-20 [&>*]:min-w-0">
      <Panel
        title="Segel dokumen"
        desc="Segel adalah sidik jari SHA-256 dari teks resmi versi terakhir. Bila satu huruf berubah, sidik jarinya berubah."
        action={
          last && (
            <Btn small variant="ghost" icon="doc" onClick={download}>
              Unduh tersegel (simulasi PDF)
            </Btn>
          )
        }
      >
        {last ? (
          <div className={`items-start rounded-[1.4rem] grid gap-12 grid-cols-[auto_minmax(0,1fr)] py-14 px-16 [&_strong]:font-[420] [&.is-ok]:bg-blue [&.is-ok]:text-white [&.is-bad]:bg-red! [&.is-bad]:text-white! d-integrity ${intact === false ? 'is-bad' : '[.d-checks_li&]:text-blue is-ok'}`}>
            <Icon name={intact === false ? 'alert' : 'shield'} />
            <div>
              <strong>{intact === null ? 'Memeriksa…' : intact ? 'Dokumen utuh. Isi sama dengan saat disegel.' : 'Isi dokumen berbeda dari segel terakhir.'}</strong>
              <code className="bg-soft rounded-[0.6rem] block font-code text-[1.2rem] leading-[1.5] mt-6 wrap-anywhere py-6 px-8 [.d-integrity_&]:bg-white [.d-chain_dd_&]:mt-3 [.d-integrity_&]:text-ink">{last.hash || 'menghitung…'}</code>
            </div>
          </div>
        ) : (
          <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{signedOrLater(c.status) ? 'Kontrak sudah ditandatangani dan siap disegel.' : 'Segel tersedia setelah semua tanda tangan lengkap.'}</p>
        )}
        {canSeal && (
          <Btn icon="shield" onClick={seal} disabled={busy}>
            {busy ? 'Menghitung SHA-256…' : last ? `Segel versi ${latestVersion(c).no}` : 'Segel dokumen'}
          </Btn>
        )}
        {!isDesa && !last && <Locked text="Penyegelan dilakukan oleh perangkat desa." />}
      </Panel>
      {c.seals.length > 0 && (
        <Panel title="Rantai segel" desc="Setiap segel menyimpan hash segel sebelumnya, sehingga urutan tidak bisa diubah diam-diam.">
          <ol className="grid gap-10 list-none list-outside [&_li]:border-l-[0.3rem] [&_li]:border-l-blue [&_li]:[border-left-style:solid] [&_li]:grid [&_li]:gap-8 [&_li]:pt-4 [&_li]:pr-0 [&_li]:pb-4 [&_li]:pl-16 [&_dt]:text-[1.2rem] [&_dt]:text-dim [&_dd]:mb-6 d-chain">
            {[...c.seals].reverse().map((s, i) => (
              <li key={`${s.at}-${i}`}>
                <div className="items-center flex gap-10 [&_small]:text-[1.25rem] [&_small]:text-dim">
                  <Badge tone="blue">Versi {s.versionNo}</Badge>
                  <small>{fmtDateTime(s.at)}</small>
                </div>
                <dl>
                  <dt>Hash</dt>
                  <dd>
                    <code className="bg-soft rounded-[0.6rem] block font-code text-[1.2rem] leading-[1.5] mt-6 wrap-anywhere py-6 px-8 [.d-integrity_&]:bg-white [.d-chain_dd_&]:mt-3 [.d-integrity_&]:text-ink">{s.hash || 'menghitung…'}</code>
                  </dd>
                  <dt>Hash sebelumnya</dt>
                  <dd>{s.prev ? <code className="bg-soft rounded-[0.6rem] block font-code text-[1.2rem] leading-[1.5] mt-6 wrap-anywhere py-6 px-8 [.d-integrity_&]:bg-white [.d-chain_dd_&]:mt-3 [.d-integrity_&]:text-ink">{s.prev}</code> : <span className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Segel pertama</span>}</dd>
                </dl>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  )
}
