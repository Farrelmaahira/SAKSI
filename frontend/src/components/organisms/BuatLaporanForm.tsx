import Btn from '@/components/atoms/Btn'
import Callout from '@/components/atoms/Callout'
import ErrorText from '@/components/atoms/ErrorText'
import FormAlert from '@/components/atoms/FormAlert'
import FormField from '@/components/molecules/FormField'
import PhotoDrop from '@/components/molecules/PhotoDrop'
import { reportCategories } from '@/data/report-form'
import type { useBuatLaporan } from '@/hooks/use-buat-laporan'

interface Props {
  report: ReturnType<typeof useBuatLaporan>
}

/* The citizen's report form: which contract and clause, what happened, where, and photos */
export default function BuatLaporanForm({ report: r }: Props) {
  const { contract, contracts, detail, fields, errors, tried, photos } = r
  const shown = (field: keyof typeof errors) => (tried ? errors[field] : '')
  return (
    <form
      className="grid gap-16 justify-items-start"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        r.submit()
      }}
    >
      <FormField label="Kontrak yang dilaporkan" className="w-full">
        <select value={contract?.code ?? ''} onChange={(e) => r.pickContract(e.target.value)}>
          {contracts.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.title}
            </option>
          ))}
        </select>
      </FormField>
      <div className="w-full grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <FormField label="Apa yang janggal?" error={shown('category')} className="w-full">
          <select value={fields.category} onChange={(e) => r.set({ category: e.target.value })}>
            <option value="">Pilih jenis kejanggalan</option>
            {reportCategories.map((c) => (
              <option key={c.title} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Pasal yang tidak sesuai" error={shown('clause')} className="w-full">
          <select value={fields.clause} onChange={(e) => r.set({ clause: e.target.value })} disabled={!detail?.ok}>
            <option value="">{!detail ? 'Memuat pasal…' : detail.ok ? 'Pilih pasal' : 'Pasal gagal dimuat'}</option>
            {contract?.clauses.map((cl, i) => (
              <option key={cl.title} value={cl.title}>
                Pasal {i + 1}. {cl.title}
              </option>
            ))}
          </select>
          {detail?.ok === false && <ErrorText role="alert">{detail.error}</ErrorText>}
        </FormField>
      </div>
      <FormField label="Ceritakan yang Anda lihat" error={shown('text')} className="w-full">
        <textarea rows={4} value={fields.text} onChange={(e) => r.set({ text: e.target.value })} placeholder="Contoh: Pasir yang datang hanya setengah truk, padahal di kontrak tertulis 6 m³." />
      </FormField>
      <FormField label="Lokasi (opsional)" className="w-full">
        <input value={fields.location} onChange={(e) => r.set({ location: e.target.value })} placeholder="Contoh: Jalan Dusun Krajan, dekat masjid" />
      </FormField>
      <PhotoDrop photos={photos.urls} onFiles={photos.add} onRemove={photos.remove} />
      <Callout tone="green" icon="shield" className="w-full">
        Identitas Anda tidak ditampilkan ke pemerintah desa. Hanya BPD dan Inspektorat yang dapat melihatnya.
      </Callout>
      {r.sendError && <FormAlert>{r.sendError}</FormAlert>}
      <div className="items-center flex flex-wrap gap-10">
        <Btn type="submit" icon="arrow" disabled={r.sending}>{r.sending ? 'Mengirim…' : 'Kirim laporan'}</Btn>
        <Btn to="/dashboard" variant="ghost">Batal</Btn>
      </div>
    </form>
  )
}
