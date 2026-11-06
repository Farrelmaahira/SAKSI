import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import RoleChoice from '@/components/molecules/RoleChoice'
import type { AuthError, UserRole } from '@/interfaces/auth'

interface Props {
  roles: UserRole[]
  roleId: string | null
  error: AuthError | null
  onRole: (id: string) => void
  onBack: () => void
}

export default function LoginRoleStep({ roles, roleId, error, onRole, onBack }: Props) {
  return (
    <div className="auth-step" key="role">
      {error && <FormAlert>{error.error}</FormAlert>}
      <RoleChoice roles={roles} value={roleId} onChange={onRole} />
      <div className="auth-actions">
        <button type="button" className="text-btn" onClick={onBack}>
          Kembali
        </button>
        <PillButton type="submit" tone="blue">
          Masuk ke dashboard
        </PillButton>
      </div>
    </div>
  )
}
