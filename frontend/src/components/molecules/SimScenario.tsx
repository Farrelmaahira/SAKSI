import Illustration from '@/components/atoms/Illustration'
import { BASE_VALUE } from '@/data/simulator'
import { formatRp } from '@/lib/contracts/format-rp'

export default function SimScenario() {
  return (
    <div className="scenario">
      <Illustration name="village-hero" />
      <div>
        <p className="scenario-label">Skenario</p>
        <p className="scenario-text">
          Desa Sukamaju akan membeli 40 sak semen dan 6 m³ pasir dari CV Maju Bersama untuk memperbaiki jalan Dusun Krajan. Nilainya {formatRp(BASE_VALUE)}.
        </p>
      </div>
    </div>
  )
}
