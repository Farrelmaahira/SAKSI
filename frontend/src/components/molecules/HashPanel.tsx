import Check from "@/components/atoms/Check";
import Cross from "@/components/atoms/Cross";
import PillButton from "@/components/atoms/PillButton";

interface Props {
  sealed: string;
  scramble: string;
  liveHash: string;
  onSeal: () => void;
  onRestore: () => void;
}

/* The SHA-256 of the contract: unsealed, scrambling while it seals, or sealed with the changed characters marked in red */
export default function HashPanel({
  sealed,
  scramble,
  liveHash,
  onSeal,
  onRestore,
}: Props) {
  const changed =
    sealed && liveHash
      ? [...liveHash].filter((ch, i) => ch !== sealed[i]).length
      : 0;
  const matches = sealed && liveHash === sealed;
  return (
    <div className="bg-ink rounded-[1.6rem] text-white flex flex-col gap-24 p-28 hash-panel">
      <p className="text-[1.2rem] opacity-[0.6] uppercase">
        Sidik digital SHA‑256
      </p>
      <p className="font-code text-[1.6rem] tracking-[0.04em] leading-[1.6] min-h-[4.8em] break-all md:text-[1.9rem] hash-value">
        {sealed ? (
          [...liveHash].map((ch, i) => (
            <span
              key={i}
              className={
                ch !== sealed[i]
                  ? "[.hash-value_&]:bg-red [.hash-value_&]:rounded-[0.2rem]"
                  : ""
              }
            >
              {ch}
            </span>
          ))
        ) : scramble ? (
          <span className="opacity-[0.55]">{scramble}</span>
        ) : (
          <span className="font-body opacity-[0.4]">Belum disegel</span>
        )}
      </p>
      {!sealed && (
        <PillButton tone="light" onClick={onSeal} disabled={Boolean(scramble)}>
          Segel dokumen
        </PillButton>
      )}
      {sealed && (
        <div
          className={`items-center [animation:pop_0.3s_ease-out] rounded-[1.2rem] grid gap-12 grid-cols-[auto_1fr] p-16 [&.is-ok]:bg-blue [&.is-bad]:bg-red [&_p]:text-[1.6rem] [&_small]:text-[1.3rem] [&_small]:opacity-[0.85] hash-status ${matches ? "[.d-checks_li&]:text-blue is-ok" : "is-bad"}`}
        >
          {matches ? <Check /> : <Cross />}
          <div>
            <p>
              {matches
                ? "Cocok dengan segel"
                : "Tidak cocok. Isi dokumen sudah berubah."}
            </p>
            <small>
              {matches
                ? "Isi kontrak sama persis dengan saat disegel."
                : `${changed} dari 64 karakter berubah karena nilai diganti.`}
            </small>
          </div>
          {!matches && (
            <button
              type="button"
              className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] light [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0"
              onClick={onRestore}
            >
              Kembalikan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
