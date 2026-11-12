"use client";

import Check from "@/components/atoms/Check";
import { useCopied } from "@/hooks/use-copied";
import type { SealedContract } from "@/interfaces/contract";
import { contractText } from "@/lib/contracts/contract-text";
import { downloadText } from "@/lib/contracts/download-text";

interface Props {
  c: SealedContract;
}

/* The contract's SHA-256 fingerprint with copy and download */
export default function HashCard({ c }: Props) {
  const { copied, copy } = useCopied(c.hash);
  if (!c.hash) return null;
  return (
    <div className="bg-ink rounded-[1.6rem] text-white mt-20 p-28 [&_code]:block [&_code]:font-code [&_code]:text-[1.5rem] [&_code]:tracking-[0.03em] [&_code]:leading-[1.6] [&_code]:break-all">
      <p className="text-[1.2rem] mb-12 opacity-[0.6] uppercase">
        Sidik digital SHA‑256
      </p>
      <code>{c.hash}</code>
      <p className="items-center flex text-[1.5rem] gap-10 mt-20">
        <Check /> Dokumen terdaftar dan belum berubah sejak disegel.
      </p>
      <div className="flex flex-wrap gap-24 mt-24 hash-actions">
        <button
          type="button"
          className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0"
          onClick={copy}
        >
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
  );
}
