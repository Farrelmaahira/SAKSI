'use client'

import type { TabProps } from '@/interfaces/dash'
import { useState } from 'react'
import type { PubField } from '@/interfaces/db'
import { pubFieldLabels, pubFields } from '@/data/db'
import { publishContract } from '@/lib/db/publish-contract'
import Panel from '@/components/molecules/Panel'
import Icon from '@/components/atoms/Icon'
import { fmtDate } from '@/lib/dates/fmt-date'
import Link from 'next/link'
import Locked from '@/components/atoms/Locked'
import Btn from '@/components/atoms/Btn'

export default function PublikasiTab({ c, session }: TabProps) {
  const [fields, setFields] = useState<PubField[]>(c.publication?.fields ?? [...pubFields])
  const [confirm, setConfirm] = useState(false)
  const [editing, setEditing] = useState(!c.publication)
  const isDesa = session.role.role === 'perangkat_desa'
  const sealed = c.seals.length > 0

  const toggle = (f: PubField) => setFields(fields.includes(f) ? fields.filter((x) => x !== f) : [...fields, f])
  const publish = () => {
    publishContract(c.code, fields, session)
    setConfirm(false)
    setEditing(false)
  }

  return (
    <div className="d-grid-2 d-grid-wide">
      <Panel title="Publikasi ke portal warga" desc="Warga bisa mencari kontrak dengan kode atau hash, memeriksa keaslian, dan mengirim laporan.">
        {c.publication && (
          <div className="d-integrity is-ok">
            <Icon name="globe" />
            <div>
              <strong>Tampil di portal sejak {fmtDate(c.publication.at)}</strong>
              <Link className="d-link" href={`/lacak?q=${c.code}`}>
                Lihat di portal publik
              </Link>
            </div>
          </div>
        )}
        {!sealed ? (
          <Locked text="Segel dokumen terlebih dahulu. Hanya dokumen tersegel yang bisa dipublikasikan." />
        ) : !isDesa ? (
          !c.publication && <p className="d-muted">Belum dipublikasikan oleh desa.</p>
        ) : editing ? (
          <>
            <fieldset className="d-checklist">
              <legend>Bagian yang tampil untuk warga</legend>
              {pubFields.map((f) => (
                <label key={f}>
                  <input type="checkbox" checked={fields.includes(f)} onChange={() => toggle(f)} />
                  <span>{pubFieldLabels[f]}</span>
                </label>
              ))}
            </fieldset>
            <p className="d-fine">Menyembunyikan bagian hanya mengubah tampilan. Teks resmi dan hash segel tetap sama, sehingga warga masih bisa memeriksa keaslian.</p>
            <label className="d-confirm">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              <span>Saya sudah memeriksa bagian yang ditampilkan dan tidak ada data pribadi yang tidak perlu.</span>
            </label>
            <div className="d-btn-row">
              <Btn icon="globe" onClick={publish} disabled={!confirm}>
                {c.publication ? 'Simpan perubahan' : 'Publikasikan'}
              </Btn>
              {c.publication && (
                <Btn variant="ghost" onClick={() => setEditing(false)}>
                  Batal
                </Btn>
              )}
            </div>
          </>
        ) : (
          <Btn variant="ghost" onClick={() => setEditing(true)}>
            Ubah bagian yang tampil
          </Btn>
        )}
      </Panel>
      <Panel title="Yang dilihat warga">
        <ul className="d-checks">
          {pubFields.map((f) => {
            const on = (c.publication ? c.publication.fields : fields).includes(f)
            return (
              <li key={f} className={on ? 'is-ok' : 'is-off'}>
                <Icon name={on ? 'eye' : 'lock'} />
                {pubFieldLabels[f]}
                <small>{on ? 'Tampil' : 'Disembunyikan'}</small>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
