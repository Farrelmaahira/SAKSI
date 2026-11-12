import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import FormField from '@/components/molecules/FormField'
import ClauseEditor from '@/components/organisms/ClauseEditorLazy'
import { backendJenis } from '@/data/drafting'
import type { useDraftEditor } from '@/hooks/use-draft-editor'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  editor: ReturnType<typeof useDraftEditor>
  /* the second party asked for changes: a note is asked for and the save sends a new version */
  revising: boolean
}

/* Editing the clauses: the editor, the change note when revising, errors, and save or cancel */
export default function DraftEditBody({ c, editor: e, revising }: Props) {
  return (
    <>
      <ClauseEditor clauses={e.draft} onChange={e.change} jenis={backendJenis[c.template]} />
      {revising && (
        <FormField label="Catatan perubahan untuk pihak kedua">
          <input value={e.note} onChange={(ev) => e.setNote(ev.target.value)} placeholder="Contoh: Tenggat termin 2 dimundurkan sesuai permintaan." />
        </FormField>
      )}
      {e.error && <FormAlert>{e.error}</FormAlert>}
      <div className="items-center flex flex-wrap gap-10">
        <Btn onClick={e.save} disabled={e.saving}>{e.saving ? 'Menyimpan...' : revising ? `Kirim versi ${e.latest.no + 1}` : 'Simpan perubahan'}</Btn>
        <Btn variant="ghost" onClick={e.cancel}>Batal</Btn>
      </div>
    </>
  )
}
