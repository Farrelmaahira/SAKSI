import Link from 'next/link'
import Logo from '@/components/atoms/Logo'
import Underline from '@/components/atoms/Underline'
import ScrollTopButton from '@/components/molecules/ScrollTopButton'
import SessionNavLink from '@/components/molecules/SessionNavLink'
import { navLinks } from '@/data/nav-links'

export default function Footer() {
  return (
    <footer className="bg-blue text-white overflow-hidden pt-100 px-0 pb-30 lg:pt-160 lg:px-0 lg:pb-50">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="grid gap-60 lg:[align-items:end] lg:grid-cols-[1fr_auto]">
          <div className="footer-lead">
            <p className="text-[4.2rem] font-[300] tracking-[-0.04em] leading-[1.05] mb-40 max-w-1000 lg:text-[8rem] lg:mb-50">
              Kontrak yang jelas adalah awal dari{' '}
              <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
                pengawasan.
                <Underline className="bottom-[-0.12em] h-[0.26em] left-[-2%] absolute w-[104%]" />
              </span>
            </p>
            <ScrollTopButton />
          </div>
          <nav className="flex flex-col text-[2.4rem] font-[320] gap-10 tracking-[-0.02em] [&_a]:[transition:opacity_0.3s,_transform_0.5s_var(--ease-saksi)] [&_a]:w-fit [&_a:hover]:opacity-[0.6] [&_a:hover]:[transform:translateX(0.8rem)] lg:items-end lg:text-[3rem]" aria-label="Navigasi footer">
            {navLinks.map(({ label, href }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
            <SessionNavLink />
          </nav>
        </div>
        <div className="flex flex-col gap-30 mt-100 lg:items-end lg:flex-row lg:justify-between lg:mt-140">
          <p className="flex items-end gap-[0.06em] text-[length:min(32vw,_46rem)] font-[300] tracking-[-0.07em] leading-[0.75] ml-[-0.05em]">
            <Logo tone="white" className="h-[0.72em] lg:h-[0.72em]" />
            <span>saksi</span>
          </p>
          <p className="text-[1.2rem] opacity-[0.7] uppercase lg:text-[1.4rem] lg:pb-10 lg:text-right">
            Sistem Audit Kontrak
            <br />
            Segel Integritas
          </p>
        </div>
      </div>
    </footer>
  )
}
