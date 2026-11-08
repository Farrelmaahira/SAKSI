import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import Logo from "@/components/atoms/Logo";
import { roleLabels } from "@/data/auth";
import type { Session } from "@/interfaces/auth";
import type { NavItem } from "@/interfaces/dash";
import { isNavOn } from "@/lib/dash/is-nav-on";
import { switchRole } from "@/lib/auth/switch-role";
import { wilayahLabel } from "@/lib/auth/wilayah-label";
import { cn } from "@/lib/utils";

interface Props {
  session: Session;
  items: NavItem[];
  path: string;
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onReset: () => void;
  onSwitched: () => void;
}

export default function DashSidebar({
  session,
  items,
  path,
  open,
  collapsed,
  onClose,
  onReset,
  onSwitched,
}: Props) {
  const role = session.role;

  return (
    <aside
      className={cn("bg-blue text-white flex flex-col gap-24 [inset:0_auto_0_0] overflow-y-auto py-24 px-16 fixed [transform:translateX(-100%)] [transition:transform_0.45s_var(--ease-saksi),_visibility_0s_0.45s] invisible w-[min(32rem,_86vw)] z-40 [&.is-open]:[transform:none] [&.is-open]:[transition:transform_0.45s_var(--ease-saksi)] [&.is-open]:visible lg:[.is-collapsed_&]:items-center lg:[.is-collapsed_&]:py-24 lg:[.is-collapsed_&]:px-12 lg:h-svh lg:sticky lg:top-0 lg:[transform:none] lg:[transition:none] lg:visible lg:w-auto app-side", open && "is-open")}
      aria-label="Navigasi dashboard"
    >
      <div className="items-center flex justify-between py-0 px-8 lg:[.is-collapsed_&]:justify-center lg:[.is-collapsed_&]:p-0">
        <Link
          className="items-center flex text-[2.2rem] font-[500] gap-10 tracking-[0.04em] lg:[.is-collapsed_&_span]:hidden app-logo"
          href="/"
          aria-label="SAKSI, ke beranda publik"
        >
          <Logo tone="white" />
          <span>SAKSI</span>
        </Link>
        <button
          className="items-center bg-transparent border-[0.15rem] border-current border-solid rounded-[50%] [color:inherit] flex h-40 justify-center [transition:background_0.2s,_color_0.2s] w-40 [.app-side_&:hover]:bg-white [.app-side_&:hover]:text-blue [.app-top_&]:bg-white [.app-top_&]:border-white [.app-top_&]:text-ink [.app-top_&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [.app-top_&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]! lg:hidden"
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="bg-deep rounded-[1.6rem] grid gap-3 p-16 [&_strong]:text-[1.8rem] [&_strong]:font-[450] lg:[.is-collapsed_&]:hidden">
        <p className="text-white font-hand text-[2rem] leading-[1]">Masuk sebagai</p>
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
            <span className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only">Ganti peran atau wilayah</span>
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

      <nav className="grid gap-3 [&_a]:items-center [&_a]:rounded-[3rem] [&_a]:flex [&_a]:text-[1.5rem] [&_a]:gap-12 [&_a]:min-h-46 [&_a]:py-0 [&_a]:px-16 [&_a]:[transition:background_0.2s,_color_0.2s] [&_a:hover]:bg-deep [&_a_span]:flex-1 lg:[.is-collapsed_&_a_span]:hidden lg:[.is-collapsed_&]:justify-items-center lg:[.is-collapsed_&]:w-full lg:[.is-collapsed_&_a]:justify-center lg:[.is-collapsed_&_a]:p-0 lg:[.is-collapsed_&_a]:relative lg:[.is-collapsed_&_a]:w-46 app-nav">
        {items.map((i) => {
          const on = isNavOn(i, path);
          return (
            <Link
              key={i.to}
              href={i.to}
              className={on ? "[.app-nav_a&]:bg-white [.app-nav_a&]:[box-shadow:0.4rem_0.4rem_0_var(--color-ink)] [.app-nav_a&]:text-blue is-active" : ""}
              aria-current={on ? "page" : undefined}
              title={collapsed ? i.label : undefined}
            >
              <Icon name={i.icon} />
              <span>{i.label}</span>
              {Boolean(i.badge) && <em className="bg-red rounded-[2rem] text-white text-[1.2rem] not-italic leading-[2.2rem] min-w-22 py-0 px-7 text-center lg:[.is-collapsed_&]:text-[1rem] lg:[.is-collapsed_&]:leading-[1.7rem] lg:[.is-collapsed_&]:min-w-17 lg:[.is-collapsed_&]:py-0 lg:[.is-collapsed_&]:px-4 lg:[.is-collapsed_&]:absolute lg:[.is-collapsed_&]:-right-4 lg:[.is-collapsed_&]:-top-2">{i.badge}</em>}
              {i.note && <em className="border-[0.1rem] border-current border-solid rounded-[2rem] text-[1.05rem] not-italic tracking-[0.04em] py-1 px-8 uppercase lg:[.is-collapsed_&]:hidden">{i.note}</em>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t-[0.1rem] border-t-[#3b64dc] [border-top-style:solid] grid gap-2 mt-auto pt-16 [&_a]:items-center [&_a]:[background:none] [&_a]:border-0 [&_a]:border-none [&_a]:rounded-[3rem] [&_a]:[color:inherit] [&_a]:flex [&_a]:text-[1.4rem] [&_a]:gap-12 [&_a]:min-h-42 [&_a]:py-0 [&_a]:px-16 [&_a]:text-left [&_a]:[transition:background_0.2s] [&_button]:items-center! [&_button]:[background:none]! [&_button]:border-0! [&_button]:border-none! [&_button]:rounded-[3rem]! [&_button]:[color:inherit]! [&_button]:flex [&_button]:text-[1.4rem]! [&_button]:gap-12! [&_button]:min-h-42! [&_button]:py-0 [&_button]:px-16 [&_button]:text-left! [&_button]:[transition:background_0.2s]! [&_a:hover]:bg-deep [&_button:hover]:bg-deep! lg:[.is-collapsed_&_span]:hidden lg:[.is-collapsed_&]:justify-items-center lg:[.is-collapsed_&]:w-full lg:[.is-collapsed_&_a]:justify-center lg:[.is-collapsed_&_a]:p-0 lg:[.is-collapsed_&_a]:relative lg:[.is-collapsed_&_a]:w-46 lg:[.is-collapsed_&_button]:justify-center! lg:[.is-collapsed_&_button]:p-0 lg:[.is-collapsed_&_button]:relative! lg:[.is-collapsed_&_button]:w-46!">
        <Link href="/lacak" title={collapsed ? "Portal publik" : undefined}>
          <Icon name="globe" />
          <span>Portal publik</span>
        </Link>
        <button
          type="button"
          onClick={onReset}
          title={collapsed ? "Reset data demo" : undefined}
        >
          <Icon name="refresh" />
          <span>Reset data demo</span>
        </button>
      </div>
    </aside>
  );
}
