"use client";

import type { ReactNode } from "react";
import { DashContext } from "@/contexts/dash-context";
import { useDashShell } from "@/hooks/use-dash-shell";
import type { Session } from "@/interfaces/auth";
import NotAllowed from "@/components/molecules/NotAllowed";
import DashSidebar from "./DashSidebar";
import DashTopbar from "./DashTopbar";

interface Props {
  session: Session;
  children: ReactNode;
  onLeaving: () => void;
}

export default function DashShell({ session, children, onLeaving }: Props) {
  const { nav, actions, items, blocked } = useDashShell(session, onLeaving);

  return (
    <div
      className={`[--muted:#6b6b73] [--side-muted:#c3cff5] [--ink-muted:#a6a6b0] [--green:#1b7a3e] [--gray:#5c5c66] [--line:#dcdcd8] bg-soft text-ink text-[1.5rem] min-h-svh [&_code]:font-code lg:[transition:grid-template-columns_0.35s_var(--ease-saksi)] lg:[&.is-collapsed]:grid-cols-[8.8rem_minmax(0,1fr)] lg:grid lg:grid-cols-[30rem_minmax(0,1fr)] app ${nav.collapsed ? "is-collapsed" : ""}`}
    >
      <DashSidebar
        session={session}
        items={items}
        path={nav.path}
        open={nav.open}
        collapsed={nav.collapsed}
        onClose={nav.close}
        onReset={actions.reset}
        onSwitched={actions.afterSwitch}
      />
      {nav.open && (
        <button
          className="bg-[rgba(15,_15,_23,_0.45)] border-0 border-none inset-0 fixed z-30 lg:hidden"
          type="button"
          aria-label="Tutup menu"
          onClick={nav.close}
        />
      )}

      <div className="flex flex-col min-h-svh min-w-0">
        <DashTopbar
          session={session}
          collapsed={nav.collapsed}
          onToggleNav={nav.toggle}
          onSignOut={actions.signOut}
        />
        <main className="grid gap-20 my-0 mx-auto max-w-1500 pt-12 px-20 pb-60 w-full md:gap-24 md:pt-16 md:px-40 md:pb-80 lg:pt-16 lg:px-50 lg:pb-100 [&>*]:min-w-0">
          <DashContext.Provider value={{ session }}>
            {blocked ? (
              <NotAllowed />
            ) : (
              children
            )}
          </DashContext.Provider>
        </main>
      </div>
    </div>
  );
}
