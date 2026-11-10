'use client'

import { useState } from 'react'
import Check from '@/components/atoms/Check'
import FormAlert from '@/components/atoms/FormAlert'
import PillButton from '@/components/atoms/PillButton'
import PhotoDrop from '@/components/molecules/PhotoDrop'
import ReportReview from '@/components/molecules/ReportReview'
import { formSteps, reportCategories } from '@/data/report-form'
import type { Report, SealedContract } from '@/interfaces/contract'
import { getSession } from '@/lib/auth/get-session'
import { submitReport } from '@/lib/api/submit-report'
import { cn } from '@/lib/utils'
import ReportTicket from './ReportTicket'

interface Props {
  registry: SealedContract[]
  code: string
  onCode: (code: string) => void
  onOpen: (code: string) => void
}

export default function ReportForm({ registry, code, onCode, onOpen }: Props) {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('')
  const [clause, setClause] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [name, setName] = useState(() => getSession()?.name ?? '')
  const [ticket, setTicket] = useState<Report | null>(null)

  const contract = registry.find((c) => c.code === code)
  const reporter = anonymous || !name.trim() ? 'Anonim' : name.trim()

  const [lastCode, setLastCode] = useState(code)
  if (code !== lastCode) {
    setLastCode(code)
    setClause('')
  }

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const valid = [...files].filter((f) => f.type.startsWith('image/'))
    setPhotos((p) => [...p, ...valid.map((f) => URL.createObjectURL(f))].slice(0, 4))
    setFiles((f) => [...f, ...valid].slice(0, 4))
  }


  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i])
    setPhotos((p) => p.filter((_, j) => j !== i))
    setFiles((f) => f.filter((_, j) => j !== i))
  }
  const canNext = step === 0 ? Boolean(category && contract) : step === 1 ? Boolean(clause && text.trim().length >= 15) : true

  const submit = async () => {
    if (!contract?.apiId) return
    setSending(true)
    setError('')
    const r = await submitReport({ contractId: contract.apiId, category, clause, text, location, photos: files })
    setSending(false)
    if (!r.ok) return setError(r.status === 401 ? 'Masuk dengan akun warga untuk mengirim laporan.' : r.status === 403 ? 'Hanya akun warga terdaftar yang bisa mengirim laporan.' : r.error)
    setTicket({
      id: r.data.kodePelacakan,
      category,
      clause,
      text: text.trim(),
      location: location.trim() || undefined,
      date: r.data.dibuatPada,
      status: 0,
      reporter,
      photos: files.length,
    })
  }
  const restart = () => {
    setStep(0)
    setCategory('')
    setClause('')
    setText('')
    setLocation('')
    setPhotos([])
    setFiles([])
    setError('')
    setAnonymous(true)
    setName('')
    setTicket(null)
  }

  if (ticket) return <ReportTicket ticket={ticket} code={code} onOpen={onOpen} onRestart={restart} />

  return (
    <div className="bg-soft rounded-[2rem] p-24 md:p-40">
      <ol className="flex flex-wrap gap-y-10 gap-x-20 list-none list-outside mb-30 [&_li]:items-center [&_li]:flex [&_li]:text-[1.4rem] [&_li]:gap-8 [&_li]:opacity-[0.5] [&_li>span]:items-center [&_li>span]:border-[0.15rem] [&_li>span]:border-ink [&_li>span]:border-solid [&_li>span]:rounded-[50%] [&_li>span]:flex [&_li>span]:text-[1.2rem] [&_li>span]:h-30 [&_li>span]:justify-center [&_li>span]:w-30 form-steps">
        {formSteps.map((s, i) => (
          <li key={s} className={cn(i === step && '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-ink [.form-steps_li&>span]:text-white [.stepper_li&_button]:bg-white is-current', i < step && '[.auth-steps_li&]:border-blue [.auth-steps_li&]:opacity-[1] [.form-steps_li&]:opacity-[1] [.form-steps_li&>span]:bg-blue [.form-steps_li&>span]:border-blue [.form-steps_li&>span]:text-white [.d-wizard-steps_li&]:text-ink [.d-wizard-steps_li&_span]:bg-ink [.d-wizard-steps_li&_span]:border-ink [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-ink! [.d-lifecycle_li&_span]:bg-ink! [.d-lifecycle_li&_span]:border-ink! [.d-lifecycle_li&_span]:text-white! is-done')}>
            <span>{i < step ? <Check /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="[animation:pop_0.3s_ease-out] grid gap-24">
          <label className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
            <span>Kontrak yang dilaporkan</span>
            <select value={code} onChange={(e) => onCode(e.target.value)}>
              {registry.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="border-0 border-none grid gap-10 [&_legend]:text-[1.3rem] [&_legend]:mb-12 [&_legend]:opacity-[0.7] [&_legend]:uppercase md:grid-cols-[1fr_1fr]">
            <legend>Apa yang janggal?</legend>
            {reportCategories.map(({ title, note }) => (
              <label key={title} className={cn('[&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] bg-white border-[0.2rem] border-transparent border-solid rounded-[1.2rem] cursor-pointer grid gap-4 py-16 px-18 relative [transition:border-color_0.2s,_box-shadow_0.2s] [&_strong]:text-[1.7rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65] [&.is-on]:border-blue [&.is-on]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)] [&:has(input:focus-visible)]:[outline:0.2rem_solid_var(--color-blue)] [&:has(input:focus-visible)]:[outline-offset:0.2rem]', category === title && '[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on')}>
                <input type="radio" name="category" value={title} checked={category === title} onChange={() => setCategory(title)} />
                <strong>{title}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {step === 1 && contract && (
        <div className="[animation:pop_0.3s_ease-out] grid gap-24">
          <label className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
            <span>Pasal yang tidak sesuai</span>
            <select value={clause} onChange={(e) => setClause(e.target.value)}>
              <option value="">Pilih pasal</option>
              {contract.clauses.map((cl, i) => (
                <option key={cl.title} value={cl.title}>
                  Pasal {i + 1}. {cl.title}
                </option>
              ))}
            </select>
            {clause && <small className="text-[1.3rem] leading-[1.45] opacity-[0.65]">{contract.clauses.find((c) => c.title === clause)?.text}</small>}
          </label>
          <label className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
            <span>Ceritakan yang Anda lihat</span>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³."
            />
            <small className="text-[1.3rem] leading-[1.45] opacity-[0.65]">{text.trim().length < 15 ? 'Minimal 15 karakter.' : 'Sudah cukup jelas.'}</small>
          </label>
          <label className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
            <span>Lokasi (opsional)</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jalan Dusun Krajan, dekat masjid" />
          </label>
          <PhotoDrop photos={photos} onFiles={addPhotos} onRemove={removePhoto} />
          <label className="[&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] items-center cursor-pointer flex text-[1.6rem] gap-12 relative w-fit toggle">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span className="bg-[#c9c9c4] rounded-[3rem] flex-none h-26 relative [transition:background_0.3s] w-46 after:bg-white after:rounded-[50%] after:content-[''] after:h-20 after:left-3 after:absolute after:top-3 after:[transition:transform_0.3s_var(--ease-saksi)] after:w-20 [.toggle_input:checked+&]:bg-blue [.toggle_input:checked+&]:after:[transform:translateX(2rem)] [.toggle_input:focus-visible+&]:[outline:0.2rem_solid_var(--color-ink)] [.toggle_input:focus-visible+&]:[outline-offset:0.2rem]" aria-hidden="true" />
            Sembunyikan identitas saya
          </label>
          {!anonymous && (
            <label className="grid gap-8 [&>span]:text-[1.3rem] [&>span]:opacity-[0.7] [&>span]:uppercase [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-transparent [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink [&_select]:text-[1.6rem] [&_select]:[outline:none] [&_select]:py-14 [&_select]:px-16 [&_select]:w-full [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-transparent [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:[outline:none] [&_input]:py-14 [&_input]:px-16 [&_input]:w-full [&_textarea]:bg-white [&_textarea]:border-[0.15rem] [&_textarea]:border-transparent [&_textarea]:border-solid [&_textarea]:rounded-[1.2rem] [&_textarea]:text-ink [&_textarea]:text-[1.6rem] [&_textarea]:[outline:none] [&_textarea]:py-14 [&_textarea]:px-16 [&_textarea]:w-full [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)] [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%] [&_select]:[background-repeat:no-repeat] [&_select]:[background-size:0.55rem_0.55rem] [&_select]:pr-46 [&_select]:text-ellipsis [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_select:focus]:border-blue [&_input:focus]:border-blue [&_textarea:focus]:border-blue [.app_&]:grid [.app_&]:gap-6 [.app_&]:w-full [.app_&>span]:text-[1.25rem] [.app_&>span]:tracking-[0.04em] [.app_&>span]:text-dim [.app_&>span]:uppercase">
              <span>Nama atau sebutan</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Warga RT 03" />
            </label>
          )}
        </div>
      )}

      {step === 2 && contract && (
        <ReportReview
          contract={contract}
          category={category}
          clause={clause}
          text={text}
          location={location}
          photoCount={photos.length}
          reporter={anonymous || !name.trim() ? 'Anonim' : name}
        />
      )}

      {error && <div className="mt-24"><FormAlert>{error}</FormAlert></div>}
      <div className="items-center flex flex-wrap gap-20 justify-between mt-30">
        <button type="button" className="items-center [background:none] border-0 border-none border-b-[0.1rem] border-b-current [border-bottom-style:solid] [color:inherit] inline-flex text-[1.4rem] gap-8 tracking-[0.02em] py-4 px-0 uppercase [transition:color_0.3s,_opacity_0.3s] [&:hover:not(:disabled)]:text-blue [&.light:hover:not(:disabled)]:[color:inherit] [&.light:hover:not(:disabled)]:opacity-[0.7] disabled:cursor-not-allowed disabled:opacity-[0.3] [.hash-actions_&:hover]:[color:inherit] [.hash-actions_&:hover]:opacity-[0.7] [.verify-samples_&]:mt-0 [.verify-samples_&]:mr-24 [.verify-samples_&]:mb-10 [.verify-samples_&]:ml-0 [.hash-status_&]:[grid-column:2] [.hash-status_&]:[justify-self:start] [.d-panel-ink_.verify-samples_&]:mt-0 [.d-panel-ink_.verify-samples_&]:mr-20 [.d-panel-ink_.verify-samples_&]:mb-10 [.d-panel-ink_.verify-samples_&]:ml-0" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Kembali
        </button>
        {step < 2 ? (
          <PillButton tone="blue" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Lanjut
          </PillButton>
        ) : (
          <PillButton tone="blue" onClick={submit} disabled={sending || !contract?.apiId}>
            {sending ? 'Mengirim…' : 'Kirim laporan'}
          </PillButton>
        )}
      </div>
    </div>
  )
}
