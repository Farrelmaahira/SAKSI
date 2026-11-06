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
      className={cn("app-side", open && "is-open")}
      aria-label="Navigasi dashboard"
    >
      <div className="app-side-top">
        <Link
          className="app-logo"
          href="/"
          aria-label="SAKSI, ke beranda publik"
        >
          <Logo />
          <span>SAKSI</span>
        </Link>
        <button
          className="app-icon-btn app-side-close"
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="app-role">
        <p className="app-role-label">Masuk sebagai</p>
        <strong>{roleLabels[role.role]}</strong>
        <span>
          {role.title} · {wilayahLabel(role)}
        </span>
        {session.roles.length > 1 && (
          <label className="app-role-switch">
            <span className="sr-only">Ganti peran atau wilayah</span>
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

      <nav className="app-nav">
        {items.map((i) => {
          const on = isNavOn(i, path);
          return (
            <Link
              key={i.to}
              href={i.to}
              className={on ? "is-active" : ""}
              aria-current={on ? "page" : undefined}
              title={collapsed ? i.label : undefined}
            >
              <Icon name={i.icon} />
              <span>{i.label}</span>
              {Boolean(i.badge) && <em className="app-nav-badge">{i.badge}</em>}
              {i.note && <em className="app-nav-note">{i.note}</em>}
            </Link>
          );
        })}
      </nav>

      <div className="app-side-foot">
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
