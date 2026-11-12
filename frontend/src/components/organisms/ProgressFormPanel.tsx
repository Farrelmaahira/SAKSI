import Btn from '@/components/atoms/Btn'
import ErrorText from '@/components/atoms/ErrorText'
import FormAlert from '@/components/atoms/FormAlert'
import FormField from '@/components/molecules/FormField'
import Panel from '@/components/molecules/Panel'
import RangeField from '@/components/molecules/RangeField'
import type { useProgressForm } from '@/hooks/use-progress-form'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  form: ReturnType<typeof useProgressForm>
}

/* "Catat progres": server contracts ask for a term and evidence links, local ones for a percentage and a photo count */
export default function ProgressFormPanel({ c, form: f }: Props) {
  return (
    <Panel title="Catat progres">
      {c.apiId ? (
        <>
          <FormField label="Termin yang diajukan (opsional)">
            <select value={f.termId} onChange={(e) => f.setTermId(e.target.value)}>
              <option value="">Tidak mengajukan termin</option>
              {c.terms
                .filter((x) => !x.paidDate && x.apiId)
                .map((x) => (
                  <option key={x.apiId} value={x.apiId}>
                    {x.label} · {x.percent}%
                  </option>
                ))}
            </select>
          </FormField>
          <FormField label="Tautan foto bukti (https, satu per baris)">
            <textarea rows={2} value={f.links} onChange={(e) => f.setLinks(e.target.value)} placeholder="https://..." />
          </FormField>
        </>
      ) : (
        <RangeField label={`Persentase selesai: ${f.pct}%`} value={f.pct} onChange={f.setPct} />
      )}
      <FormField label="Catatan">
        <textarea rows={3} value={f.note} onChange={(e) => f.setNote(e.target.value)} placeholder="Contoh: Pemasangan pipa ruas 2 selesai, tinggal uji aliran." />
      </FormField>
      <FormField label="Jumlah foto bukti (simulasi)">
        <input type="number" min={0} max={20} value={f.photos} onChange={(e) => f.setPhotos(Number(e.target.value))} />
      </FormField>
      {f.error && <ErrorText as="p">{f.error}</ErrorText>}
      {f.serverError && <FormAlert>{f.serverError}</FormAlert>}
      <Btn onClick={f.save} disabled={f.busy}>{f.busy ? 'Menyimpan…' : 'Simpan progres'}</Btn>
    </Panel>
  )
}
