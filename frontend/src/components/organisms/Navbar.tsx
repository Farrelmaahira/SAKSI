import Link from 'next/link'
import Image from 'next/image'
import PillButton from '@/components/atoms/PillButton'
import type { NavLink } from '@/interfaces/content'

export interface NavbarProps {
  cta?: NavLink | null
  onOpenMenu: () => void
}

export default function Navbar({ cta, onOpenMenu }: NavbarProps) {
  return (
    <header className="navbar">
      <Link className="navbar-logo" href="/" aria-label="SAKSI, ke beranda">
        <Image
          src="/logo-saksi.png"
          alt="Logo SAKSI"
          width={72}
          height={72}
          priority
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </Link>
      <p className="navbar-caption">SAKSI (Sistem Audit Kontrak Segel Integritas)</p>
      <div className="navbar-right">
        {cta && <PillButton to={cta.href}>{cta.label}</PillButton>}
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
  )
}
