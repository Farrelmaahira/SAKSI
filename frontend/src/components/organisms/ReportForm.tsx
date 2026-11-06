'use client'

import { useState } from 'react'
import Check from '@/components/atoms/Check'
import PillButton from '@/components/atoms/PillButton'
import PhotoDrop from '@/components/molecules/PhotoDrop'
import ReportReview from '@/components/molecules/ReportReview'
import { formSteps, reportCategories } from '@/data/report-form'
import type { Report, SealedContract } from '@/interfaces/contract'
import { getSession } from '@/lib/auth/get-session'
import { newReportId } from '@/lib/contracts/new-report-id'
import { saveReport } from '@/lib/contracts/save-report'
import { cn } from '@/lib/utils'
import ReportTicket from './ReportTicket'

interface Props {
  registry: SealedContract[]
  code: string
  onCode: (code: string) => void
  onSubmitted: (code: string) => void
  onOpen: (code: string) => void
}

export default function ReportForm({ registry, code, onCode, onSubmitted, onOpen }: Props) {
  const [step, setStep] = useState(0)
  const [category, setCategory] = useState('')
  const [clause, setClause] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
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
    const urls = [...files].filter((f) => f.type.startsWith('image/')).map((f) => URL.createObjectURL(f))
    setPhotos((p) => [...p, ...urls].slice(0, 4))
  }

  const canNext = step === 0 ? Boolean(category && contract) : step === 1 ? Boolean(clause && text.trim().length >= 15) : true

  const submit = () => {
    if (!contract) return
    const report: Report = {
      id: newReportId(),
      category,
      clause,
      text: text.trim(),
      location: location.trim() || undefined,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 0,
      reporter,
      photos: photos.length,
      owner: getSession()?.email,
    }
    saveReport(contract.code, report)
    setTicket(report)
    onSubmitted(contract.code)
  }

  const restart = () => {
    setStep(0)
    setCategory('')
    setClause('')
    setText('')
    setLocation('')
    setPhotos([])
    setAnonymous(true)
    setName('')
    setTicket(null)
  }

  if (ticket) return <ReportTicket ticket={ticket} code={code} onOpen={onOpen} onRestart={restart} />

  return (
    <div className="report-card">
      <ol className="form-steps">
        {formSteps.map((s, i) => (
          <li key={s} className={cn(i === step && 'is-current', i < step && 'is-done')}>
            <span>{i < step ? <Check /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="form-body">
          <label className="field">
            <span>Kontrak yang dilaporkan</span>
            <select value={code} onChange={(e) => onCode(e.target.value)}>
              {registry.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="choice-grid">
            <legend>Apa yang janggal?</legend>
            {reportCategories.map(({ title, note }) => (
              <label key={title} className={cn('choice', category === title && 'is-on')}>
                <input type="radio" name="category" value={title} checked={category === title} onChange={() => setCategory(title)} />
                <strong>{title}</strong>
                <small>{note}</small>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {step === 1 && contract && (
        <div className="form-body">
          <label className="field">
            <span>Pasal yang tidak sesuai</span>
            <select value={clause} onChange={(e) => setClause(e.target.value)}>
              <option value="">Pilih pasal</option>
              {contract.clauses.map((cl, i) => (
                <option key={cl.title} value={cl.title}>
                  Pasal {i + 1}. {cl.title}
                </option>
              ))}
            </select>
            {clause && <small className="field-hint">{contract.clauses.find((c) => c.title === clause)?.text}</small>}
          </label>
          <label className="field">
            <span>Ceritakan yang Anda lihat</span>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³."
            />
            <small className="field-hint">{text.trim().length < 15 ? 'Minimal 15 karakter.' : 'Sudah cukup jelas.'}</small>
          </label>
          <label className="field">
            <span>Lokasi (opsional)</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jalan Dusun Krajan, dekat masjid" />
          </label>
          <PhotoDrop photos={photos} onFiles={addPhotos} />
          <label className="toggle">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span className="toggle-track" aria-hidden="true" />
            Sembunyikan identitas saya
          </label>
          {!anonymous && (
            <label className="field">
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

      <div className="form-actions">
        <button type="button" className="text-btn" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          Kembali
        </button>
        {step < 2 ? (
          <PillButton tone="blue" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Lanjut
          </PillButton>
        ) : (
          <PillButton tone="blue" onClick={submit}>
            Kirim laporan
          </PillButton>
        )}
      </div>
    </div>
  )
}
