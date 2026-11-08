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
    <div className="[animation:pop_0.35s_ease-out] grid gap-20" key="role">
      {error && <FormAlert>{error.error}</FormAlert>}
      <RoleChoice roles={roles} value={roleId} onChange={onRole} />
      <div className="items-center flex gap-24 justify-between mt-8 [&.is-end]:justify-end auth-actions">
        <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={onBack}>
          Kembali
        </button>
        <PillButton type="submit" tone="blue">
          Masuk ke dashboard
        </PillButton>
      </div>
    </div>
  )
}
