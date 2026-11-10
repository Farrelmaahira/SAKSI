'use client'

import { useEffect, useState } from 'react'
import type { Clause } from '@/interfaces/drafting'
import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import { useConfirm } from '@/hooks/use-confirm'
import { useLegalReferences } from '@/hooks/use-legal-references'
import { uid } from '@/lib/dates/uid'

interface Props { clauses: Clause[]; onChange: (clauses: Clause[]) => void; jenis: string }

const FIELD =
  'bg-white border-[0.15rem] border-[#d6d6d2] border-solid rounded-[1.2rem] text-ink text-[1.5rem] min-h-48 [outline:none] py-10 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] w-full focus:border-blue focus:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] disabled:bg-soft disabled:text-dim'
const SELECT =
  'appearance-none [background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [background-repeat:no-repeat] [background-size:0.55rem_0.55rem] pr-46 text-ellipsis'
const LABEL = 'text-[1.25rem] tracking-[0.04em] text-dim uppercase'

export default function ClauseEditor({ clauses, onChange, jenis }: Props) {
  const confirm = useConfirm()
  const refs = useLegalReferences(jenis)
  const [focus, setFocus] = useState<{ id: string } | null>(null)
  const [announce, setAnnounce] = useState('')

  // a new object per request so the same id can be focused twice in a row
  useEffect(() => {
    if (focus) document.getElementById(focus.id)?.focus()
  }, [focus])

  const set = (key: string, patch: Partial<Clause>) => onChange(clauses.map((c) => (c.key === key ? { ...c, ...patch } : c)))

  const move = (i: number, to: number) => {
    const list = [...clauses]
    const [c] = list.splice(i, 1)
    list.splice(to, 0, c)
    onChange(list)
    // keep keyboard focus on a usable button: at the top or bottom the pressed one becomes disabled
    const dir = to < i ? 'naik' : 'turun'
    const atEdge = to === 0 || to === list.length - 1
    setFocus({ id: `${atEdge ? (dir === 'naik' ? 'turun' : 'naik') : dir}-${c.key}` })
    setAnnounce(`${c.title || 'Pasal'} sekarang pasal ${to + 1}.`)
  }

  const add = () => {
    const key = uid('P-')
    onChange([...clauses, { key, title: '', text: '', plain: '', legal: '' }])
    setFocus({ id: `judul-${key}` })
  }

  const remove = async (i: number) => {
    const c = clauses[i]
    const ok = await confirm({
      title: `Hapus pasal ${i + 1}?`,
      text: `Pasal “${c.title || 'tanpa judul'}” akan dihapus dari draf ini. Pasal wajib yang dihapus akan ditandai saat audit.`,
      confirmLabel: 'Ya, hapus pasal',
      tone: 'danger',
    })
    if (!ok) return
    const list = clauses.filter((_, j) => j !== i)
    onChange(list)
    setAnnounce(`Pasal ${i + 1} dihapus.`)
    const nextClause = list[Math.min(i, list.length - 1)]
    setFocus({ id: nextClause ? `judul-${nextClause.key}` : 'tambah-pasal' })
  }

  const pickLegal = (key: string, id: number) => {
    const r = refs?.ok ? refs.data.find((x) => x.id === id) : undefined
    set(key, { legalReferenceId: id || undefined, legal: r ? `${r.peraturan} ${r.nomorPasal}`.trim() : '' })
  }

  return (
    <div className="grid gap-12">
      {refs && !refs.ok && <FormAlert>Daftar dasar hukum belum bisa dimuat: {refs.error}</FormAlert>}
      <ol className="grid gap-8 list-none list-outside [&>li]:border-[0.15rem] [&>li]:border-[#ececea] [&>li]:[border-style:dashed] [&>li]:rounded-[1.4rem] [&>li]:grid [&>li]:gap-12 [&>li]:py-14 [&>li]:px-16 [&_label]:grid [&_label]:gap-8">
        {clauses.map((c, i) => {
          const known = refs?.ok && refs.data.some((r) => r.id === c.legalReferenceId)
          return (
            <li key={c.key}>
              <label>
                <span className={LABEL}>Judul pasal {i + 1}</span>
                <input id={`judul-${c.key}`} className={FIELD} value={c.title} onChange={(e) => set(c.key, { title: e.target.value })} placeholder="Contoh: Sanksi Keterlambatan" />
              </label>
              <label>
                <span className={LABEL}>Isi pasal {i + 1}</span>
                <textarea
                  rows={3}
                  className={`${FIELD} leading-[1.5] resize-y`}
                  value={c.text}
                  onChange={(e) => set(c.key, { text: e.target.value })}
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
                <select className={`${FIELD} ${SELECT}`} value={c.legalReferenceId ?? 0} disabled={!refs?.ok} onChange={(e) => pickLegal(c.key, Number(e.target.value))}>
                  <option value={0}>{refs === null ? 'Memuat daftar…' : refs.ok ? 'Tanpa dasar hukum' : c.legal || 'Daftar belum tersedia'}</option>
                  {c.legalReferenceId && !known && <option value={c.legalReferenceId}>{c.legal || `Referensi #${c.legalReferenceId}`}</option>}
                  {refs?.ok &&
                    refs.data.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.peraturan} · {r.nomorPasal}
                      </option>
                    ))}
                </select>
              </label>
              <div className="items-center flex flex-wrap gap-8">
                <Btn small variant="ghost" id={`naik-${c.key}`} label={`Naikkan pasal ${i + 1}`} disabled={i === 0} onClick={() => move(i, i - 1)}>
                  Naik
                </Btn>
                <Btn small variant="ghost" id={`turun-${c.key}`} label={`Turunkan pasal ${i + 1}`} disabled={i === clauses.length - 1} onClick={() => move(i, i + 1)}>
                  Turun
                </Btn>
                <Btn small variant="ghost" label={`Hapus pasal ${i + 1}`} onClick={() => remove(i)}>
                  Hapus
                </Btn>
              </div>
            </li>
          )
        })}
      </ol>
      <div>
        <Btn variant="ghost" icon="plus" id="tambah-pasal" onClick={add}>
          Tambah pasal
        </Btn>
      </div>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
