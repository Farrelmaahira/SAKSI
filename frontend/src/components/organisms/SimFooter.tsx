import Arrow from "@/components/atoms/Arrow";
import BackButton from "@/components/atoms/BackButton";
import PillButton from "@/components/atoms/PillButton";
import { steps } from "@/data/simulator";

interface Props {
  step: number;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
}

/* Back link and "next step" button of the simulator */
export default function SimFooter({ step, canNext, onBack, onNext }: Props) {
  return (
    <footer className="items-center flex gap-20 justify-between mt-32">
      <BackButton onClick={onBack} disabled={step === 0}>
        <Arrow dir="left" /> Kembali
      </BackButton>
      {step < steps.length - 1 && (
        <PillButton tone="blue" onClick={onNext} disabled={!canNext}>
          Langkah berikutnya
        </PillButton>
      )}
    </footer>
  );
}
