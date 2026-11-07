import Link from "next/link";
import Logo from "@/components/atoms/Logo";
import PillButton from "@/components/atoms/PillButton";
import NavSession from "@/components/molecules/NavSession";
import type { NavLink } from "@/interfaces/content";

interface Props {
  cta: NavLink;
  onOpenMenu: () => void;
}

export default function Navbar({ cta, onOpenMenu }: Props) {
  return (
    <header className="navbar">
      <Link className="navbar-logo" href="/" aria-label="SAKSI, ke beranda">
        <Logo />
        <span>SAKSI</span>
      </Link>
      <p className="navbar-caption">Sistem Audit Kontrak Segel Integritas</p>
      <div className="navbar-right">
        <PillButton to={cta.href}>{cta.label}</PillButton>
        <NavSession />
        <button
          className="menu-toggle"
          onClick={onOpenMenu}
          aria-label="Buka menu"
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
