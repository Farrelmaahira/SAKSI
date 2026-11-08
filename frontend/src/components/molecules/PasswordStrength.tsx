import { strengthLabel } from '@/data/auth'
import { passwordStrength } from '@/lib/auth/password-strength'

interface Props {
  password: string
}

export default function PasswordStrength({ password }: Props) {
  const level = passwordStrength(password)
  return (
    <div className="items-center flex text-[1.3rem] gap-12 mt-10" aria-live="polite">
      <div className="grid flex-1 gap-4 grid-cols-[repeat(3,1fr)] [&_span]:bg-[#e3e3e0] [&_span]:rounded-[0.4rem] [&_span]:h-5 [&_span]:[transition:background_0.3s] strength-bar">
        {[1, 2, 3].map((n) => (
          <span key={n} className={level >= n ? '[.strength-bar_span&]:bg-blue [.status-steps_li&]:bg-blue [.status-steps_li&]:border-blue [.status-steps_li&]:text-white [.status-steps_li&]:opacity-[1] [.ticket-steps_li&]:opacity-[1] on' : ''} />
        ))}
      </div>
      <span>{strengthLabel[level]}</span>
    </div>
  )
}
