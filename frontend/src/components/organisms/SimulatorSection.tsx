import { Suspense } from 'react'
import Simulator from './Simulator'

export default function SimulatorSection() {
  return (
    <section className="sim-sec" id="simulasi">
      <div className="container">
        <div className="sim-head">
          <div>
            <p className="label dark">Simulasi</p>
            <h2 className="display-md">Lima langkah, satu kontrak.</h2>
          </div>
          <p className="sim-disclaimer">Semua data di sini contoh. Tidak ada yang dikirim ke mana pun.</p>
        </div>
        {/* The random simulation code must be computed per visit, not at prerender (Cache Components). */}
        <Suspense>
          <Simulator />
        </Suspense>
      </div>
    </section>
  )
}
