"use client";

import Locked from "@/components/atoms/Locked";
import Panel from "@/components/molecules/Panel";
import ProgressHistory from "@/components/molecules/ProgressHistory";
import TerminState from "@/components/molecules/TerminState";
import ProgressFormPanel from "@/components/organisms/ProgressFormPanel";
import { useContractTermin } from "@/hooks/use-contract-termin";
import { useProgressForm } from "@/hooks/use-progress-form";
import type { TabProps } from "@/interfaces/dash";
import { progressLockText } from "@/lib/dash/progress-lock-text";
import { setSelfReport } from "@/lib/db/set-self-report";
import { progressOf } from "@/lib/db/progress-of";

export default function ProgresTab({ c: local, session }: TabProps) {
  const t = useContractTermin(local);
  const c = t.c;
  const form = useProgressForm(c, session, t.reload);
  const role = session.role.role;
  const running = c.status === "berjalan";
  const canReport = running && (role === "perangkat_desa" || (role === "pihak_kedua" && (t.server || c.selfReport)));

  if (t.server && !t.result?.ok) return <TerminState result={t.result} />;
  return (
    <div className="items-stretch grid gap-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] [&>*]:min-w-0">
      <Panel title="Riwayat progres" desc="Riwayat ini juga menjadi tonggak pekerjaan di portal warga.">
        <ProgressHistory last={progressOf(c)} entries={c.progress} />
      </Panel>
      <div className="grid gap-20 [&>*]:min-w-0">
        {canReport ? <ProgressFormPanel c={c} form={form} /> : <Locked text={progressLockText(c.status, role)} />}
        {role === "perangkat_desa" && running && !t.server && (
          <Panel title="Laporan dari pihak kedua">
            <label className="items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18 bg-soft rounded-[1.2rem] py-12 px-14">
              <input type="checkbox" checked={c.selfReport} onChange={(e) => setSelfReport(c.code, e.target.checked)} />
              <span>Izinkan pihak kedua mencatat progres sendiri</span>
            </label>
          </Panel>
        )}
      </div>
    </div>
  );
}
