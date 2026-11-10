import Badge from "@/components/atoms/Badge";
import Btn from "@/components/atoms/Btn";
import FormAlert from "@/components/atoms/FormAlert";
import Hint from "@/components/atoms/Hint";
import StepTitle from "@/components/atoms/StepTitle";
import AuditPanel from "@/components/organisms/AuditPanel";
import ClauseEditor from "@/components/organisms/ClauseEditor";
import ClauseList from "@/components/organisms/ClauseList";
import type { TemplateInfo, TemplateKey } from "@/interfaces/drafting";
import type { useContractDraft } from "@/hooks/use-contract-draft";
import { backendJenis } from "@/data/drafting";

interface Props {
  info: TemplateInfo;
  template: TemplateKey;
  draft: ReturnType<typeof useContractDraft>;
  onRetry: () => void;
  onManual: () => void;
}

export default function BuatKontrakDraf({
  info,
  template,
  draft,
  onRetry,
  onManual,
}: Props) {
  const {
    clauses,
    audit,
    mode,
    thinking,
    loadingTemplate,
    error,
    model,
    edit,
    applySuggestion,
  } = draft;
  if (error && !thinking) {
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
  if (thinking || !audit) {
    return (
      <div
        className="items-center flex gap-20 justify-center min-h-300 [&_p]:grid [&_p]:gap-4 [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_small]:text-[1.35rem] [&_small]:text-dim"
        role="status"
      >
        <span
          className="[animation:d-spin_0.9s_linear_infinite] border-[0.3rem] border-line border-solid rounded-[50%] border-t-blue h-44 w-44"
          aria-hidden="true"
        />
        <p>
          <strong>AI sedang menyusun draf dan memeriksa pasal…</strong>
          <small>
            Mencocokkan dengan aturan pengadaan desa dan contoh pasal.
          </small>
        </p>
      </div>
    );
  }
  return (
    <div className="[align-items:start] grid gap-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(32rem,1fr)] d-draft">
      <div>
        <StepTitle>Draf kontrak</StepTitle>
        {mode === "manual" ? (
          <>
            <Hint className="mb-16">
              Mulai dari pasal wajib untuk {info.label.toLowerCase()}. Tambah,
              hapus, urutkan, dan sunting pasal. Hasil audit diperbarui
              otomatis.
            </Hint>
            <ClauseEditor
              clauses={clauses}
              onChange={edit}
              jenis={backendJenis[template]}
            />
          </>
        ) : (
          <>
            <Hint>
              Klik pasal untuk mengubah isinya. Hasil audit diperbarui otomatis.
            </Hint>
            {model !== null && (
              <p className="items-center flex flex-wrap gap-8 text-[1.3rem] text-dim mt-6">
                <Badge tone="blue">AI</Badge>
                {model && `Disusun oleh ${model}`}
              </p>
            )}
            <ClauseList
              clauses={clauses}
              audit={audit}
              onEdit={(key, text) =>
                edit(clauses.map((c) => (c.key === key ? { ...c, text } : c)))
              }
            />
          </>
        )}
      </div>
      <AuditPanel audit={audit} onApply={applySuggestion} />
    </div>
  );
}
