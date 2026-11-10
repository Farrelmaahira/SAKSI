import Btn from "@/components/atoms/Btn";

interface Props {
  step: number;
  busy: boolean;
  thinking: boolean;
  loadingTemplate: boolean;
  canNext: boolean;
  critical: number;
  onBack: () => void;
  onNext: () => void;
  onManual: () => void;
  onFinish: (send: boolean) => void;
}

/* Back / next buttons of the wizard; the last two steps change what the buttons do */
export default function BuatKontrakFooter({
  step,
  busy,
  thinking,
  loadingTemplate,
  canNext,
  critical,
  onBack,
  onNext,
  onManual,
  onFinish,
}: Props) {
  return (
    <footer className="items-center border-t-[0.1rem] border-t-[#ececea] [border-top-style:solid] flex flex-wrap gap-10 justify-between pt-20">
      {step > 0 && !thinking ? (
        <Btn variant="ghost" onClick={onBack}>
          Kembali
        </Btn>
      ) : (
        <span />
      )}
      {step === 2 ? (
        <div className="items-center flex flex-wrap gap-10">
          <Btn
            variant="ghost"
            icon="sign"
            onClick={onManual}
            disabled={loadingTemplate}
          >
            {loadingTemplate ? "Memuat template..." : "Tulis manual"}
          </Btn>
          <Btn
            onClick={onNext}
            icon="arrow"
            disabled={thinking || loadingTemplate}
          >
            Bantu dengan AI
          </Btn>
        </div>
      ) : step < 4 ? (
        <Btn onClick={onNext} disabled={!canNext} icon="arrow">
          Lanjut
        </Btn>
      ) : (
        <div className="items-center flex flex-wrap gap-10">
          <Btn variant="ghost" onClick={() => onFinish(false)} disabled={busy}>
            {busy ? "Menyimpan..." : "Simpan sebagai draf"}
          </Btn>
          <Btn onClick={() => onFinish(true)} disabled={critical > 0 || busy}>
            {busy ? "Mengirim..." : "Simpan dan kirim ke pihak kedua"}
          </Btn>
        </div>
      )}
    </footer>
  );
}
