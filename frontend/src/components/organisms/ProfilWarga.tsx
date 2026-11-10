'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { getMe } from '@/lib/api/get-me'
import { updateMe } from '@/lib/api/update-me'
import { apiUserId } from '@/lib/auth/api-user-id'
import FormField from '@/components/molecules/FormField'
import Notice from '@/components/molecules/Notice'
import Btn from '@/components/atoms/Btn'
import { users } from '@/lib/auth/users-store'
import { villageById } from '@/lib/master/village-by-id'
import { regionById } from '@/lib/master/region-by-id'
import Panel from '@/components/molecules/Panel'
import Badge from '@/components/atoms/Badge'
import Icon from '@/components/atoms/Icon'

export default function ProfilWarga() {
  const { session } = useDash()
  const u = users.use().find((x) => x.id === session.userId)
  const v = villageById(session.role.villageId)
  // API accounts: phone number from GET /auth/me, saved with PUT /auth/me
  const onServer = apiUserId(session.userId) > 0
  const [phone, setPhone] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    if (!onServer) return
    let active = true
    getMe().then((r) => {
      if (!active) return
      if (!r.ok) return setMsg({ ok: false, text: r.error })
      setPhone(r.data.noHp ?? '')
      setDraft(r.data.noHp ?? '')
    })
    return () => {
      active = false
    }
  }, [onServer])
  const savePhone = async (e: FormEvent) => {
    e.preventDefault()
    const clean = draft.replace(/[\s-]/g, '')
    if (!/^\+?\d{8,20}$/.test(clean)) return setMsg({ ok: false, text: 'Nomor HP 8 sampai 20 digit, boleh diawali +.' })
    setBusy(true)
    const r = await updateMe({ noHp: clean })
    setBusy(false)
    if (!r.ok) return setMsg({ ok: false, text: r.error })
    setPhone(r.data.noHp ?? clean)
    setMsg({ ok: true, text: 'Nomor HP tersimpan.' })
  }

  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
      <Panel title="Data diri">
        <dl className="grid [&>div]:border-t-[0.1rem] [&>div]:border-t-[#ececea] [&>div]:[border-top-style:solid] [&>div]:grid [&>div]:gap-3 [&>div]:py-10 [&>div]:px-0 [&>div:first-child]:border-t-0 [&>div:first-child]:[border-top-style:none] [&>div:first-child]:pt-0 [&_dt]:text-[1.25rem] [&_dt]:text-dim [&_dd]:text-[1.5rem]! [&_dd]:leading-[1.45] md:[&>div]:gap-20 md:[&>div]:grid-cols-[16rem_minmax(0,1fr)]">
          <div>
            <dt>Nama</dt>
            <dd>{session.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt>Nomor HP</dt>
            <dd>{onServer ? (phone === null ? 'Memuat…' : phone || '-') : (u?.phone ?? '-')}</dd>
          </div>
          <div>
            <dt>Desa domisili</dt>
            <dd>{v ? `${v.name}, ${v.district}, ${regionById(v.regionId)?.name}` : '-'}</dd>
          </div>
          <div>
            <dt>Status akun</dt>
            <dd>
              <Badge tone="done">Email terverifikasi</Badge>
            </dd>
          </div>
        </dl>
        {onServer && (
          <form onSubmit={savePhone} className="grid gap-12 justify-items-start">
            <FormField label="Ubah nomor HP" className="w-full">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} inputMode="tel" autoComplete="tel" />
            </FormField>
            <Notice msg={msg} />
            <Btn type="submit" small disabled={busy || phone === null || draft === phone}>{busy ? 'Menyimpan…' : 'Simpan nomor HP'}</Btn>
          </form>
        )}
      </Panel>
      <Panel title="Keamanan pelapor">
        <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok">
          <Icon name="shield" />
          Nama, email, dan nomor HP Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan Inspektorat yang dapat melihat identitas pelapor.
        </p>
      </Panel>
    </div>
  )
}
