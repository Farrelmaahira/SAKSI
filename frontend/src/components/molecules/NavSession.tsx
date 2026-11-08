"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";

/* "Masuk" link, or the first-name avatar when signed in. */
export default function NavSession() {
  const session = useSession();

  if (!session)
    return (
      <Link className="border-b-[0.1rem] border-b-current [border-bottom-style:solid] text-[1.4rem] tracking-[0.02em] py-4 px-0 uppercase [transition:opacity_0.3s] [&:hover]:opacity-[0.7]" href="/masuk">
        Masuk
      </Link>
    );

  return (
    <Link
      className="items-center flex text-[1.5rem] gap-10 nav-account"
      href="/dashboard"
      aria-label={`Dashboard ${session.name}`}
    >
      <span className="items-center bg-white rounded-[50%] text-blue flex text-[1.7rem] font-[500] h-46 justify-center [transition:transform_0.4s_var(--ease-saksi)] w-46 [.nav-account:hover_&]:[transform:scale(1.08)]">
        {session.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden lg:inline">{session.name.split(/\s+/)[0]}</span>
    </Link>
  );
}
