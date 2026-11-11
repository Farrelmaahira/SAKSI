"use client";

import type { DContract, DReport } from "@/interfaces/db";
import type { Session } from "@/interfaces/auth";
import { useState } from "react";
import { optionsFor } from "@/lib/dash/options-for";
import { desaAnswered } from "@/lib/db/desa-answered";
import type { ReportOption } from "@/interfaces/dash";
import { reportAction } from "@/lib/db/report-action";
import { addReportAction } from "@/lib/api/add-report-action";
import { reportActionApi } from "@/data/report-action-api";
import FormAlert from "@/components/atoms/FormAlert";
import FlowBadge from "@/components/atoms/FlowBadge";
import { reportDate } from "@/lib/db/report-date";
import Icon from "@/components/atoms/Icon";
import Link from "next/link";
import { placeholderFor } from "@/data/dash";
import Btn from "@/components/atoms/Btn";
import ReportThread from "@/components/molecules/ReportThread";

/* onChanged: reload after a server action (POST /reports/{id}/actions); local demo reports change in the local store */
interface Props {
  report: DReport;
  contract?: DContract;
  session: Session;
  onChanged?: () => void;
}

export default function ReportCard({
  report: r,
  contract,
  session,
  onChanged,
}: Props) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const options = optionsFor(session, r).filter(
    (o) => !r.apiId || reportActionApi[o.kind],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const waitingClarification =
    session.role.role === "perangkat_desa" &&
    r.actions.some((a) => a.kind === "klarifikasi") &&
    !desaAnswered(r);

  const run = async (o: ReportOption) => {
    const body = text.trim() || o.fallback || "";
    if (o.needsText && body.length < 5)
      return setHint("Tulis catatan singkat dulu, minimal 5 karakter.");
    if (r.apiId) {
      setBusy(true);
      setError("");
      const res = await addReportAction(r.apiId, {
        ...reportActionApi[o.kind]!,
        catatan: body,
      });
      setBusy(false);
      if (!res.ok) return setError(res.error);
      onChanged?.();
    } else reportAction(r.id, o.kind, body, session);
    setText("");
    setHint(null);
  };

  return (
    <article
      className={`bg-white border-[0.15rem] border-transparent border-solid rounded-[2rem] grid gap-10 p-20 [&.is-flagged]:border-red [&_h3]:text-[2rem] [&_h3]:font-[380] [&_h3]:tracking-[-0.015em] ${waitingClarification ? "is-flagged" : ""}`}
    >
      <header className="items-center flex flex-wrap gap-10 [&_code]:text-[1.25rem] [&_code]:text-dim">
        <code>{r.id}</code>
        <FlowBadge flow={r.flow} />
        <span className="text-[1.25rem] ml-auto text-dim">
          {reportDate(r.date)}
        </span>
      </header>
      <h3>{r.category}</h3>
      <p className="text-[1.5rem] leading-[1.55] max-w-800">{r.text}</p>
      <ul className="grid text-[1.3rem] gap-8 list-none list-outside text-dim [&_li]:items-start [&_li]:flex [&_li]:gap-8 [&_li]:leading-[1.5] [&_a]:text-blue [&_a]:font-code [&_a]:whitespace-nowrap d-report-meta">
        <li>
          <Icon name="file" />
          <Link href={`/dashboard/kontrak/${r.contractCode}?tab=laporan`}>
            {r.contractCode}
          </Link>
          {contract && <span>· {contract.title}</span>}
        </li>
        <li>
          <Icon name="doc" />
          <span>Pasal: {r.clause}</span>
        </li>
        {r.location && (
          <li>
            <Icon name="pin" />
            <span>Lokasi: {r.location}</span>
          </li>
        )}
        <li>
          <Icon name="image" />
          <span>{r.photos} foto bukti</span>
        </li>
        <li>
          <Icon name="user" />
          <span>
            {session.role.role === "perangkat_desa"
              ? "Pelapor: identitas dirahasiakan"
              : `Pelapor: ${r.reporterName ?? r.reporter}`}
          </span>
        </li>
      </ul>

      {waitingClarification && (
        <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-red text-white d-callout">
          <Icon name="alert" />
          BPD meminta klarifikasi. Kirim tanggapan supaya laporan bisa
          dilanjutkan.
        </p>
      )}

      <ReportThread actions={r.actions} />

      {options.length > 0 && (
        <div className="[&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-[#d6d6d2] [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.5rem] [&_textarea]:min-h-48 [&_textarea]:[outline:none] [&_textarea]:py-10 [&_textarea]:px-14 [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_textarea]:w-full [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_textarea:focus]:border-blue [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] border-t-[0.1rem] border-t-[#ececea] [border-top-style:solid] grid gap-10 pt-14">
          <label
            className="[clip:rect(0_0_0_0)] h-[1px] overflow-hidden absolute whitespace-nowrap w-[1px] sr-only"
            htmlFor={`note-${r.id}`}
          >
            Catatan
          </label>
          <textarea
            id={`note-${r.id}`}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholderFor[session.role.role]}
          />
          {hint && <p className="text-red text-[1.35rem] not-italic">{hint}</p>}
          {error && <FormAlert>{error}</FormAlert>}
          <div className="items-center flex flex-wrap gap-10">
            {options.map((o) => (
              <Btn
                key={o.kind}
                variant={o.variant}
                small
                onClick={() => run(o)}
                disabled={busy}
              >
                {o.label}
              </Btn>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
