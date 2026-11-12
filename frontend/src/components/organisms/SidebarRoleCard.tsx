import Icon from "@/components/atoms/Icon";
import { roleLabels } from "@/data/auth";
import type { Session } from "@/interfaces/auth";
import { switchRole } from "@/lib/auth/switch-role";
import { wilayahLabel } from "@/lib/auth/wilayah-label";

interface Props {
  session: Session;
  onSwitched: () => void;
}

/* "Masuk sebagai": the active role and area, with a switch when the account has several roles */
export default function SidebarRoleCard({ session, onSwitched }: Props) {
  const role = session.role;
  return (
    <div className="bg-deep rounded-[1.6rem] grid gap-3 p-16 [&_strong]:text-[1.8rem] [&_strong]:font-[450] lg:[.is-collapsed_&]:hidden">
      <p className="text-white font-hand text-[2rem] leading-[1]">
        Masuk sebagai
      </p>
      <strong>{roleLabels[role.role]}</strong>
      <p className="items-center flex text-[1.5rem] gap-10 min-w-0">
        <Icon name="user" />
        <span>{role.title}</span>
      </p>
      <p className="items-center flex text-[1.5rem] gap-10 min-w-0">
        <Icon name="map" />
        <span>{wilayahLabel(role)}</span>
      </p>
      {session.roles.length > 1 && (
        <label className="mt-10 relative after:[border-style:solid] after:[border-color:var(--color-white)] after:[border-width:0_0.15rem_0.15rem_0] after:content-[''] after:h-7 after:pointer-events-none after:absolute after:right-14 after:top-15 after:[transform:rotate(45deg)] after:w-7 [&_select]:appearance-none [&_select]:bg-deep [&_select]:border-[0.1rem] [&_select]:border-white [&_select]:border-solid [&_select]:rounded-[3rem] [&_select]:text-white [&_select]:text-[1.3rem] [&_select]:h-40! [&_select]:pt-0 [&_select]:pr-36 [&_select]:pb-0 [&_select]:pl-14 [&_select]:w-full! [&_select_option]:text-ink [&_select:focus-visible]:[outline:0.2rem_solid_var(--color-white)] [&_select:focus-visible]:[outline-offset:0.2rem]">
          <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">
            Ganti peran atau wilayah
          </span>
          <select
            value={role.id}
            onChange={(e) => {
              switchRole(e.target.value);
              onSwitched();
            }}
          >
            {session.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {roleLabels[r.role]} · {wilayahLabel(r)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
