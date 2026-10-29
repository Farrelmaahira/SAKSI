import type { SealedContract } from '@/interfaces/contract'

export interface ReportReviewProps {
  contract: SealedContract
  category: string
  clause: string
  text: string
  location: string
  photoCount: number
  reporter: string
}

export default function ReportReview({ contract, category, clause, text, location, photoCount, reporter }: ReportReviewProps) {
  return (
    <div className="form-body">
      <dl className="review">
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
      <p className="form-note">Laporan yang merujuk pasal tertentu lebih cepat diverifikasi karena pengawas punya pembanding yang jelas.</p>
    </div>
  )
}
