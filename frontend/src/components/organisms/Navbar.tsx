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
    <header className="items-center text-white flex justify-between left-0 my-0 mx-auto max-w-1680 py-0 px-20 absolute right-0 top-20 z-20 md:py-0 md:px-40 lg:py-0 lg:px-80 lg:top-30">
      <Link className="items-center flex text-[2rem] font-[500] gap-12 tracking-[0.12em]" href="/" aria-label="SAKSI, ke beranda">
        <Logo tone="white" />
        <span>SAKSI</span>
      </Link>
      <p className="hidden text-[1.6rem] font-[350] opacity-[0.8] lg:inline-flex">Sistem Audit Kontrak Segel Integritas</p>
      <div className="items-center flex gap-20 navbar-right">
        <PillButton to={cta.href}>{cta.label}</PillButton>
        <NavSession />
        <button
          className="items-center [background:none] border-[0.1rem] border-current border-solid rounded-[50%] [color:inherit] flex flex-col gap-6 h-50 justify-center [transition:background_0.4s,_color_0.4s] w-50 [&_span]:bg-current [&_span]:block [&_span]:h-1.5 [&_span]:w-18 [&:hover]:bg-white [&:hover]:text-blue md:h-60 md:w-60"
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
