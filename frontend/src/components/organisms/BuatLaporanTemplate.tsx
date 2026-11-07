'use client'

import { useEffect, useState } from 'react'
import { useDash } from '@/hooks/use-dash'
import { useQueryParam } from '@/hooks/use-query-param'
import { reportCategories } from '@/data/report-form'
import type { Report, SealedContract } from '@/interfaces/contract'
import { loadPublicRegistry } from '@/lib/db/load-public-registry'
import { newReportId } from '@/lib/contracts/new-report-id'
import { saveReport } from '@/lib/contracts/save-report'
import { villageById } from '@/lib/master/village-by-id'
import { tokens } from '@/lib/auth/tokens-store'
import { submitCitizenReport } from '@/lib/api/reports'
import NotAllowed from '@/components/molecules/NotAllowed'
import PageHead from '@/components/molecules/PageHead'
import Panel from '@/components/molecules/Panel'
import PhotoDrop from '@/components/molecules/PhotoDrop'
import Empty from '@/components/molecules/Empty'
import Btn from '@/components/atoms/Btn'
import Icon from '@/components/atoms/Icon'

export default function BuatLaporanTemplate() {
  const { session } = useDash()
  const preset = useQueryParam('kontrak')
  const [registry, setRegistry] = useState<SealedContract[]>([])
  const [code, setCode] = useState('')
  const [category, setCategory] = useState('')
  const [clause, setClause] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [rawFiles, setRawFiles] = useState<File[]>([])
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState<Report | null>(null)

  useEffect(() => {
    loadPublicRegistry().then(setRegistry)
  }, [])

  if (session.role.role !== 'warga') return <NotAllowed />

  // Contracts of the citizen's own village come first
  const home = villageById(session.role.villageId)?.name ?? ''
  const contracts = [...registry].sort((a, b) => Number(b.village.includes(home)) - Number(a.village.includes(home)))
  const contract = contracts.find((c) => c.code === (code || preset)) ?? contracts[0]
  const errors = {
    category: category ? '' : 'Pilih jenis kejanggalan.',
    clause: clause ? '' : 'Pilih pasal yang tidak sesuai.',
    text: text.trim().length >= 15 ? '' : 'Ceritakan minimal 15 karakter.',
  }
  const invalid = Object.values(errors).some(Boolean)

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const valid = [...files].filter((f) => f.type.startsWith('image/'))
    const urls = valid.map((f) => URL.createObjectURL(f))
    setPhotos((p) => [...p, ...urls].slice(0, 4))
    setRawFiles((f) => [...f, ...valid].slice(0, 4))
  }

  const removePhoto = (i: number) => {
    URL.revokeObjectURL(photos[i])
    setPhotos((p) => p.filter((_, j) => j !== i))
    setRawFiles((f) => f.filter((_, j) => j !== i))
  }

  const submit = async () => {
    setTried(true)
    if (!contract || invalid) return
    const report: Report = {
      id: newReportId(),
      category,
      clause,
      text: text.trim(),
      location: location.trim() || undefined,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 0,
      // What the public and the village see; the real name is only for BPD and Inspektorat
      reporter: 'Warga terverifikasi',
      reporterName: session.name,
      owner: session.email,
      photos: photos.length,
    }

    // Panggil real backend jika token tersedia
    const userToken = tokens.get().find((t) => t.userId === session.userId)?.token || ''
    if (userToken) {
      const fd = new FormData()
      const cId = parseInt(contract.code.replace(/\D/g, ''), 10) || 1
      fd.append('contractId', String(cId))
      fd.append('kategori', category)
      fd.append('deskripsi', `[${clause}] ${text.trim()}${location ? ' - Lokasi: ' + location.trim() : ''}`)
      for (const file of rawFiles) {
        fd.append('photos', file)
      }
      const backendRes = await submitCitizenReport(fd, userToken)
      if (backendRes && backendRes.kodePelacakan) {
        report.id = backendRes.kodePelacakan
      }
    }

    saveReport(contract.code, report)
    setSent(report)
  }

  const reset = () => {
    setCategory('')
    setClause('')
    setText('')
    setLocation('')
    setPhotos([])
    setTried(false)
    setSent(null)
  }

  if (sent)
    return (
      <>
        <PageHead label="Buat laporan" title="Laporan terkirim" />
        <Panel>
          <Empty
            art="document-ready_o5d5"
            title={`Kode laporan ${sent.id}`}
            text="Kode ini hanya nomor referensi. Pantau status dan tanggapan di Laporan Saya, kami kabari lewat notifikasi."
            action={
              <div className="d-btn-row">
                <Btn to="/dashboard/laporan">Lihat laporan saya</Btn>
                <Btn variant="ghost" onClick={reset}>Buat laporan lain</Btn>
              </div>
            }
          />
        </Panel>
      </>
    )

  return (
    <>
      <PageHead label="Buat laporan" title="Laporkan kejanggalan" desc="Pilih kontrak, ceritakan yang Anda lihat, dan lampirkan foto bila ada." />
      <Panel>
        <form
          className="d-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="d-field">
            <span>Kontrak yang dilaporkan</span>
            <select
              value={contract?.code ?? ''}
              onChange={(e) => {
                setCode(e.target.value)
                setClause('')
              }}
            >
              {contracts.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
          </label>
          <div className="d-form-grid">
            <label className="d-field">
              <span>Apa yang janggal?</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih jenis kejanggalan</option>
                {reportCategories.map((c) => (
                  <option key={c.title} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
              {tried && errors.category && <em className="d-field-error">{errors.category}</em>}
            </label>
            <label className="d-field">
              <span>Pasal yang tidak sesuai</span>
              <select value={clause} onChange={(e) => setClause(e.target.value)}>
                <option value="">Pilih pasal</option>
                {contract?.clauses.map((cl, i) => (
                  <option key={cl.title} value={cl.title}>
                    Pasal {i + 1}. {cl.title}
                  </option>
                ))}
              </select>
              {tried && errors.clause && <em className="d-field-error">{errors.clause}</em>}
            </label>
          </div>
          <label className="d-field">
            <span>Ceritakan yang Anda lihat</span>
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³." />
            {tried && errors.text && <em className="d-field-error">{errors.text}</em>}
          </label>
          <label className="d-field">
            <span>Lokasi (opsional)</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jalan Dusun Krajan, dekat masjid" />
          </label>
          <PhotoDrop photos={photos} onFiles={addPhotos} onRemove={removePhoto} />
          <p className="d-ok">
            <Icon name="shield" />
            Identitas Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan Inspektorat yang dapat melihatnya.
          </p>
          <div className="d-btn-row">
            <Btn type="submit" icon="arrow">Kirim laporan</Btn>
            <Btn to="/dashboard" variant="ghost">Batal</Btn>
          </div>
        </form>
      </Panel>
    </>
  )
}
