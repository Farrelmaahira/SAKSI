import Illustration from '@/components/atoms/Illustration'
import { roleArt, roleLabels } from '@/data/auth'
import type { UserRole } from '@/interfaces/auth'
import { wilayahLabel } from '@/lib/auth/wilayah-label'
import { cn } from '@/lib/utils'

interface Props {
  roles: UserRole[]
  value: string | null
  onChange: (id: string) => void
}

/* Shown after login when the account has several user_roles rows (for example two regencies) */
export default function RoleChoice({ roles, value, onChange }: Props) {
  return (
    <fieldset className="role-picker">
      <legend>Masuk sebagai</legend>
      {roles.map((r) => (
        <label key={r.id} className={cn('role-option', value === r.id && 'is-on')}>
          <input type="radio" name="role" value={r.id} checked={value === r.id} onChange={() => onChange(r.id)} />
          <span className="role-art">
            <Illustration name={roleArt[r.role]} />
          </span>
          <span className="role-text">
            <strong>{roleLabels[r.role]}</strong>
            <small>
              {r.title} · {wilayahLabel(r)}
            </small>
          </span>
          <span className="role-radio" aria-hidden="true" />
        </label>
      ))}
    </fieldset>
  )
}
