import Link from "next/link";
import Icon from "@/components/atoms/Icon";
import Logo from "@/components/atoms/Logo";
import SidebarFooter from "@/components/organisms/SidebarFooter";
import SidebarNav from "@/components/organisms/SidebarNav";
import SidebarRoleCard from "@/components/organisms/SidebarRoleCard";
import type { Session } from "@/interfaces/auth";
import type { NavItem } from "@/interfaces/dash";
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
  return (
    <aside
      className={cn(
        "bg-blue text-white flex flex-col gap-24 [inset:0_auto_0_0] overflow-y-auto py-24 px-16 fixed [transform:translateX(-100%)] [transition:transform_0.45s_var(--ease-saksi),_visibility_0s_0.45s] invisible w-[min(32rem,_86vw)] z-40 [&.is-open]:[transform:none] [&.is-open]:[transition:transform_0.45s_var(--ease-saksi)] [&.is-open]:visible lg:[.is-collapsed_&]:items-center lg:[.is-collapsed_&]:py-24 lg:[.is-collapsed_&]:px-12 lg:h-svh lg:sticky lg:top-0 lg:[transform:none] lg:[transition:none] lg:visible lg:w-auto app-side",
        open && "is-open",
      )}
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

      <SidebarRoleCard session={session} onSwitched={onSwitched} />

      <SidebarNav items={items} path={path} collapsed={collapsed} />

      <SidebarFooter collapsed={collapsed} onReset={onReset} />
    </aside>
  );
}
