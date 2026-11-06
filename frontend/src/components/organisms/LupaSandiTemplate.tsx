'use client'

import { useRememberedEmail } from '@/hooks/use-remembered-email'
import AuthShell from './AuthShell'
import ForgotForm from './ForgotForm'

export default function LupaSandiTemplate() {
  const remembered = useRememberedEmail()

  return (
    <AuthShell
      label="Lupa kata sandi"
      title="Tenang, kita"
      mark="atur ulang."
      lead="Masukkan email akun Anda. Kami kirim link untuk membuat kata sandi baru."
      points={['Link berlaku 30 menit', 'Akun yang terkunci ikut terbuka setelah sandi diganti', 'Perubahan kata sandi tercatat di jejak audit']}
    >
      {/* Keyed so the field starts with the saved email once the browser has read it. */}
      <ForgotForm key={remembered} initialEmail={remembered} />
    </AuthShell>
  )
}
