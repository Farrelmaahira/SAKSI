import Btn from '@/components/atoms/Btn'
import FormAlert from '@/components/atoms/FormAlert'
import Hint from '@/components/atoms/Hint'
import { pubFieldLabels, pubFields } from '@/data/db'
import type { usePublication } from '@/hooks/use-publication'
import type { DContract } from '@/interfaces/db'

interface Props {
  c: DContract
  pub: ReturnType<typeof usePublication>
}

const CHECK = 'items-start cursor-pointer flex text-[1.45rem] gap-10 leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18'

/* Choose which parts citizens see, confirm nothing private is left, then publish or save */
export default function PublishEditor({ c, pub }: Props) {
  return (
    <>
      <fieldset className="border-0 border-none grid gap-6 [&_legend]:text-[1.25rem] [&_legend]:tracking-[0.04em] [&_legend]:mb-8 [&_legend]:text-dim [&_legend]:uppercase [&_label]:items-start [&_label]:cursor-pointer [&_label]:flex [&_label]:text-[1.45rem]! [&_label]:gap-10 [&_label]:leading-[1.45] [&_input]:[accent-color:var(--color-blue)] [&_input]:flex-none [&_input]:h-18 [&_input]:mt-2 [&_input]:w-18">
        <legend>Bagian yang tampil untuk warga</legend>
        {pubFields.map((f) => (
          <label key={f}>
            <input type="checkbox" checked={pub.fields.includes(f)} onChange={() => pub.toggle(f)} />
            <span>{pubFieldLabels[f]}</span>
          </label>
        ))}
      </fieldset>
      <Hint className="text-[1.25rem]">
        Menyembunyikan bagian hanya mengubah tampilan. Teks resmi dan hash segel tetap sama, sehingga warga masih bisa memeriksa keaslian.
      </Hint>
      <label className={`${CHECK} bg-soft rounded-[1.2rem] py-12 px-14`}>
        <input type="checkbox" checked={pub.confirmed} onChange={(e) => pub.setConfirmed(e.target.checked)} />
        <span>Saya sudah memeriksa bagian yang ditampilkan dan tidak ada data pribadi yang tidak perlu.</span>
      </label>
      <div className="items-center flex flex-wrap gap-10">
        <Btn icon="globe" onClick={pub.publish} disabled={!pub.confirmed || pub.busy}>
          {pub.busy ? 'Menyaring data pribadi…' : c.publication ? 'Simpan perubahan' : 'Publikasikan'}
        </Btn>
        {c.publication && <Btn variant="ghost" onClick={() => pub.setEditing(false)}>Batal</Btn>}
      </div>
      {!c.apiId && !c.publication && <Hint className="text-[1.35rem]">Kontrak ini hanya tersimpan di perangkat ini, belum di server SAKSI, jadi publikasinya juga hanya di perangkat ini.</Hint>}
      {pub.error && (
        <div className="grid gap-10 justify-items-start">
          <FormAlert>{pub.error.text}</FormAlert>
          {pub.error.retry && <Btn variant="ghost" small icon="refresh" onClick={pub.publish} disabled={!pub.confirmed || pub.busy}>Coba lagi</Btn>}
        </div>
      )}
    </>
  )
}
