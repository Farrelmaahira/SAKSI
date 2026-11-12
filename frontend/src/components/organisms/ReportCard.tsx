"use client";

import Callout from "@/components/atoms/Callout";
import FlowBadge from "@/components/atoms/FlowBadge";
import ReportMeta from "@/components/molecules/ReportMeta";
import ReportThread from "@/components/molecules/ReportThread";
import ReportActionBox from "@/components/organisms/ReportActionBox";
import { useReportActions } from "@/hooks/use-report-actions";
import type { Session } from "@/interfaces/auth";
import type { DContract, DReport } from "@/interfaces/db";
import { desaAnswered } from "@/lib/db/desa-answered";
import { reportDate } from "@/lib/db/report-date";
import { cn } from "@/lib/utils";

/* onChanged: reload after a server action (POST /reports/{id}/actions); local demo reports change in the local store */
interface Props {
  report: DReport;
  contract?: DContract;
  session: Session;
  onChanged?: () => void;
}

export default function ReportCard({ report: r, contract, session, onChanged }: Props) {
  const actions = useReportActions(r, session, onChanged);
  const role = session.role.role;
  const waitingClarification = role === "perangkat_desa" && r.actions.some((a) => a.kind === "klarifikasi") && !desaAnswered(r);

  return (
    <article className={cn("bg-white border-[0.15rem] border-transparent border-solid rounded-[2rem] grid gap-10 p-20 [&_h3]:text-[2rem] [&_h3]:font-[380] [&_h3]:tracking-[-0.015em]", waitingClarification ? "border-red" : "border-transparent")}>
      <header className="items-center flex flex-wrap gap-10 [&_code]:text-[1.25rem] [&_code]:text-dim">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} />
        <span className="text-[1.25rem] ml-auto text-dim">{reportDate(r.date)}</span>
      </header>
      <h3>{r.category}</h3>
      <p className="text-[1.5rem] leading-[1.55] max-w-800">{r.text}</p>
      <ReportMeta r={r} contract={contract} hideReporter={role === "perangkat_desa"} />
      {waitingClarification && (
        <Callout tone="red" icon="alert">
          BPD meminta klarifikasi. Kirim tanggapan supaya laporan bisa dilanjutkan.
        </Callout>
      )}
      <ReportThread actions={r.actions} />
      {actions.options.length > 0 && <ReportActionBox id={r.id} role={role} actions={actions} />}
    </article>
  );
}
