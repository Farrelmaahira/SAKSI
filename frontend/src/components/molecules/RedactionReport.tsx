import type { Publication } from '@/interfaces/api'

interface Props {
  published: Publication
}

/* What the privacy filter removed from the text shown to citizens, and the filtered text itself */
export default function RedactionReport({ published }: Props) {
  return (
    <div className="grid gap-8 text-[1.4rem] leading-[1.5]" role="status">
      <p>
        {published.redactedKinds?.length
          ? `Data pribadi yang disaring sebelum tampil: ${published.redactedKinds.map((k) => k.replace(/_/g, ' ')).join(', ')}.`
          : 'Tidak ada data pribadi yang perlu disaring.'}
      </p>
      <details className="bg-soft rounded-[1.2rem] py-12 px-14 [&_summary]:cursor-pointer [&_pre]:font-body [&_pre]:mt-10 [&_pre]:max-h-320 [&_pre]:overflow-auto [&_pre]:whitespace-pre-wrap [&_pre]:text-[1.3rem]">
        <summary>Lihat teks yang tampil untuk warga</summary>
        <pre>{published.isiTersaring}</pre>
      </details>
    </div>
  )
}
