import MoneyBundle from '@/components/atoms/MoneyBundle'
import MoneyPile from '@/components/atoms/MoneyPile'

export default function LoreSection() {
  return (
    <section className="lore">
      <div className="container lore-grid">
        <div className="lore-side" data-reveal>
          <MoneyPile />
          <p className="figure">
            <small>Rp</small>609,9<small>T</small>
          </p>
          <p className="caption">Dana desa tersalurkan, 2015 sampai 2024</p>
        </div>
        <div className="lore-center" data-reveal>
          <div className="ring ring-outer" />
          <div className="ring ring-inner" />
          <div className="lore-center-text">
            <p className="figure big">77</p>
            <p className="caption">dari 364 kasus korupsi tahun 2024 terjadi di desa</p>
            <p className="source">Sumber: ICW</p>
          </div>
        </div>
        <div className="lore-side right" data-reveal>
          <MoneyBundle />
          <p className="figure">
            <small>Rp</small>60,57<small>T</small>
          </p>
          <p className="caption">Pagu dana desa tahun 2026</p>
        </div>
      </div>
    </section>
  )
}
