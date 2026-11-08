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
import { submitCitizenReport, fetchPublicContracts } from '@/lib/api/reports'
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
    let active = true
    async function load() {
      const data = await fetchPublicContracts()
      if (active && data && data.length > 0) {
        const mapped: SealedContract[] = data.map((c) => ({
          code: c.nomor,
          type: c.jenis,
          title: c.judul,
          village: c.villageName || 'Desa Sukamaju',
          first: 'Pemerintah Desa',
          second: c.counterpartyNama || 'Penyedia Rekanan',
          value: c.nilai,
          duration: '60 hari',
          start: '2026-11-06',
          progress: 50,
          clauses: [
            { title: 'Pasal 1 - Lingkup Pekerjaan / Pengadaan', text: 'Ruang lingkup pekerjaan' },
            { title: 'Pasal 2 - Nilai Kontrak dan Pembayaran', text: 'Ketentuan pembayaran' },
            { title: 'Pasal 3 - Waktu Pelaksanaan dan Tenggat', text: 'Tenggat waktu pelaksanaan' },
            { title: 'Pasal 4 - Hak dan Kewajiban', text: 'Hak serta kewajiban para pihak' },
            { title: 'Pasal 5 - Sanksi dan Denda Keterlambatan', text: 'Ketentuan sanksi' },
          ],
          milestones: [],
          reports: [],
          hash: '',
        }))
        setRegistry(mapped)
      } else {
        loadPublicRegistry().then((reg) => {
          if (active) setRegistry(reg)
        })
      }
    }
    load()
    return () => {
      active = false
    }
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
              <div className="items-center flex flex-wrap gap-10">
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
          className="grid gap-16 justify-items-start d-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
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
          <div className="[.d-form>&]:w-full grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Apa yang janggal?</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih jenis kejanggalan</option>
                {reportCategories.map((c) => (
                  <option key={c.title} value={c.title}>
                    {c.title}
                  </option>
                ))}
              </select>
              {tried && errors.category && <em className="text-red text-[1.35rem] not-italic">{errors.category}</em>}
            </label>
            <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
              <span>Pasal yang tidak sesuai</span>
              <select value={clause} onChange={(e) => setClause(e.target.value)}>
                <option value="">Pilih pasal</option>
                {contract?.clauses.map((cl, i) => (
                  <option key={cl.title} value={cl.title}>
                    Pasal {i + 1}. {cl.title}
                  </option>
                ))}
              </select>
              {tried && errors.clause && <em className="text-red text-[1.35rem] not-italic">{errors.clause}</em>}
            </label>
          </div>
          <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
            <span>Ceritakan yang Anda lihat</span>
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³." />
            {tried && errors.text && <em className="text-red text-[1.35rem] not-italic">{errors.text}</em>}
          </label>
          <label className="[.d-form>&]:w-full border-0 border-none grid gap-6 min-w-0 [&>span]:text-[1.25rem] [&>span]:tracking-[0.04em] [&>span]:text-dim [&>span]:uppercase [&>legend]:text-[1.25rem]! [&>legend]:tracking-[0.04em]! [&>legend]:text-dim! [&>legend]:uppercase! [&>legend]:mb-6 [&_input:not([type='range'])]:bg-white [&_input:not([type='range'])]:border-[0.15rem] [&_input:not([type='range'])]:border-[#d6d6d2] [&_input:not([type='range'])]:border-solid [&_input:not([type='range'])]:rounded-[1.2rem] [&_input:not([type='range'])]:text-ink [&_input:not([type='range'])]:text-[1.5rem] [&_input:not([type='range'])]:min-h-48 [&_input:not([type='range'])]:[outline:none] [&_input:not([type='range'])]:py-10 [&_input:not([type='range'])]:px-14 [&_input:not([type='range'])]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input:not([type='range'])]:w-full [&_select]:bg-white [&_select]:border-[0.15rem] [&_select]:border-[#d6d6d2] [&_select]:border-solid [&_select]:rounded-[1.2rem] [&_select]:text-ink! [&_select]:text-[1.5rem]! [&_select]:min-h-48 [&_select]:[outline:none] [&_select]:py-10 [&_select]:px-14 [&_select]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_select]:w-full [&_textarea]:bg-white! [&_textarea]:border-[0.15rem]! [&_textarea]:border-[#d6d6d2]! [&_textarea]:border-solid! [&_textarea]:rounded-[1.2rem]! [&_textarea]:text-ink! [&_textarea]:text-[1.5rem]! [&_textarea]:min-h-48! [&_textarea]:[outline:none]! [&_textarea]:py-10! [&_textarea]:px-14! [&_textarea]:[transition:border-color_0.2s,_box-shadow_0.2s]! [&_textarea]:w-full! [&_textarea]:leading-[1.5] [&_textarea]:resize-y [&_input:focus]:border-blue! [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&_select:focus]:border-blue! [&_select:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_textarea:focus]:border-blue! [&_textarea:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]! [&_input[readonly]]:bg-soft! [&_input[readonly]]:text-dim! [&_input[type='range']]:[accent-color:var(--color-blue)] [&_input[type='range']]:w-full! [&_select]:appearance-none [&_select]:[background-image:linear-gradient(45deg,_transparent_50%,_currentColor_50%),_linear-gradient(135deg,_currentColor_50%,_transparent_50%)]! [&_select]:[background-position:calc(100%_-_2.4rem)_50%,_calc(100%_-_1.9rem)_50%]! [&_select]:[background-repeat:no-repeat]! [&_select]:[background-size:0.55rem_0.55rem]! [&_select]:pr-46! [&_select]:text-ellipsis">
            <span>Lokasi (opsional)</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Contoh: Jalan Dusun Krajan, dekat masjid" />
          </label>
          <PhotoDrop photos={photos} onFiles={addPhotos} onRemove={removePhoto} />
          <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-green text-white [.d-sign_li_&]:[background:none] [.d-sign_li_&]:text-[1.3rem] [.d-sign_li_&]:p-0 [.d-sign_li_&]:text-green [.d-form>&]:w-full d-ok">
            <Icon name="shield" />
            Identitas Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan Inspektorat yang dapat melihatnya.
          </p>
          <div className="items-center flex flex-wrap gap-10">
            <Btn type="submit" icon="arrow">Kirim laporan</Btn>
            <Btn to="/dashboard" variant="ghost">Batal</Btn>
          </div>
        </form>
      </Panel>
    </>
  )
}
