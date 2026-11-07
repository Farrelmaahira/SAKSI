'use client'

import { useDash } from '@/hooks/use-dash'
import { FormEvent, useState } from 'react'
import { updateName } from '@/lib/auth/update-name'
import { changePassword } from '@/lib/auth/change-password'
import Panel from '@/components/molecules/Panel'
import Notice from '@/components/molecules/Notice'
import Btn from '@/components/atoms/Btn'
import { roleLabels } from '@/data/auth'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import Badge from '@/components/atoms/Badge'

export default function ProfilAkun() {
  const { session } = useDash()
  const [name, setName] = useState(session.name)
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const saveName = (e: FormEvent) => {
    e.preventDefault()
    const r = updateName(name)
    setNameMsg(r.ok ? { ok: true, text: 'Nama tersimpan.' } : { ok: false, text: r.error })
  }
  const savePw = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const r = await changePassword(pw.current, pw.next, pw.confirm)
    setBusy(false)
    if (r.ok) setPw({ current: '', next: '', confirm: '' })
    setPwMsg(r.ok ? { ok: true, text: 'Kata sandi diperbarui.' } : { ok: false, text: r.error })
  }

  return (
    <div className="d-grid-2">
      <Panel title="Akun">
        <form onSubmit={saveName} className="d-form">
          <label className="d-field">
            <span>Nama lengkap</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="d-field">
            <span>Email</span>
            <input value={session.email} readOnly aria-readonly="true" />
            <small className="d-muted">Email dipakai untuk masuk dan tidak bisa diubah di prototipe.</small>
          </label>
          <Notice msg={nameMsg} />
          <Btn type="submit" disabled={name.trim() === session.name}>
            Simpan nama
          </Btn>
        </form>
        <h3 className="d-sub">Peran Anda</h3>
        <ul className="d-list">
          {session.roles.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{roleLabels[r.role]}</strong>
                <small>
                  {r.title} · {wilayahLabel(r)}
                </small>
              </div>
              {r.id === session.role.id && <Badge tone="blue">Aktif</Badge>}
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Ganti kata sandi">
        <form onSubmit={savePw} className="d-form">
          <label className="d-field">
            <span>Kata sandi saat ini</span>
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
          </label>
          <label className="d-field">
            <span>Kata sandi baru</span>
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
            <small className="d-muted">Minimal 8 karakter.</small>
          </label>
          <label className="d-field">
            <span>Ulangi kata sandi baru</span>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" />
          </label>
          <Notice msg={pwMsg} />
          <Btn type="submit" disabled={busy || !pw.current || !pw.next}>
            {busy ? 'Menyimpan…' : 'Ganti kata sandi'}
          </Btn>
        </form>
      </Panel>
    </div>
  )
}
