import Btn from '@/components/atoms/Btn'
import type { useClauseEditor } from '@/hooks/use-clause-editor'
import type { Clause } from '@/interfaces/drafting'

interface Props {
  c: Clause
  /* zero-based position and how many clauses there are */
  i: number
  count: number
  editor: ReturnType<typeof useClauseEditor>
}

const FIELD =
  'bg-white border-[0.15rem] border-[#d6d6d2] border-solid rounded-[1.2rem] text-ink text-[1.5rem] min-h-48 [outline:none] py-10 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] w-full focus:border-blue focus:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] disabled:bg-soft disabled:text-dim'
const SELECT =
  'appearance-none [background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [background-repeat:no-repeat] [background-size:0.55rem_0.55rem] pr-46 text-ellipsis'
const LABEL = 'text-[1.25rem] tracking-[0.04em] text-dim uppercase'

/* One clause: title, text, legal basis, and the buttons to move or delete it */
export default function ClauseEditorItem({ c, i, count, editor }: Props) {
  const known = editor.refs?.ok && editor.refs.data.some((r) => r.id === c.legalReferenceId)
  return (
    <li>
          <label>
            <span className={LABEL}>Judul pasal {i + 1}</span>
            <input id={`judul-${c.key}`} className={FIELD} value={c.title} onChange={(e) => editor.set(c.key, { title: e.target.value })} placeholder="Contoh: Sanksi Keterlambatan" />
          </label>
          <label>
            <span className={LABEL}>Isi pasal {i + 1}</span>
            <textarea
              rows={3}
              className={`${FIELD} leading-[1.5] resize-y`}
              value={c.text}
              onChange={(e) => editor.set(c.key, { text: e.target.value })}
              aria-describedby={c.plain ? `hint-${c.key}` : undefined}
            />
          </label>
          {c.plain && (
            <small id={`hint-${c.key}`} className="text-[1.3rem] leading-[1.5] text-dim">
              {c.plain}
            </small>
          )}
          <label>
            <span className={LABEL}>Dasar hukum pasal {i + 1}</span>
            <select className={`${FIELD} ${SELECT}`} value={c.legalReferenceId ?? 0} disabled={!editor.refs?.ok} onChange={(e) => editor.pickLegal(c.key, Number(e.target.value))}>
              <option value={0}>{editor.refs === null ? 'Memuat daftar…' : editor.refs.ok ? 'Tanpa dasar hukum' : c.legal || 'Daftar belum tersedia'}</option>
              {c.legalReferenceId && !known && <option value={c.legalReferenceId}>{c.legal || `Referensi #${c.legalReferenceId}`}</option>}
              {editor.refs?.ok &&
                editor.refs.data.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.peraturan} · {r.nomorPasal}
                  </option>
                ))}
            </select>
          </label>
          <div className="items-center flex flex-wrap gap-8">
            <Btn small variant="ghost" id={`naik-${c.key}`} label={`Naikkan pasal ${i + 1}`} disabled={i === 0} onClick={() => editor.move(i, i - 1)}>
              Naik
            </Btn>
            <Btn small variant="ghost" id={`turun-${c.key}`} label={`Turunkan pasal ${i + 1}`} disabled={i === count - 1} onClick={() => editor.move(i, i + 1)}>
              Turun
            </Btn>
            <Btn small variant="ghost" label={`Hapus pasal ${i + 1}`} onClick={() => editor.remove(i)}>
              Hapus
            </Btn>
          </div>
        </li>
  )
}
