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
    <div className="d-stack">
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
          <div className={`d-integrity ${intact === false ? 'is-bad' : 'is-ok'}`}>
            <Icon name={intact === false ? 'alert' : 'shield'} />
            <div>
              <strong>{intact === null ? 'Memeriksa…' : intact ? 'Dokumen utuh. Isi sama dengan saat disegel.' : 'Isi dokumen berbeda dari segel terakhir.'}</strong>
              <code className="d-hash">{last.hash || 'menghitung…'}</code>
            </div>
          </div>
        ) : (
          <p className="d-muted">{signedOrLater(c.status) ? 'Kontrak sudah ditandatangani dan siap disegel.' : 'Segel tersedia setelah semua tanda tangan lengkap.'}</p>
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
          <ol className="d-chain">
            {[...c.seals].reverse().map((s, i) => (
              <li key={`${s.at}-${i}`}>
                <div className="d-chain-top">
                  <Badge tone="blue">Versi {s.versionNo}</Badge>
                  <small>{fmtDateTime(s.at)}</small>
                </div>
                <dl>
                  <dt>Hash</dt>
                  <dd>
                    <code className="d-hash">{s.hash || 'menghitung…'}</code>
                  </dd>
                  <dt>Hash sebelumnya</dt>
                  <dd>{s.prev ? <code className="d-hash">{s.prev}</code> : <span className="d-muted">Segel pertama</span>}</dd>
                </dl>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  )
}
