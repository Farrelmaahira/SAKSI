import Btn from '@/components/atoms/Btn'
import ErrorText from '@/components/atoms/ErrorText'
import FormAlert from '@/components/atoms/FormAlert'
import Hint from '@/components/atoms/Hint'
import FormField from '@/components/molecules/FormField'
import type { useSpkForm } from '@/hooks/use-spk-form'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  spk: ReturnType<typeof useSpkForm>
}

/* Number and dates of the SPK, with the button to issue or save it */
export default function SpkForm({ c, spk }: Props) {
  const { form } = spk
  return (
    <>
      <div className="grid gap-16 md:grid-cols-[repeat(2,minmax(0,1fr))]">
        <FormField label="Nomor SPK">
          <input value={form.number} onChange={(e) => spk.set({ number: e.target.value })} />
        </FormField>
        <FormField label="Tanggal SPK">
          <input type="date" value={form.date} onChange={(e) => spk.set({ date: e.target.value })} />
        </FormField>
        <FormField label="Mulai bekerja">
          <input type="date" value={form.start} onChange={(e) => spk.set({ start: e.target.value })} />
        </FormField>
        <FormField label="Selesai paling lambat">
          <input type="date" value={form.end} onChange={(e) => spk.set({ end: e.target.value })} />
        </FormField>
      </div>
      {spk.error && <ErrorText as="p">{spk.error}</ErrorText>}
      {spk.serverError && <FormAlert>{spk.serverError}</FormAlert>}
      <div className="items-center flex flex-wrap gap-10">
        <Btn onClick={spk.save} disabled={spk.busy}>{spk.busy ? 'Menyimpan…' : c.spk ? 'Simpan perubahan' : 'Terbitkan SPK'}</Btn>
        {c.spk && <Btn variant="ghost" onClick={spk.cancel}>Batal</Btn>}
      </div>
      {c.status === 'ditandatangani' && <Hint className="text-[1.25rem]">Kontrak belum dipublikasikan. Status berubah menjadi Berjalan setelah publikasi.</Hint>}
    </>
  )
}
