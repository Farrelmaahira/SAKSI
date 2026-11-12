import { useState, type DragEvent } from 'react'
import type { VerifyResult } from '@/interfaces/verify'
import { verifySeal } from '@/lib/api/verify-seal'
import { sha256 } from '@/lib/contracts/sha256'

/* Checks a dropped or chosen file against the sealed hashes: the hash is computed in the browser and only the hash goes to the server. */
export function useVerifyDoc(onResult?: (r: VerifyResult) => void) {
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')

  const check = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    const hash = await sha256(await file.arrayBuffer())
    // the hash is computed in the browser; only the hash goes to the server, never the file
    const r = await verifySeal(hash)
    setBusy(false)
    if (!r.ok) {
      setResult(null)
      return setError(r.error)
    }
    const k = r.data.cocok ? r.data.kontrak : undefined
    const next: VerifyResult = { name: file.name, hash, match: k ? { code: k.nomor, id: k.id, title: k.judul, version: r.data.segel?.nomorVersi ?? 0 } : undefined }
    setResult(next)
    onResult?.(next)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    check(e.dataTransfer.files[0])
  }

  return { over, setOver, busy, result, error, check, onDrop }
}
