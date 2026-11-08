import Icon from "@/components/atoms/Icon";
import DashUserMenu from "@/components/molecules/DashUserMenu";
import { roleLabels } from "@/data/auth";
import type { Session } from "@/interfaces/auth";
import Notifications from "./Notifications";

interface Props {
  session: Session;
  collapsed: boolean;
  onToggleNav: () => void;
  onSignOut: () => void;
}

export default function DashTopbar({
  session,
  collapsed,
  onToggleNav,
  onSignOut,
}: Props) {
  return (
    <header className="items-center bg-soft border-b-[0.1rem] border-b-line [border-bottom-style:solid] flex gap-14 py-14 px-20 sticky top-0 z-20 md:py-16 md:px-40 lg:py-16 lg:px-50 app-top">
      <button
        className="items-center bg-transparent border-[0.15rem] border-current border-solid rounded-[50%] flex h-40 justify-center [transition:background_0.2s,_color_0.2s] w-40 [.app-side_&:hover]:bg-white [.app-side_&:hover]:text-blue [.app-top_&]:bg-white [.app-top_&]:border-white [.app-top_&]:text-ink [.app-top_&:hover]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [.app-top_&.is-on]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]! text-ink"
        type="button"
        onClick={onToggleNav}
        aria-label={collapsed ? "Tampilkan navigasi" : "Sembunyikan navigasi"}
        aria-expanded={!collapsed}
        title={collapsed ? "Tampilkan navigasi" : "Sembunyikan navigasi"}
      >
        <Icon name="sidebar" />
      </button>
      <p className="flex-1 text-[1.3rem] tracking-[0.04em] text-dim uppercase [&_span::before]:content-['/'] [&_span::before]:my-0 [&_span::before]:mx-8">
        Dashboard <span>{roleLabels[session.role.role]}</span>
      </p>
      <Notifications session={session} />
      <DashUserMenu session={session} onSignOut={onSignOut} />
    </header>
  );
}
