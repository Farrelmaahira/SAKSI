import Illustration from '@/components/atoms/Illustration'
import Link from 'next/link'
import CloseIcon from '@/components/atoms/CloseIcon'
import CurvedArrow from '@/components/atoms/CurvedArrow'
import { navLinks } from '@/data/nav-links'
import { cn } from '@/lib/utils'

export interface MenuOverlayProps {
  open: boolean
  onClose: () => void
}

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  return (
    <div className={cn('menu', open && 'is-open')} aria-hidden={!open}>
      <button className="menu-close" onClick={onClose} aria-label="Tutup menu" tabIndex={open ? 0 : -1}>
        <CloseIcon />
      </button>
      <div className="menu-art" aria-hidden="true">
        <p className="menu-note">
          pilih bagian
          <CurvedArrow className="menu-note-arrow" />
        </p>
        <Illustration name="village-hero" />
      </div>
      <nav>
        {navLinks.map(({ label, href }, i) => (
          <Link key={href} href={href} tabIndex={open ? 0 : -1} onClick={onClose}>
            <small>0{i + 1}</small>
            {label}
          </Link>
        ))}
      </nav>
      <p className="menu-foot">Sistem Audit Kontrak Segel Integritas</p>
    </div>
  )
}
