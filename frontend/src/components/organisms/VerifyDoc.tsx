'use client'

import { useState, type DragEvent } from 'react'
import Check from '@/components/atoms/Check'
import Cross from '@/components/atoms/Cross'
import type { VerifyResult } from '@/interfaces/verify'
import { sha256 } from '@/lib/contracts/sha256'
import { shortHash } from '@/lib/contracts/short-hash'
import { cn } from '@/lib/utils'
import { verifySeal } from '@/lib/api/verify-seal'
import FormAlert from '@/components/atoms/FormAlert'

interface Props {
  /* code = public contract number, id = server contract id */
  onOpen: (code: string, id: number) => void
  onResult?: (r: VerifyResult) => void
}

export default function VerifyDoc({ onOpen, onResult }: Props) {
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

  return (
    <div className="grid gap-50 lg:items-center lg:gap-100 lg:grid-cols-[1fr_1fr] [.d-panel-ink_&]:grid [.d-panel-ink_&]:gap-30 lg:[.d-panel-ink_&]:gap-50 lg:[.d-panel-ink_&]:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Cek keaslian</p>
        <h2 className="text-[4.4rem] font-[320] tracking-[-0.04em] leading-[1.02] md:text-[6.4rem] lg:text-[8rem] [.d-panel-ink_&]:text-[3.6rem] [.d-panel-ink_&]:font-[320] [.d-panel-ink_&]:tracking-[-0.035em] [.d-panel-ink_&]:leading-[1.05] [.d-panel-ink_&]:mt-8">Apakah dokumen ini asli?</h2>
        <p className="text-[1.8rem] leading-[1.55] my-30 mx-0 max-w-560 opacity-[0.8] [.d-panel-ink_&]:text-[1.6rem] [.d-panel-ink_&]:mt-16 [.d-panel-ink_&]:mx-0 [.d-panel-ink_&]:mb-24 [.d-panel-ink_&]:leading-[1.55] [.d-panel-ink_&]:max-w-560 [.d-panel-ink_&]:text-[#d6d6dc]">Seret file kontrak ke kotak di samping. SAKSI menghitung hash file itu lalu mencocokkannya dengan arsip. File tidak diunggah ke mana pun.</p>
      </div>

      <div>
        <label
          className={cn('cursor-pointer relative [transition:border-color_0.3s,_background_0.3s] [&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] items-center bg-[#1b1b25] [border:0.2rem_dashed_rgba(255,_255,_255,_0.35)] rounded-[2rem] flex flex-col gap-10 justify-center min-h-300 p-30 text-center [&:hover]:bg-[#252532] [&:hover]:border-white [&.is-over]:bg-[#252532] [&.is-over]:border-white focus-within:border-white [&_strong]:text-[2.2rem] [&_strong]:font-[400] [&_span]:text-[1.4rem] [&_span]:opacity-[0.6] [.d-panel-ink_&]:min-h-220 [.d-panel-ink_&]:items-center [.d-panel-ink_&]:bg-[#1b1b25] [.d-panel-ink_&]:[border:0.2rem_dashed_var(--color-ink-dim)] [.d-panel-ink_&]:rounded-[2rem] [.d-panel-ink_&]:cursor-pointer [.d-panel-ink_&]:flex [.d-panel-ink_&]:flex-col [.d-panel-ink_&]:gap-10 [.d-panel-ink_&]:justify-center [.d-panel-ink_&]:p-30 [.d-panel-ink_&]:relative [.d-panel-ink_&]:text-center [.d-panel-ink_&]:[transition:border-color_0.3s,_background_0.3s] [.d-panel-ink_&:hover]:bg-[#252532] [.d-panel-ink_&:hover]:border-white [.d-panel-ink_&.is-over]:bg-[#252532]! [.d-panel-ink_&.is-over]:border-white! [.d-panel-ink_&:focus-within]:bg-[#252532]! [.d-panel-ink_&:focus-within]:border-white! [.d-panel-ink_&_input]:h-[1px] [.d-panel-ink_&_input]:opacity-[0] [.d-panel-ink_&_input]:pointer-events-none [.d-panel-ink_&_input]:absolute [.d-panel-ink_&_input]:w-[1px] [.d-panel-ink_&_strong]:text-[2rem] [.d-panel-ink_&_strong]:font-[400] [.d-panel-ink_&_span]:text-[1.35rem]! [.d-panel-ink_&_span]:text-ink-dim', over && 'is-over')}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <input type="file" onChange={(e) => check(e.target.files?.[0])} />
          <svg className="[fill:none] h-60 [stroke:var(--color-white)] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6] w-60 [.d-panel-ink_&]:[fill:none] [.d-panel-ink_&]:h-50 [.d-panel-ink_&]:[stroke:var(--color-white)] [.d-panel-ink_&]:[stroke-linecap:round] [.d-panel-ink_&]:[stroke-linejoin:round] [.d-panel-ink_&]:[stroke-width:1.6] [.d-panel-ink_&]:w-50" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M12 6h17l9 9v27H12z" />
            <path d="M29 6v9h9M24 34V21M18 26l6-6 6 6" />
          </svg>
          <strong>{busy ? 'Menghitung hash…' : 'Seret file ke sini'}</strong>
          <span>atau klik untuk memilih file</span>
        </label>

        {error && <div className="mt-20"><FormAlert>{error}</FormAlert></div>}
        {result && (
          <div className={`[animation:pop_0.35s_ease-out] rounded-[1.6rem] grid gap-16 grid-cols-[auto_1fr] mt-20 p-24 [&.is-ok]:bg-blue [&.is-bad]:bg-red [.d-panel-ink_&]:[animation:pop_0.35s_ease-out] [.d-panel-ink_&]:rounded-[1.6rem] [.d-panel-ink_&]:grid [.d-panel-ink_&]:gap-14 [.d-panel-ink_&]:grid-cols-[auto_1fr] [.d-panel-ink_&]:mt-16 [.d-panel-ink_&]:p-20 [.d-panel-ink_&.is-ok]:bg-blue [.d-panel-ink_&.is-bad]:bg-red! ${result.match ? '[.d-checks_li&]:text-blue is-ok' : 'is-bad'}`}>
            <span className="items-center bg-white rounded-[50%] flex h-40 justify-center w-40 [.is-ok_&]:text-blue [.is-bad_&]:text-red [.d-panel-ink_&]:items-center [.d-panel-ink_&]:bg-white [.d-panel-ink_&]:rounded-[50%] [.d-panel-ink_&]:flex [.d-panel-ink_&]:h-40 [.d-panel-ink_&]:justify-center [.d-panel-ink_&]:w-40 [.d-panel-ink_.is-ok_&]:text-blue [.d-panel-ink_.is-bad_&]:text-red!">{result.match ? <Check /> : <Cross />}</span>
            <div>
              <p className="text-[2rem] [.d-panel-ink_&]:text-[1.9rem]">{result.match ? `Asli. Cocok dengan ${result.match.code}.` : 'Tidak ditemukan di arsip.'}</p>
              <p className="text-[1.5rem] leading-[1.5] mt-6 mx-0 mb-10 opacity-[0.9] [.d-panel-ink_&]:text-[1.45rem] [.d-panel-ink_&]:leading-[1.5] [.d-panel-ink_&]:mt-6 [.d-panel-ink_&]:mx-0 [.d-panel-ink_&]:mb-10">
                {result.match
                  ? 'Isi file sama persis dengan kontrak yang disegel.'
                  : 'Hash file ini tidak sama dengan kontrak mana pun. Bisa jadi dokumennya sudah diubah, atau memang belum terdaftar.'}
              </p>
              <p className="[&_code]:font-code text-[1.3rem] mb-12 opacity-[0.85] break-all [.d-panel-ink_&]:text-[1.25rem] [.d-panel-ink_&]:mb-10 [.d-panel-ink_&]:break-all">
                {result.name} · <code>{shortHash(result.hash)}</code>
              </p>
              {result.match && (
                <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] light [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={() => onOpen(result.match!.code, result.match!.id)}>
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
