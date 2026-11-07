import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import PasswordField from '@/components/molecules/PasswordField'
import PasswordStrength from '@/components/molecules/PasswordStrength'
import type { AuthError } from '@/interfaces/auth'
import { cn } from '@/lib/utils'

interface Props {
  password: string
  confirm: string
  agree: boolean
  busy: boolean
  error: AuthError | null
  onPassword: (v: string) => void
  onConfirm: (v: string) => void
  onAgree: (v: boolean) => void
  onBack: () => void
}

export default function RegisterPasswordStep({ password, confirm, agree, busy, error, onPassword, onConfirm, onAgree, onBack }: Props) {
  const fieldError = (f: string) => (error?.field === f ? error.error : undefined)

  return (
    <div className="auth-step" key="password">
      {error && !error.field && <FormAlert>{error.error}</FormAlert>}
      <div>
        <PasswordField
          id="reg-password"
          label="Kata sandi"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          autoFocus
          value={password}
          onChange={(e) => onPassword(e.target.value)}
          error={fieldError('password')}
        />
        {password && <PasswordStrength password={password} />}
      </div>
      <PasswordField
        id="reg-confirm"
        label="Konfirmasi kata sandi"
        autoComplete="new-password"
        placeholder="Ketik ulang kata sandi"
        value={confirm}
        onChange={(e) => onConfirm(e.target.value)}
        error={fieldError('confirm')}
        hint={confirm && confirm === password ? 'Kata sandi sudah sama.' : undefined}
      />
      <label className={cn('auth-agree', fieldError('agree') && 'has-error')}>
        <input type="checkbox" checked={agree} onChange={(e) => onAgree(e.target.checked)} />
        <span className="auth-box" aria-hidden="true" />
        Saya paham ini prototipe dan akun hanya tersimpan di browser ini.
      </label>
      {fieldError('agree') && <p className="auth-error">{fieldError('agree')}</p>}
      <div className="auth-actions">
        <button type="button" className="text-btn" onClick={onBack}>
          Kembali
        </button>
        <PillButton type="submit" tone="blue" disabled={busy}>
          {busy ? 'Mendaftarkan…' : 'Daftar'}
        </PillButton>
      </div>
    </div>
  )
}
