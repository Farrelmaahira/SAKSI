import Illustration from '@/components/atoms/Illustration'
import Link from 'next/link'
import CloseIcon from '@/components/atoms/CloseIcon'
import CurvedArrow from '@/components/atoms/CurvedArrow'
import { useNavLinks } from '@/hooks/use-nav-links'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

export default function MenuOverlay({ open, onClose }: Props) {
  const navLinks = useNavLinks()

  return (
    <div className={cn('bg-deep text-white grid gap-30 grid-rows-[auto_1fr_auto] inset-0 overflow-y-auto pt-100 px-20 pb-30 fixed [transform:translateY(-100%)] [transition:transform_0.9s_var(--ease-saksi)] z-50 [&.is-open]:[transform:translateY(0)] [&_nav]:flex [&_nav]:flex-col [&_nav_a]:items-baseline [&_nav_a]:border-b-[0.1rem] [&_nav_a]:border-b-[rgba(255,_255,_255,_0.2)] [&_nav_a]:[border-bottom-style:solid] [&_nav_a]:flex [&_nav_a]:text-[4.4rem] [&_nav_a]:font-[300] [&_nav_a]:gap-20 [&_nav_a]:tracking-[-0.04em] [&_nav_a]:leading-[1] [&_nav_a]:py-18 [&_nav_a]:px-0 [&_nav_a]:[transition:padding_0.5s_var(--ease-saksi)] [&.is-open_nav_a]:[animation:menu-in_0.9s_var(--ease-saksi)_both] [&.is-open_nav_a:nth-child(1)]:[animation-delay:0.35s] [&.is-open_nav_a:nth-child(2)]:[animation-delay:0.41s]! [&.is-open_nav_a:nth-child(3)]:[animation-delay:0.47s]! [&.is-open_nav_a:nth-child(4)]:[animation-delay:0.53s]! [&.is-open_nav_a:nth-child(5)]:[animation-delay:0.59s]! [&.is-open_nav_a:nth-child(6)]:[animation-delay:0.65s]! [&_nav_a_small]:text-[1.4rem] [&_nav_a_small]:tracking-[0] [&_nav_a_small]:opacity-[0.6] [&_nav_a:hover]:pl-20 md:pt-120 md:px-40 md:pb-40 md:[&_nav_a]:text-[6rem] lg:gap-x-100 lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_auto] lg:pt-140 lg:px-80 lg:pb-50 lg:[&_nav]:self-center lg:[&_nav]:[grid-column:2] lg:[&_nav]:[grid-row:1] lg:[&_nav_a]:text-[8rem] menu', open && 'is-open')} aria-hidden={!open}>
      <button className="items-center [background:none] border-[0.1rem] border-current border-solid rounded-[50%] [color:inherit] flex h-50 justify-center absolute right-20 top-20 [transition:background_0.4s,_color_0.4s] w-50 z-1 [&:hover]:bg-white [&:hover]:text-deep [&_svg]:[fill:none] [&_svg]:h-20 [&_svg]:[stroke:currentColor] [&_svg]:[stroke-width:1.4] [&_svg]:w-20 md:right-40 lg:h-60 lg:right-80 lg:top-30 lg:w-60" onClick={onClose} aria-label="Tutup menu" tabIndex={open ? 0 : -1}>
        <CloseIcon />
      </button>
      <div className="[align-self:end] relative [&_img]:max-h-[24vh] [&_img]:object-contain [&_img]:[object-position:left_bottom] [&_img]:opacity-[0] [&_img]:[transform:translateY(4rem)] [&_img]:[transition:opacity_0.8s_ease-out_0.3s,_transform_1s_var(--ease-saksi)_0.3s] [&_img]:w-full [.menu.is-open_&_img]:opacity-[1] [.menu.is-open_&_img]:[transform:none] md:[&_img]:max-h-[30vh] lg:[grid-column:1] lg:[grid-row:1_/_span_2] lg:[&_img]:max-h-[62vh]" aria-hidden="true">
        <p className="hidden font-hand text-[3.2rem] left-[52%] absolute -top-20 [transform:rotate(-6deg)] lg:block">
          pilih bagian
          <CurvedArrow className="h-60 left-[100%] absolute -top-30 [transform:rotate(-70deg)] w-80" />
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
      <p className="text-[1.3rem] opacity-[0.6] uppercase lg:[grid-column:2] lg:[grid-row:2]">Sistem Audit Kontrak Segel Integritas</p>
    </div>
  )
}
