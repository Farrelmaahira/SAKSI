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
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <Panel title="Publikasi ke portal warga" desc="Warga bisa mencari kontrak dengan kode atau hash, memeriksa keaslian, dan mengirim laporan.">
        {c.publication && (
          <div className="items-start rounded-[1.4rem] grid gap-12 grid-cols-[auto_minmax(0,1fr)] py-14 px-16 [&_strong]:font-[420] [&.is-ok]:bg-blue [&.is-ok]:text-white [&.is-bad]:bg-red! [&.is-bad]:text-white! [.d-checks_li&]:text-blue d-integrity is-ok">
            <Icon name="globe" />
            <div>
              <strong>Tampil di portal sejak {fmtDate(c.publication.at)}</strong>
              <Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue text-[1.3rem] p-0 whitespace-nowrap [&:hover]:text-ink [.d-callout_&]:[color:inherit]! [.d-integrity_&]:inline-block [.d-integrity_&]:mt-6 [.d-integrity_&]:text-white! [.app-notif-panel_header_&:disabled]:text-dim [.app-notif-panel_header_&:disabled]:cursor-default" href={`/lacak?q=${c.code}`}>
                Lihat di portal publik
              </Link>
            </div>
          </div>
        )}
        {!sealed ? (
          <Locked text="Segel dokumen terlebih dahulu. Hanya dokumen tersegel yang bisa dipublikasikan." />
        ) : !isDesa ? (
          !c.publication && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">Belum dipublikasikan oleh desa.</p>
        ) : editing ? (
          <>
            <fieldset className="border-0 border-none grid gap-6 [&_legend]:text-[1.25rem] [&_legend]:tracking-[0.04em] [&_legend]:mb-8 [&_legend]:text-dim [&_legend]:uppercase [&_label]:items-start [&_label]:cursor-pointer [&_label]:flex [&_label]:text-[1.45rem]! [&_label]:gap-10 [&_label]:leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18">
              <legend>Bagian yang tampil untuk warga</legend>
              {pubFields.map((f) => (
                <label key={f}>
                  <input type="checkbox" checked={fields.includes(f)} onChange={() => toggle(f)} />
                  <span>{pubFieldLabels[f]}</span>
                </label>
              ))}
            </fieldset>
            <p className="text-[1.25rem] leading-[1.5] text-dim [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid]">Menyembunyikan bagian hanya mengubah tampilan. Teks resmi dan hash segel tetap sama, sehingga warga masih bisa memeriksa keaslian.</p>
            <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              <span>Saya sudah memeriksa bagian yang ditampilkan dan tidak ada data pribadi yang tidak perlu.</span>
            </label>
            <div className="items-center flex flex-wrap gap-10">
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
        <ul className="grid gap-6 list-none list-outside [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-10 [&_li]:text-dim [&_li_small]:text-[1.2rem] [&_li_small]:ml-auto [&_li_small]:text-dim d-checks">
          {pubFields.map((f) => {
            const on = (c.publication ? c.publication.fields : fields).includes(f)
            return (
              <li key={f} className={on ? '[.d-checks_li&]:text-blue is-ok' : '[.d-checks_li&]:text-dim'}>
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
