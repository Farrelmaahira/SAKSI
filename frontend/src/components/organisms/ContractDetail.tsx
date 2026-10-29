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
    <article className="contract">
      <header className="contract-head">
        <div className="contract-tags">
          <span className="tag">{c.type}</span>
          <span className="tag outline">{c.code}</span>
          {c.fromSimulation && (
            <span className="tag outline">Dari simulasi</span>
          )}
        </div>
        <h2>{c.title}</h2>
        <p>{c.village}</p>
      </header>

      <div className="contract-grid">
        <div className="contract-main">
          <dl className="contract-facts">
            <div>
              <dt>Pihak pertama</dt>
              <dd>{c.first}</dd>
            </div>
            <div>
              <dt>Pihak kedua</dt>
              <dd>{c.second}</dd>
            </div>
            <div>
              <dt>Nilai</dt>
              <dd>
                {formatRp(c.value)}
                {c.valueNote && <small> {c.valueNote}</small>}
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

          <div className="hash-box">
            <p className="hash-box-label">Sidik digital SHA‑256</p>
            <code>{c.hash}</code>
            <p className="verified">
              <Check /> Dokumen terdaftar dan belum berubah sejak disegel.
            </p>
            <div className="hash-actions">
              <button type="button" className="text-btn" onClick={copy}>
                {copied ? "Tersalin" : "Salin hash"}
              </button>
              <button
                type="button"
                className="text-btn"
                onClick={() => downloadText(`${c.code}.txt`, contractText(c))}
              >
                Unduh dokumen
              </button>
            </div>
          </div>

          <details className="clauses">
            <summary>
              Isi kontrak, {c.clauses.length} pasal
              <span className="faq-plus" aria-hidden="true" />
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
        </div>

        <div className="contract-side">
          <div className="progress-card">
            <div className="progress-top">
              <p>Progres pekerjaan</p>
              <strong>{c.progress}%</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${c.progress}%` }} />
            </div>
            <ol className="timeline">
              {c.milestones.map((m) => (
                <MilestoneItem key={m.label} milestone={m} />
              ))}
            </ol>
          </div>

          <div className="reports-card">
            <p className="reports-title">Laporan warga ({c.reports.length})</p>
            {c.reports.length === 0 ? (
              <p className="reports-empty">
                Belum ada laporan untuk kontrak ini.
              </p>
            ) : (
              <ul className="report-list">
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
