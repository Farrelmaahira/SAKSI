'use client'

import Link from 'next/link'
import { loginSteps } from '@/data/auth'
import { useLoginForm } from '@/hooks/use-login-form'
import { useQueryParam } from '@/hooks/use-query-param'
import { useRedirectIfSignedIn } from '@/hooks/use-redirect-if-signed-in'
import { safeRedirect } from '@/lib/auth/safe-redirect'
import { withFrom } from '@/lib/auth/with-from'
import StepIndicator from '@/components/molecules/StepIndicator'
import AuthShell from './AuthShell'
import LoginCredentialsStep from './LoginCredentialsStep'
import LoginRoleStep from './LoginRoleStep'

export default function MasukTemplate() {
  const fromParam = useQueryParam('from')
  const signedIn = useRedirectIfSignedIn(safeRedirect(fromParam))
  const f = useLoginForm()
  const { pending } = f

  // A successful login sets the session, which sends the user on from here.
  if (signedIn) return null

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

      <form className="grid gap-20 auth-form" onSubmit={f.submit} noValidate>
        {!pending && (
          <LoginCredentialsStep
            email={f.email}
            password={f.password}
            error={f.error}
            busy={f.busy}
            resent={f.resent}
            onEmail={f.setEmail}
            onPassword={f.setPassword}
            onResend={f.resend}
            onPickDemo={f.pickDemo}
          />
        )}
        {pending && (
          <LoginRoleStep
            roles={pending.roles}
            roleId={f.roleId}
            error={f.error}
            onRole={f.setRoleId}
            onBack={f.backToCredentials}
          />
        )}
      </form>
      <p className="text-[1.3rem] leading-[1.5] mt-24 opacity-[0.6]">Prototipe: akun hanya tersimpan di browser ini dan tidak dikirim ke server.</p>
    </AuthShell>
  )
}
