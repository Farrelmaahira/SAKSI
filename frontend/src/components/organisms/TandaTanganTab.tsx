'use client'

import { useState } from 'react'
import type { TabProps } from '@/interfaces/dash'
import { villageHeads } from '@/data/master'
import { latestVersion } from '@/lib/db/latest-version'
import LetterPreview from '@/components/organisms/LetterPreviewLazy'
import SignaturePad from '@/components/molecules/SignaturePadLazy'
import { statusOrder } from '@/data/db'
import { villageById } from '@/lib/master/village-by-id'
import { fmtDateTime } from '@/lib/dates/fmt-date-time'
import { sign } from '@/lib/db/sign'
import { applyMeterai } from '@/lib/db/apply-meterai'
import { counterpartyById } from '@/lib/master/counterparty-by-id'
import Panel from '@/components/molecules/Panel'
import Icon from '@/components/atoms/Icon'
import Btn from '@/components/atoms/Btn'
import { signContract } from '@/lib/api/sign-contract'
import FormAlert from '@/components/atoms/FormAlert'

export default function TandaTanganTab({ c, session }: TabProps) {
  const r = session.role.role
  const [image, setImage] = useState<string | null>(null)
  const [signError, setSignError] = useState('')
  const [signing, setSigning] = useState(false)
  // signatures are stored on the server first; the local copy only follows a confirmed save
  const signOnServer = async (who: 'desa' | 'pihak') => {
    if (!c.apiId) return
    setSigning(true)
    setSignError('')
    const res = await signContract(c.apiId, { metode: 'simulasi', referensi: image || `sig_${who === 'desa' ? 'desa' : 'vendor'}_${session.name}` })
    setSigning(false)
    if (!res.ok) return setSignError(`Tanda tangan belum tersimpan. ${res.error}`)
    sign(c.code, who, session, image ?? undefined)
    setImage(null)
  }
  const approved = c.reviewDecision === 'setuju' || statusOrder.indexOf(c.status) >= statusOrder.indexOf('ditandatangani')
  const s = c.signatures
  const steps = [
    {
      key: 'desa',
      title: 'Tanda tangan Kepala Desa',
      who: `Pemerintah ${villageById(c.villageId)?.name}`,
      done: s.desa ? `${s.desa.by} · ${fmtDateTime(s.desa.at)}` : null,
      can: r === 'perangkat_desa' && approved && !s.desa,
      action: () => signOnServer('desa'),
      label: 'Tanda tangani',
      wait: approved ? null : 'Menunggu persetujuan pihak kedua',
    },
    {
      key: 'meterai',
      title: 'E-meterai Rp10.000',
      who: 'Dibubuhkan desa (simulasi)',
      done: s.meterai ? `No. seri ${s.meterai.serial} · ${fmtDateTime(s.meterai.at)}` : null,
      can: r === 'perangkat_desa' && Boolean(s.desa) && !s.meterai,
      action: () => applyMeterai(c.code, session),
      label: 'Bubuhkan e-meterai',
      wait: s.desa ? null : 'Setelah tanda tangan Kepala Desa',
    },
    {
      key: 'pihak',
      title: 'Tanda tangan pihak kedua',
      who: counterpartyById(c.counterpartyId)?.name ?? 'Pihak kedua',
      done: s.pihak ? `${s.pihak.by} · ${fmtDateTime(s.pihak.at)}` : null,
      can: r === 'pihak_kedua' && approved && Boolean(s.desa && s.meterai) && !s.pihak,
      action: () => signOnServer('pihak'),
      label: 'Tanda tangani',
      wait: s.desa && s.meterai ? null : 'Setelah desa menandatangani dan e-meterai dibubuhkan',
    },
  ]
  const village = villageById(c.villageId)
  return (
    <>
    <Panel title="Tanda tangan elektronik" desc="Urutan: Kepala Desa, e-meterai, lalu pihak kedua. Tanda tangan dan e-meterai di prototipe ini adalah simulasi.">
      <ol className="grid gap-10 list-none list-outside [&_li]:items-center [&_li]:border-[0.15rem] [&_li]:border-[#ececea] [&_li]:border-solid [&_li]:rounded-[1.6rem] [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[auto_minmax(0,1fr)] [&_li]:p-16 [&_li>div]:grid [&_li>div]:gap-3 [&_li_strong]:text-[1.6rem] [&_li_strong]:font-[420] [&_li_small]:text-[1.3rem]! [&_li_small]:text-dim md:[&_li]:grid-cols-[auto_minmax(0,1fr)_auto] d-sign">
        {steps.map((x, i) => (
          <li key={x.key} className={x.done ? '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done' : x.can ? '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on' : ''}>
            <span className="items-center border-[0.15rem] border-current border-solid rounded-[50%] flex h-36 justify-center w-36 [.d-sign_li.is-on_&]:bg-blue [.d-sign_li.is-on_&]:border-blue [.d-sign_li.is-on_&]:text-white [.d-sign_li.is-done_&]:bg-ink! [.d-sign_li.is-done_&]:border-ink! [.d-sign_li.is-done_&]:text-white!">{x.done ? <Icon name="check" /> : i + 1}</span>
            <div>
              <strong>{x.title}</strong>
              <small>{x.who}</small>
              {x.done ? <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok">{x.done}</p> : x.wait && <p className="text-[1.4rem] leading-[1.5] text-dim [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0">{x.wait}</p>}
            </div>
            {x.can && x.key === 'meterai' && <Btn onClick={x.action}>{x.label}</Btn>}
            {x.can && x.key !== 'meterai' && (
              <section className="col-span-full grid gap-10 justify-items-start md:col-span-1 md:col-start-2">
                <div className="w-full max-w-520">
                  <SignaturePad name={session.name} onChange={setImage} />
                </div>
                <Btn onClick={x.action} disabled={!image || !c.apiId || signing}>
                  {signing ? 'Menyimpan...' : x.label}
                </Btn>
                {!c.apiId && <p className="text-[1.35rem] leading-[1.5] text-dim">Kontrak ini hanya tersimpan di perangkat ini, belum di server SAKSI, jadi tanda tangan elektronik belum bisa dibubuhkan.</p>}
                {signError && <FormAlert>{signError}</FormAlert>}
              </section>
            )}
          </li>
        ))}
      </ol>
      {s.desa && s.pihak && s.meterai && <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok"><Icon name="check" /> Tanda tangan lengkap. Kontrak sah dan siap disegel.</p>}
    </Panel>
    <Panel title="Pratinjau surat" desc="Surat seperti yang akan dibaca kedua pihak. Tanda tangan dan e-meterai muncul di sini begitu dibubuhkan.">
      <LetterPreview
        title={c.title}
        code={c.code}
        village={village?.name ?? ''}
        head={villageHeads[c.villageId] ?? '-'}
        second={counterpartyById(c.counterpartyId)?.name ?? 'Pihak kedua'}
        date={c.createdAt}
        clauses={latestVersion(c).clauses}
        signatures={c.signatures}
      />
    </Panel>
    </>
  )
}
