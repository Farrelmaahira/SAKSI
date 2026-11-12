import Badge from "@/components/atoms/Badge";
import Hint from "@/components/atoms/Hint";
import StepTitle from "@/components/atoms/StepTitle";
import AuditPanel from "@/components/organisms/AuditPanel";
import DraftError from "@/components/organisms/DraftError";
import DraftLoading from "@/components/organisms/DraftLoading";
import ClauseEditor from "@/components/organisms/ClauseEditorLazy";
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
  if (error && !thinking)
    return (
      <DraftError
        error={error}
        loadingTemplate={loadingTemplate}
        onRetry={onRetry}
        onManual={onManual}
      />
    );
  if (thinking || !audit) return <DraftLoading />;
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
              focus={draft.focus}
              onEdit={(key, text) =>
                edit(clauses.map((c) => (c.key === key ? { ...c, text } : c)))
              }
            />
          </>
        )}
      </div>
      <AuditPanel audit={audit} onApply={applySuggestion} fromServer={draft.fromServer} />
    </div>
  );
}
