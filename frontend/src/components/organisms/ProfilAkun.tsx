'use client'

import Btn from '@/components/atoms/Btn'
import Hint from '@/components/atoms/Hint'
import FormField from '@/components/molecules/FormField'
import Notice from '@/components/molecules/Notice'
import Panel from '@/components/molecules/Panel'
import RoleList from '@/components/molecules/RoleList'
import { useDash } from '@/hooks/use-dash'
import { usePasswordChange } from '@/hooks/use-password-change'
import { useProfileName } from '@/hooks/use-profile-name'

export default function ProfilAkun() {
  const { session } = useDash()
  const name = useProfileName(session)
  const pw = usePasswordChange(session)

  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[repeat(2,minmax(0,1fr))] [&>*]:min-w-0">
      <Panel title="Akun">
        <form onSubmit={(e) => { e.preventDefault(); name.save() }} className="grid gap-16 justify-items-start">
          <FormField label="Nama lengkap" className="w-full">
            <input value={name.name} onChange={(e) => name.setName(e.target.value)} autoComplete="name" />
          </FormField>
          <FormField label="Email" className="w-full">
            <input value={session.email} readOnly aria-readonly="true" />
            <Hint as="small">Email dipakai untuk masuk dan tidak bisa diubah di prototipe.</Hint>
          </FormField>
          <Notice msg={name.msg} />
          <Btn type="submit" disabled={name.busy || name.unchanged}>Simpan nama</Btn>
        </form>
        <h3 className="text-[1.3rem] tracking-[0.04em] mt-8 text-dim uppercase">Peran Anda</h3>
        <RoleList roles={session.roles} activeId={session.role.id} />
      </Panel>
      <Panel title="Ganti kata sandi">
        <form onSubmit={(e) => { e.preventDefault(); pw.save() }} className="grid gap-16 justify-items-start">
          <FormField label="Kata sandi saat ini" className="w-full">
            <input type="password" value={pw.pw.current} onChange={(e) => pw.set({ current: e.target.value })} autoComplete="current-password" />
          </FormField>
          <FormField label="Kata sandi baru" className="w-full">
            <input type="password" value={pw.pw.next} onChange={(e) => pw.set({ next: e.target.value })} autoComplete="new-password" />
            <Hint as="small">Minimal 8 karakter.</Hint>
          </FormField>
          <FormField label="Ulangi kata sandi baru" className="w-full">
            <input type="password" value={pw.pw.confirm} onChange={(e) => pw.set({ confirm: e.target.value })} autoComplete="new-password" />
          </FormField>
          <Notice msg={pw.msg} />
          <Btn type="submit" disabled={pw.busy || !pw.pw.current || !pw.pw.next}>{pw.busy ? 'Menyimpan…' : 'Ganti kata sandi'}</Btn>
        </form>
      </Panel>
    </div>
  )
}
