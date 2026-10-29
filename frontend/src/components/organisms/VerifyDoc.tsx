'use client'

import { useState, type DragEvent } from 'react'
import Check from '@/components/atoms/Check'
import Cross from '@/components/atoms/Cross'
import type { SealedContract } from '@/interfaces/contract'
import type { VerifyResult } from '@/interfaces/verify'
import { contractText } from '@/lib/contracts/contract-text'
import { downloadText } from '@/lib/contracts/download-text'
import { formatRp } from '@/lib/contracts/format-rp'
import { sha256 } from '@/lib/contracts/sha256'
import { shortHash } from '@/lib/contracts/short-hash'
import { cn } from '@/lib/utils'

interface Props {
  registry: SealedContract[]
  onOpen: (code: string) => void
}

/* Drop any file: its SHA-256 is computed in the browser and compared with the registry. */
export default function VerifyDoc({ registry, onOpen }: Props) {
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)

  const check = async (file?: File) => {
    if (!file) return
    setBusy(true)
    const hash = await sha256(await file.arrayBuffer())
    setResult({ name: file.name, hash, match: registry.find((c) => c.hash === hash) })
    setBusy(false)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    check(e.dataTransfer.files[0])
  }

  const sample = registry.find((c) => c.code === 'SKS-2026-014') ?? registry[0]

  return (
    <div className="verify-grid">
      <div>
        <p className="label">Cek keaslian</p>
        <h2 className="display-md">Apakah dokumen ini asli?</h2>
        <p className="verify-lead">Seret file kontrak ke kotak di samping. SAKSI menghitung hash file itu lalu mencocokkannya dengan arsip. File tidak diunggah ke mana pun.</p>
        {sample && (
          <div className="verify-samples">
            <p>Belum punya file? Coba dengan contoh ini:</p>
            <button type="button" className="text-btn light" onClick={() => downloadText(`${sample.code}.txt`, contractText(sample))}>
              Unduh dokumen asli
            </button>
            <button
              type="button"
              className="text-btn light"
              onClick={() =>
                downloadText(`${sample.code}-diubah.txt`, contractText(sample).split(formatRp(sample.value)).join(formatRp(sample.value + 4_000_000)))
              }
            >
              Unduh versi yang diubah
            </button>
          </div>
        )}
      </div>

      <div>
        <label
          className={cn('file-drop', over && 'is-over')}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <input type="file" onChange={(e) => check(e.target.files?.[0])} />
          <svg className="file-icon" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M12 6h17l9 9v27H12z" />
            <path d="M29 6v9h9M24 34V21M18 26l6-6 6 6" />
          </svg>
          <strong>{busy ? 'Menghitung hash…' : 'Seret file ke sini'}</strong>
          <span>atau klik untuk memilih file</span>
        </label>

        {result && (
          <div className={`verify-result ${result.match ? 'is-ok' : 'is-bad'}`}>
            <span className="vr-icon">{result.match ? <Check /> : <Cross />}</span>
            <div>
              <p className="vr-title">{result.match ? `Asli. Cocok dengan ${result.match.code}.` : 'Tidak ditemukan di arsip.'}</p>
              <p className="vr-text">
                {result.match
                  ? 'Isi file sama persis dengan kontrak yang disegel.'
                  : 'Hash file ini tidak sama dengan kontrak mana pun. Bisa jadi dokumennya sudah diubah, atau memang belum terdaftar.'}
              </p>
              <p className="vr-hash">
                {result.name} · <code>{shortHash(result.hash)}</code>
              </p>
              {result.match && (
                <button type="button" className="text-btn light" onClick={() => onOpen(result.match!.code)}>
                  Lihat kontraknya
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
