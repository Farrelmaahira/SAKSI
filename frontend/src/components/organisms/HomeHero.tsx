import HeroBg from '@/components/atoms/HeroBg'
import PillButton from '@/components/atoms/PillButton'
import Underline from '@/components/atoms/Underline'
import ScrollLink from '@/components/molecules/ScrollLink'

export default function HomeHero() {
  return (
    <section className="hero">
      <HeroBg />
      <div className="container hero-grid">
        <div className="hero-text">
          <h1>
            Setiap rupiah dana desa punya{' '}
            <span className="marked">
              saksi.
              <Underline className="hero-underline" />
            </span>
          </h1>
          <p>
            <strong>SAKSI</strong>, Sistem Audit Kontrak Segel Integritas. Sistem kontrak digital untuk pemerintah desa dan UMKM.
          </p>
          <div className="hero-actions">
            <PillButton href="#masalah">Kenapa penting</PillButton>
            <ScrollLink href="#masalah">Scroll</ScrollLink>
          </div>
        </div>
        <a className="photo-credit" href="https://unsplash.com/@akhnaf17_" target="_blank" rel="noreferrer">
          Foto: Akhnaf / Unsplash
        </a>
      </div>
    </section>
  )
}
