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
    <fieldset className="[&_legend]:text-[1.3rem] [&_legend]:opacity-[0.7] [&_legend]:uppercase border-0 border-none grid gap-8 [&_legend]:mb-8">
      <legend>Masuk sebagai</legend>
      {roles.map((r) => (
        <label key={r.id} className={cn('items-center border-[0.15rem] border-[#d6d6d2] border-solid rounded-[1.4rem] cursor-pointer grid gap-14 grid-cols-[6.4rem_1fr_auto] pt-10 pr-16 pb-10 pl-10 relative [transition:border-color_0.2s,_box-shadow_0.2s,_transform_0.2s] [&:hover]:border-ink [&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.6] [&.is-on]:border-blue [&.is-on]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)] [&:has(input:focus-visible)]:[outline:0.2rem_solid_var(--color-blue)] [&:has(input:focus-visible)]:[outline-offset:0.2rem] role-option', value === r.id && '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on')}>
          <input type="radio" name="role" value={r.id} checked={value === r.id} onChange={() => onChange(r.id)} />
          <span className="items-center bg-soft rounded-[1rem] flex h-64 justify-center p-8 [&_img]:max-h-full">
            <Illustration name={roleArt[r.role]} />
          </span>
          <span className="grid gap-2">
            <strong>{roleLabels[r.role]}</strong>
            <small>
              {r.title} · {wilayahLabel(r)}
            </small>
          </span>
          <span className="border-[0.15rem] border-ink border-solid rounded-[50%] h-22 relative [transition:border-color_0.2s] w-22 [.role-option.is-on_&]:border-blue [.role-option.is-on_&]:after:bg-blue [.role-option.is-on_&]:after:rounded-[50%] [.role-option.is-on_&]:after:content-[''] [.role-option.is-on_&]:after:inset-3.5 [.role-option.is-on_&]:after:absolute" aria-hidden="true" />
        </label>
      ))}
    </fieldset>
  )
}
