import type { SealedContract } from '@/interfaces/contract'

interface Props {
  contract: SealedContract
  category: string
  clause: string
  text: string
  location: string
  photoCount: number
  reporter: string
}

export default function ReportReview({ contract, category, clause, text, location, photoCount, reporter }: Props) {
  return (
    <div className="[animation:pop_0.3s_ease-out] grid gap-24">
      <dl className="[&>div]:border-b-[0.1rem] [&>div]:border-b-[rgba(15,_15,_23,_0.1)] [&>div]:[border-bottom-style:solid] [&>div]:grid [&>div]:gap-4 [&>div]:py-14 [&>div]:px-0 [&_dt]:text-[1.2rem] [&_dt]:opacity-[0.6] [&_dt]:uppercase [&_dd]:text-[1.6rem] [&_dd]:leading-[1.45] md:[&>div]:grid-cols-[14rem_1fr]">
        <div>
          <dt>Kontrak</dt>
          <dd>
            {contract.code} · {contract.title}
          </dd>
        </div>
        <div>
          <dt>Masalah</dt>
          <dd>{category}</dd>
        </div>
        <div>
          <dt>Pasal</dt>
          <dd>{clause}</dd>
        </div>
        <div>
          <dt>Cerita</dt>
          <dd>{text}</dd>
        </div>
        {location && (
          <div>
            <dt>Lokasi</dt>
            <dd>{location}</dd>
          </div>
        )}
        <div>
          <dt>Bukti</dt>
          <dd>{photoCount ? `${photoCount} foto` : 'Tanpa foto'}</dd>
        </div>
        <div>
          <dt>Pelapor</dt>
          <dd>{reporter}</dd>
        </div>
      </dl>
      <p className="text-[1.4rem] leading-[1.5] opacity-[0.7]">Laporan yang merujuk pasal tertentu lebih cepat diverifikasi karena pengawas punya pembanding yang jelas.</p>
    </div>
  )
}
