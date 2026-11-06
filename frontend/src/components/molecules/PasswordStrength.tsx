import { strengthLabel } from '@/data/auth'
import { passwordStrength } from '@/lib/auth/password-strength'

interface Props {
  password: string
}

export default function PasswordStrength({ password }: Props) {
  const level = passwordStrength(password)
  return (
    <div className="strength" aria-live="polite">
      <div className="strength-bar">
        {[1, 2, 3].map((n) => (
          <span key={n} className={level >= n ? 'on' : ''} />
        ))}
      </div>
      <span>{strengthLabel[level]}</span>
    </div>
  )
}
