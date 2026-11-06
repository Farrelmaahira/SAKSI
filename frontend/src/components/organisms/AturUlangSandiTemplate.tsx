'use client'

import { useSearchParams } from 'next/navigation'
import AuthShell from './AuthShell'
import ResetForm from './ResetForm'

export default function AturUlangSandiTemplate() {
  const token = useSearchParams().get('token') ?? ''

  return (
    <AuthShell
      label="Atur ulang kata sandi"
      title="Buat kata sandi"
      mark="baru."
      lead="Pilih kata sandi yang mudah Anda ingat tetapi sulit ditebak orang lain."
      points={['Minimal 8 karakter', 'Campurkan huruf dan angka', 'Jangan pakai kata sandi yang sama dengan akun lain']}
    >
      <ResetForm token={token} />
    </AuthShell>
  )
}
