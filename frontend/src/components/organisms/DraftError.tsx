import Btn from "@/components/atoms/Btn";
import FormAlert from "@/components/atoms/FormAlert";

interface Props {
  error: string;
  loadingTemplate: boolean;
  onRetry: () => void;
  onManual: () => void;
}

/* The AI could not draft: why, with "try again" and "write by hand" */
export default function DraftError({
  error,
  loadingTemplate,
  onRetry,
  onManual,
}: Props) {
  return (
    <div className="grid gap-14 justify-items-start">
      <FormAlert>{error}</FormAlert>
      <div className="items-center flex flex-wrap gap-10">
        <Btn icon="refresh" onClick={onRetry}>
          Coba lagi
        </Btn>
        <Btn
          variant="ghost"
          icon="sign"
          onClick={onManual}
          disabled={loadingTemplate}
        >
          {loadingTemplate ? "Memuat template..." : "Tulis manual"}
        </Btn>
      </div>
    </div>
  );
}
