import type { Session } from "@/interfaces/auth";
import type { NavLink } from "@/interfaces/content";

/* The nav link that depends on whether someone is signed in. */
export const sessionLink = (session: Session | null): NavLink =>
  session ? { label: "Dashboard", href: "/dashboard" } : { label: "Masuk / daftar", href: "/masuk" };
