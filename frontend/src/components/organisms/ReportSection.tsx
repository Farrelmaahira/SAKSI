import type { Ref } from 'react'
import Illustration from '@/components/atoms/Illustration'
import type { SealedContract } from '@/interfaces/contract'
import ReportForm from './ReportForm'

export interface ReportSectionProps {
  ref: Ref<HTMLElement>
  registry: SealedContract[]
  code: string
  onCode: (code: string) => void
  onSubmitted: () => void
  onOpen: (code: string) => void
}

export default function ReportSection({ ref, registry, code, onCode, onSubmitted, onOpen }: ReportSectionProps) {
  return (
    <section className="report-sec" id="lapor" ref={ref}>
      <div className="container report-grid">
        <div className="report-intro">
          <p className="label dark">Lapor</p>
          <h2 className="display-md">Laporkan kejanggalan.</h2>
          <p>Laporan yang baik menyebut pasal yang tidak sesuai, menceritakan apa yang terlihat, dan menyertakan foto bila ada.</p>
          <ol className="report-tips">
            <li>
              <span>01</span>Pilih kontrak dan jenis masalahnya
            </li>
            <li>
              <span>02</span>Tunjuk pasal yang dilanggar
            </li>
            <li>
              <span>03</span>Kirim, lalu pantau dengan nomor tiket
            </li>
          </ol>
          <Illustration name="data-reports_l2u3" />
        </div>
        {registry.length > 0 && code && <ReportForm registry={registry} code={code} onCode={onCode} onSubmitted={onSubmitted} onOpen={onOpen} />}
      </div>
    </section>
  )
}
