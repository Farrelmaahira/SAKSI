import Btn from "@/components/atoms/Btn";
import FormAlert from "@/components/atoms/FormAlert";
import SourceBadge from "@/components/atoms/SourceBadge";
import ClauseVersionList from "@/components/molecules/ClauseVersionList";
import FormField from "@/components/molecules/FormField";
import Panel from "@/components/molecules/Panel";
import ClauseEditor from "@/components/organisms/ClauseEditorLazy";
import { backendJenis } from "@/data/drafting";
import type { useDraftEditor } from "@/hooks/use-draft-editor";
import type { DContract } from "@/interfaces/db";
import { downloadVersion } from "@/lib/dash/download-version";
import { fmtDateTime } from "@/lib/dates/fmt-date-time";

interface DraftVersionPanelProps {
  c: DContract;
  editor: ReturnType<typeof useDraftEditor>;
  canEdit: boolean;
  revising: boolean;
}

/* One version of the contract: read it, pick another version, or edit its clauses */
export default function DraftVersionPanel({
  c,
  editor: e,
  canEdit,
  revising,
}: DraftVersionPanelProps) {
  const { ver, latest, editing } = e;
  const desc = editing
    ? revising
      ? "Simpan akan membuat versi baru dan mengirimkannya untuk ditinjau ulang."
      : "Perubahan langsung diaudit ulang oleh AI."
    : `Dibuat ${fmtDateTime(ver.at)}${ver.note ? ` · ${ver.note}` : ""}`;

  return (
    <Panel
      title={editing ? `Mengubah versi ${latest.no}` : `Versi ${ver.no}`}
      desc={desc}
      action={
        !editing && (
          <div className="items-center flex flex-wrap gap-10">
            <SourceBadge source={ver.source} />
            {c.versions.length > 1 && (
              <FormField label="Pilih versi" hideLabel>
                <select
                  value={ver.no}
                  onChange={(ev) => e.setVerNo(Number(ev.target.value))}
                >
                  {c.versions.map((v) => (
                    <option key={v.no} value={v.no}>
                      Versi {v.no}
                      {v.source
                        ? ` · ${v.source === "ai" ? "AI" : "Manual"}`
                        : ""}
                      {v.no === latest.no ? " (terbaru)" : ""}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <Btn
              small
              variant="ghost"
              icon="doc"
              onClick={() => downloadVersion(c, ver)}
            >
              Unduh (simulasi PDF)
            </Btn>
            {canEdit && (
              <Btn small icon="sign" onClick={e.start}>
                Ubah pasal
              </Btn>
            )}
          </div>
        )
      }
    >
      {editing ? (
        <>
          <ClauseEditor
            clauses={e.draft}
            onChange={e.change}
            jenis={backendJenis[c.template]}
          />
          {revising && (
            <FormField label="Catatan perubahan untuk pihak kedua">
              <input
                value={e.note}
                onChange={(ev) => e.setNote(ev.target.value)}
                placeholder="Contoh: Tenggat termin 2 dimundurkan sesuai permintaan."
              />
            </FormField>
          )}
          {e.error && <FormAlert>{e.error}</FormAlert>}
          <div className="items-center flex flex-wrap gap-10">
            <Btn onClick={e.save} disabled={e.saving}>
              {e.saving
                ? "Menyimpan..."
                : revising
                  ? `Kirim versi ${latest.no + 1}`
                  : "Simpan perubahan"}
            </Btn>
            <Btn variant="ghost" onClick={e.cancel}>
              Batal
            </Btn>
          </div>
        </>
      ) : (
        <ClauseVersionList version={ver} previous={e.prev} />
      )}
    </Panel>
  );
}
