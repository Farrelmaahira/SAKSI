import { navLinks } from "@/data/nav-links";
import type { Session } from "@/interfaces/auth";
import type { NavLink } from "@/interfaces/content";

/* The last link depends on whether someone is signed in. */
export function buildNavLinks(session: Session | null): NavLink[] {
  return [
    ...navLinks,
    session
      ? { label: "Dashboard", href: "/dashboard" }
      : { label: "Masuk / daftar", href: "/masuk" },
  ];
}
