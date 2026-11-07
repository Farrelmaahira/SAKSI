"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashContext } from "@/contexts/dash-context";
import { useConfirm } from "@/hooks/use-confirm";
import { NAV_KEY } from "@/data/dash-nav";
import type { Session } from "@/interfaces/auth";
import { logout } from "@/lib/auth/logout";
import { isDesktop } from "@/lib/dash/is-desktop";
import { navCounts } from "@/lib/dash/nav-counts";
import { navFor } from "@/lib/dash/nav-for";
import { db } from "@/lib/db/db";
import { fillSealHashes } from "@/lib/db/fill-seal-hashes";
import { resetDemo } from "@/lib/db/reset-demo";
import NotAllowed from "@/components/molecules/NotAllowed";
import { wargaAllowed } from "@/lib/dash/warga-allowed";
import DashSidebar from "./DashSidebar";
import DashTopbar from "./DashTopbar";

interface Props {
  session: Session;
  children: ReactNode;
  onLeaving: () => void;
}

/* The signed-in frame: sidebar, top bar and page area. Only rendered in the browser, after sign-in. */
export default function DashShell({ session, children, onLeaving }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const path = usePathname();
  const data = db.use();
  const [sideOpen, setSideOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(NAV_KEY) === "1",
  );
  const [lastPath, setLastPath] = useState(path);

  if (path !== lastPath) {
    setLastPath(path);
    setSideOpen(false);
  }

  useEffect(() => {
    void fillSealHashes();
  }, []);

  useEffect(() => {
    document.body.style.overflow = sideOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sideOpen]);

  const signOut = () => {
    onLeaving();
    logout();
    router.push("/");
  };

  // One button: hides/shows the sidebar on desktop, opens the drawer on smaller screens
  const toggleNav = () => {
    if (!isDesktop()) return setSideOpen(true);
    setCollapsed((c) => {
      localStorage.setItem(NAV_KEY, c ? "0" : "1");
      return !c;
    });
  };

  const onReset = async () => {
    const ok = await confirm({
      title: "Kembalikan ke data contoh?",
      text: "Semua kontrak, laporan, dan catatan di dashboard kembali ke data contoh awal. Akun Anda tidak terhapus.",
      confirmLabel: "Ya, kembalikan",
      tone: "danger",
      art: "document-warning_2es6",
    });
    if (ok) resetDemo();
  };

  return (
    <div className={`app ${collapsed ? "is-collapsed" : ""}`}>
      <DashSidebar
        session={session}
        items={navFor(session.role.role, navCounts(data, session))}
        path={path}
        open={sideOpen}
        collapsed={collapsed}
        onClose={() => setSideOpen(false)}
        onReset={onReset}
        onSwitched={() => router.push("/dashboard")}
      />
      {sideOpen && (
        <button
          className="app-scrim"
          type="button"
          aria-label="Tutup menu"
          onClick={() => setSideOpen(false)}
        />
      )}

      <div className="app-main">
        <DashTopbar
          session={session}
          collapsed={collapsed}
          onToggleNav={toggleNav}
          onSignOut={signOut}
        />
        <main className="app-content">
          <DashContext.Provider value={{ session }}>
            {session.role.role === "warga" && !wargaAllowed(path) ? <NotAllowed /> : children}
          </DashContext.Provider>
        </main>
      </div>
    </div>
  );
}
