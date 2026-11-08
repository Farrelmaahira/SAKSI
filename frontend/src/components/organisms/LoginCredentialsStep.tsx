import Link from 'next/link'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import DemoAccounts from '@/components/molecules/DemoAccounts'
import MailPreview from '@/components/molecules/MailPreview'
import PasswordField from '@/components/molecules/PasswordField'
import TextField from '@/components/molecules/TextField'
import type { AuthError } from '@/interfaces/auth'
import { rememberEmail } from '@/lib/auth/remember-email'

interface Props {
  email: string
  password: string
  error: AuthError | null
  busy: boolean
  resent: string | null
  onEmail: (v: string) => void
  onPassword: (v: string) => void
  onResend: () => void
  onPickDemo: (email: string, password: string) => void
}

export default function LoginCredentialsStep({ email, password, error, busy, resent, onEmail, onPassword, onResend, onPickDemo }: Props) {
  const fieldError = (f: string) => (error?.field === f ? error.error : undefined)

  return (
    <div className="[animation:pop_0.35s_ease-out] grid gap-20" key="credentials">
      {error?.code === 'unverified' && (
        <FormAlert>
          {error.error}{' '}
          <button type="button" className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] font-[500] p-0" onClick={onResend}>
            Kirim ulang link
          </button>
        </FormAlert>
      )}
      {error?.code === 'locked' && (
        <FormAlert>
          {error.error}{' '}
          <Link className="[background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] font-[500] p-0" href="/lupa-sandi" onClick={() => rememberEmail(email)}>
            Atur ulang kata sandi
          </Link>
        </FormAlert>
      )}
      {resent && (
        <MailPreview
          to={email}
          subject="Aktifkan akun SAKSI Anda"
          body="Klik tombol di bawah untuk mengaktifkan akun. Link berlaku 24 jam."
          action="Aktifkan akun"
          href={`/verifikasi?token=${resent}`}
        />
      )}
      <TextField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="nama@desa.id"
        autoFocus
        value={email}
        onChange={(e) => onEmail(e.target.value)}
        error={fieldError('email')}
      />
      <div>
        <PasswordField
          id="login-password"
          label="Kata sandi"
          autoComplete="current-password"
          placeholder="Minimal 8 karakter"
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          error={fieldError('password')}
        />
        <Link className="border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-blue table text-[1.3rem] mt-12 mr-0 mb-0 ml-auto [&:hover]:text-ink" href="/lupa-sandi" onClick={() => rememberEmail(email)}>
          Lupa kata sandi?
        </Link>
      </div>
      <PillButton type="submit" tone="blue" disabled={busy}>
        {busy ? 'Memeriksa…' : 'Masuk'}
      </PillButton>
      <DemoAccounts onPick={onPickDemo} />
    </div>
  )
}
