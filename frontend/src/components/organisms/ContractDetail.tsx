"use client";

import { useState } from "react";
import Check from "@/components/atoms/Check";
import PillButton from "@/components/atoms/PillButton";
import MilestoneItem from "@/components/molecules/MilestoneItem";
import ReportListItem from "@/components/molecules/ReportListItem";
import type { SealedContract } from "@/interfaces/contract";
import { contractText } from "@/lib/contracts/contract-text";
import { downloadText } from "@/lib/contracts/download-text";
import { formatRp } from "@/lib/contracts/format-rp";

interface Props {
  contract: SealedContract;
  onReport: () => void;
}

export default function ContractDetail({
  contract: c,
  onReport,
}: Props) {
  const [copied, setCopied] = useState(false);
  const hides = (f: string) => Boolean(c.hidden?.includes(f));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="[animation:pop_0.45s_ease-out] mb-100">
      <header className="mb-40 [&_h2]:text-[3.8rem] [&_h2]:font-[320] [&_h2]:tracking-[-0.035em] [&_h2]:leading-[1.05] [&_h2]:max-w-1200 [&>p]:text-[1.8rem] [&>p]:mt-14 [&>p]:opacity-[0.7] md:[&_h2]:text-[5.6rem] lg:[&_h2]:text-[7rem]">
        <div className="flex flex-wrap gap-8 mb-24">
          <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit]">{c.type}</span>
          <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit] outline">{c.code}</span>
          {c.fromSimulation && (
            <span className="items-center bg-blue border-[0.1rem] border-blue border-solid rounded-[3rem] text-white inline-flex text-[1.2rem] h-28 py-0 px-12 uppercase [&.outline]:bg-transparent [&.outline]:border-current [&.outline]:[color:inherit] outline">Dari simulasi</span>
          )}
        </div>
        <h2>{c.title}</h2>
        <p>{c.village}</p>
      </header>

      <div className="grid gap-20 lg:[align-items:start] lg:gap-30 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="contract-main">
          <dl className="bg-soft rounded-[1.6rem] py-8 px-24 [&>div]:border-b-[0.1rem] [&>div]:border-b-[rgba(15,_15,_23,_0.1)] [&>div]:[border-bottom-style:solid] [&>div]:grid [&>div]:gap-4 [&>div]:py-16 [&>div]:px-0 [&>div:last-child]:border-b-0 [&>div:last-child]:[border-bottom-style:none] [&_dt]:text-[1.3rem] [&_dt]:opacity-[0.6] [&_dt]:uppercase [&_dd]:text-[1.7rem] [&_dd]:leading-[1.4] [&_small]:text-[1.4rem] [&_small]:opacity-[0.6] md:[&>div]:items-baseline md:[&>div]:grid-cols-[18rem_1fr]">
            <div>
              <dt>Pihak pertama</dt>
              <dd>{c.first}</dd>
            </div>
            <div>
              <dt>Pihak kedua</dt>
              <dd>{hides('pihak') ? <span className="text-[1.5rem] opacity-[0.6]">Tidak dipublikasikan desa</span> : c.second}</dd>
            </div>
            <div>
              <dt>Nilai</dt>
              <dd>
                {hides('nilai') ? (
                  <span className="text-[1.5rem] opacity-[0.6]">Tidak dipublikasikan desa</span>
                ) : (
                  <>
                    {formatRp(c.value)}
                    {c.valueNote && <small> {c.valueNote}</small>}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Jangka waktu</dt>
              <dd>{c.duration}</dd>
            </div>
            <div>
              <dt>Mulai berlaku</dt>
              <dd>{c.start}</dd>
            </div>
          </dl>

          {c.hash && (
          <div className="bg-ink rounded-[1.6rem] text-white mt-20 p-28 [&_code]:block [&_code]:font-code [&_code]:text-[1.5rem] [&_code]:tracking-[0.03em] [&_code]:leading-[1.6] [&_code]:break-all">
            <p className="text-[1.2rem] mb-12 opacity-[0.6] uppercase">Sidik digital SHA‑256</p>
            <code>{c.hash}</code>
            <p className="items-center flex text-[1.5rem] gap-10 mt-20">
              <Check /> Dokumen terdaftar dan belum berubah sejak disegel.
            </p>
            <div className="flex flex-wrap gap-24 mt-24 hash-actions">
              <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={copy}>
                {copied ? "Tersalin" : "Salin hash"}
              </button>
              <button
                type="button"
                className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0"
                onClick={() => downloadText(`${c.code}.txt`, contractText(c))}
              >
                Unduh dokumen
              </button>
            </div>
          </div>
          )}

          {hides('pasal') ? (
            <p className="border-b-[rgba(15,_15,_23,_0.15)] [&_summary]:items-center [&_summary]:[background:none] [&_summary]:[border:none] [&_summary]:[color:inherit] [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:[font-family:inherit] [&_summary]:font-[350] [&_summary]:gap-20 [&_summary]:justify-between [&_summary]:list-none [&_summary]:list-outside [&_summary]:py-26 [&_summary]:px-0 [&_summary]:text-left [&_summary]:[transition:opacity_0.2s] [&_summary]:w-full [&_summary:hover]:opacity-[0.85] [&_summary::-webkit-details-marker]:hidden bg-soft border-b-0 [border-bottom-style:none] rounded-[1.6rem] mt-20 py-0 px-24 [&_summary]:text-[1.8rem] [&_ol]:grid [&_ol]:gap-18 [&_ol]:list-none [&_ol]:list-outside [&_ol]:pb-26 [&_strong]:text-[1.5rem] [&_strong]:font-[500] [&_li_p]:text-[1.6rem] [&_li_p]:leading-[1.5] [&_li_p]:mt-4 [&_li_p]:opacity-[0.8] text-[1.5rem] leading-[1.5] opacity-[0.75]">Isi pasal tidak dipublikasikan desa. Keaslian dokumen tetap bisa dicek lewat hash di atas.</p>
          ) : (
            <details className="border-b-[rgba(15,_15,_23,_0.15)] [&_summary]:items-center [&_summary]:[background:none] [&_summary]:[border:none] [&_summary]:[color:inherit] [&_summary]:cursor-pointer [&_summary]:flex [&_summary]:[font-family:inherit] [&_summary]:font-[350] [&_summary]:gap-20 [&_summary]:justify-between [&_summary]:list-none [&_summary]:list-outside [&_summary]:py-26 [&_summary]:px-0 [&_summary]:text-left [&_summary]:[transition:opacity_0.2s] [&_summary]:w-full [&_summary:hover]:opacity-[0.85] [&_summary::-webkit-details-marker]:hidden bg-soft border-b-0 [border-bottom-style:none] rounded-[1.6rem] mt-20 py-0 px-24 [&_summary]:text-[1.8rem] [&_ol]:grid [&_ol]:gap-18 [&_ol]:list-none [&_ol]:list-outside [&_ol]:pb-26 [&_strong]:text-[1.5rem] [&_strong]:font-[500] [&_li_p]:text-[1.6rem] [&_li_p]:leading-[1.5] [&_li_p]:mt-4 [&_li_p]:opacity-[0.8]">
              <summary>
                Isi kontrak, {c.clauses.length} pasal
                <span className="flex-none h-20 relative [transition:transform_0.4s_var(--ease-saksi)] w-20 before:bg-current before:content-[''] before:left-0 before:absolute before:top-[50%] before:h-1.5 before:w-full after:bg-current after:content-[''] after:left-0 after:absolute after:top-[50%] after:h-1.5 after:w-full after:[transform:rotate(90deg)] [.faq-item.is-open_&]:[transform:rotate(45deg)] [details[open]>summary_&]:[transform:rotate(45deg)]" aria-hidden="true" />
              </summary>
              <ol>
                {c.clauses.map((cl, i) => (
                  <li key={cl.title}>
                    <strong>
                      Pasal {i + 1}. {cl.title}
                    </strong>
                    <p>{cl.text}</p>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>

        <div className="contract-side">
          <div className="bg-blue rounded-[1.6rem] text-white p-28">
            <div className="items-baseline flex justify-between [&_p]:text-[1.3rem] [&_p]:opacity-[0.8] [&_p]:uppercase [&_strong]:text-[6rem] [&_strong]:font-[300] [&_strong]:tracking-[-0.04em] [&_strong]:leading-[1]">
              <p>Progres pekerjaan</p>
              <strong>{c.progress}%</strong>
            </div>
            <div className="bg-deep rounded-[1rem] h-10 mt-16 overflow-hidden [&_span]:bg-white [&_span]:block [&_span]:h-full">
              <span style={{ width: `${c.progress}%` }} />
            </div>
            <ol className="grid gap-22 list-none list-outside mt-30 [&_li]:grid [&_li]:gap-14 [&_li]:grid-cols-[2.8rem_1fr] [&_strong]:block [&_strong]:text-[1.6rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.75] [&_p]:text-[1.4rem] [&_p]:leading-[1.45] [&_p]:mt-4 [&_p]:opacity-[0.85] timeline">
              {c.milestones.map((m) => (
                <MilestoneItem key={m.label} milestone={m} />
              ))}
            </ol>
          </div>

          <div className="bg-soft rounded-[1.6rem] grid gap-20 justify-items-start mt-20 p-28">
            <p className="text-[1.3rem] uppercase">Laporan warga ({c.reports.length})</p>
            {c.reports.length === 0 ? (
              <p className="text-[1.6rem] opacity-[0.7]">
                Belum ada laporan untuk kontrak ini.
              </p>
            ) : (
              <ul className="grid gap-14 list-none list-outside w-full [&>li]:bg-white [&>li]:rounded-[1.2rem] [&>li]:p-20 [&_strong]:block [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_strong]:mt-8 [&_strong]:mx-0 [&_strong]:mb-6 [&_p]:text-[1.5rem] [&_p]:leading-[1.5]">
                {c.reports.map((r) => (
                  <ReportListItem key={r.id} report={r} />
                ))}
              </ul>
            )}
            <PillButton tone="blue" onClick={onReport}>
              Laporkan kejanggalan
            </PillButton>
          </div>
        </div>
      </div>
    </article>
  );
}
