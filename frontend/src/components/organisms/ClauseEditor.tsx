'use client'

import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import ClauseEditorItem from '@/components/organisms/ClauseEditorItem'
import { useClauseEditor } from '@/hooks/use-clause-editor'
import type { Clause } from '@/interfaces/drafting'

interface Props { clauses: Clause[]; onChange: (clauses: Clause[]) => void; jenis: string }

export default function ClauseEditor({ clauses, onChange, jenis }: Props) {
  const editor = useClauseEditor(clauses, onChange, jenis)
  const { refs } = editor

  return (
    <div className="grid gap-12">
      {refs && !refs.ok && <FormAlert>Daftar dasar hukum belum bisa dimuat: {refs.error}</FormAlert>}
      <ol className="grid gap-8 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-[#ececea] [&>li]:[border-style:dashed] [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-12 [&>li]:py-14 [&>li]:px-16 [&_label]:grid [&_label]:gap-8">
        {clauses.map((c, i) => (
          <ClauseEditorItem key={c.key} c={c} i={i} count={clauses.length} editor={editor} />
        ))}
      </ol>
      <div>
        <Btn variant="ghost" icon="plus" id="tambah-pasal" onClick={editor.add}>
          Tambah pasal
        </Btn>
      </div>
      <p className="sr-only" aria-live="polite">
        {editor.announce}
      </p>
    </div>
  )
}
