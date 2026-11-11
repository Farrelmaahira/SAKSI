import { navLinks } from "@/data/nav-links";
import type { Session } from "@/interfaces/auth";
import type { NavLink } from "@/interfaces/content";
import { sessionLink } from "@/lib/nav/session-link";

/* The last link depends on whether someone is signed in. */
export function buildNavLinks(session: Session | null): NavLink[] {
  return [...navLinks, sessionLink(session)];
}
