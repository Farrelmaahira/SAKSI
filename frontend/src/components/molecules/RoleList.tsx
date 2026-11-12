import Badge from '@/components/atoms/Badge'
import { roleLabels } from '@/data/auth'
import type { UserRole } from '@/interfaces/auth'
import { wilayahLabel } from '@/lib/auth/wilayah-label'

interface Props {
  roles: UserRole[]
  /* id of the role in use */
  activeId: string
}

/* The roles of one account with their area; the one in use is marked "Aktif" */
export default function RoleList({ roles, activeId }: Props) {
  return (
    <ul className="grid list-none list-outside [&_li]:items-center [&_li]:border-t-[0.1rem] [&_li]:border-t-[#ececea] [&_li]:[border-top-style:solid] [&_li]:flex [&_li]:gap-14 [&_li]:justify-between [&_li]:py-12 [&_li]:px-0 [&_li:first-child]:border-t-0 [&_li:first-child]:[border-top-style:none] [&_li:first-child]:pt-0 [&_li>div]:grid [&_li>div]:gap-2 [&_li>div]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.3rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap">
      {roles.map((r) => (
        <li key={r.id}>
          <div>
            <strong>{roleLabels[r.role]}</strong>
            <small>
              {r.title} · {wilayahLabel(r)}
            </small>
          </div>
          {r.id === activeId && <Badge tone="blue">Aktif</Badge>}
        </li>
      ))}
    </ul>
  )
}
