'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { loginSteps } from '@/data/auth'
import { useQueryParam } from '@/hooks/use-query-param'
import { useRedirectIfSignedIn } from '@/hooks/use-redirect-if-signed-in'
import type { AuthError, UserRole } from '@/interfaces/auth'
import { chooseRole } from '@/lib/auth/choose-role'
import { login } from '@/lib/auth/login'
import { resendVerification } from '@/lib/auth/resend-verification'
import { safeRedirect } from '@/lib/auth/safe-redirect'
import { withFrom } from '@/lib/auth/with-from'
import StepIndicator from '@/components/molecules/StepIndicator'
import AuthShell from './AuthShell'
import LoginCredentialsStep from './LoginCredentialsStep'
import LoginRoleStep from './LoginRoleStep'

interface Pending {
  userId: string
  name: string
  roles: UserRole[]
}

export default function MasukTemplate() {
  const fromParam = useQueryParam('from')
  const signedIn = useRedirectIfSignedIn(safeRedirect(fromParam))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<Pending | null>(null)
  const [roleId, setRoleId] = useState<string | null>(null)
  const [resent, setResent] = useState<string | null>(null)

  // A successful login sets the session, which sends the user on from here.
  if (signedIn) return null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (pending) {
      if (!roleId) return setError({ ok: false, error: 'Pilih salah satu peran dulu.' })
      return chooseRole(pending.userId, roleId)
    }
    setBusy(true)
    setResent(null)
    const res = await login(email, password)
    setBusy(false)
    if (!res.ok) return setError(res)
    setError(null)
    if (res.roles.length > 1) {
      setPending({ userId: res.userId, name: res.name, roles: res.roles })
      setRoleId(res.roles[0].id)
    }
  }

  const pickDemo = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
    setError(null)
  }

  return (
    <AuthShell
      label="Masuk"
      title="Selamat datang"
      mark="kembali."
      lead="Masuk dengan email dan kata sandi. Anda langsung diarahkan ke dashboard sesuai peran."
      points={['Satu akun bisa punya beberapa peran', 'Akun dikunci sementara setelah 5 kali salah sandi', 'Setiap masuk dan keluar tercatat di jejak audit']}
    >
      <h2 className="text-[3rem] font-[350] tracking-[-0.03em] leading-[1.1] md:text-[3.6rem]">{pending ? `Halo, ${pending.name.split(' ')[0]}` : 'Masuk ke SAKSI'}</h2>
      <p className="text-[1.5rem] mt-8 mx-0 mb-28 [&_a]:border-b-[0.1rem] [&_a]:border-b-current [&_a]:[border-bottom-style:solid] [&_a]:text-blue">
        {pending ? (
          'Akun Anda punya lebih dari satu peran. Pilih peran yang ingin dipakai sekarang.'
        ) : (
          <>
            Pihak kedua belum punya akun? <Link href={withFrom('/daftar', fromParam)}>Daftar di sini</Link>
          </>
        )}
      </p>
      <StepIndicator steps={loginSteps} current={pending ? 1 : 0} />

      <form className="grid gap-20 auth-form" onSubmit={submit} noValidate>
        {!pending && (
          <LoginCredentialsStep
            email={email}
            password={password}
            error={error}
            busy={busy}
            resent={resent}
            onEmail={setEmail}
            onPassword={setPassword}
            onResend={() => setResent(resendVerification(email))}
            onPickDemo={pickDemo}
          />
        )}
        {pending && (
          <LoginRoleStep
            roles={pending.roles}
            roleId={roleId}
            error={error}
            onRole={setRoleId}
            onBack={() => {
              setPending(null)
              setError(null)
            }}
          />
        )}
      </form>
      <p className="text-[1.3rem] leading-[1.5] mt-24 opacity-[0.6]">Prototipe: akun hanya tersimpan di browser ini dan tidak dikirim ke server.</p>
    </AuthShell>
  )
}
