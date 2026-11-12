import { useEffect, useState } from 'react'
import { useConfirm } from '@/hooks/use-confirm'
import { useLegalReferences } from '@/hooks/use-legal-references'
import type { Clause } from '@/interfaces/drafting'
import { uid } from '@/lib/dates/uid'

/* Editing a list of clauses: change, move, add and delete, with focus following the action and a screen-reader announcement. */
export function useClauseEditor(clauses: Clause[], onChange: (clauses: Clause[]) => void, jenis: string) {
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

  return { refs, announce, set, move, add, remove, pickLegal }
}
