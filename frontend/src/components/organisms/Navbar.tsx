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
          width={120}
          height={120}
          priority
          style={{
            height: '8.6rem',
            width: 'auto',
            filter: 'brightness(0) invert(1)',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </Link>
      <div className="navbar-actions">
        {cta && <PillButton href={cta.href}>{cta.label}</PillButton>}
        <button
          className="navbar-burger"
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu navigasi"
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
