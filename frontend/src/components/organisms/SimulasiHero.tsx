import Illustration from '@/components/atoms/Illustration'
import CurvedArrow from '@/components/atoms/CurvedArrow'
import HeroBg from '@/components/atoms/HeroBg'
import PillButton from '@/components/atoms/PillButton'
import Underline from '@/components/atoms/Underline'
import ScrollLink from '@/components/molecules/ScrollLink'

export default function SimulasiHero() {
  return (
    <section className="page-hero">
      <HeroBg />
      <div className="container page-hero-grid">
        <div className="ph-copy">
          <p className="label">Simulasi dan tentang SAKSI</p>
          <h1 className="page-title">
            <span className="title-line">Coba buat kontrak desa,</span> langkah demi{' '}
            <span className="marked">
              langkah.
              <Underline className="hero-underline" />
            </span>
          </h1>
        </div>
        <div className="ph-body">
          <p className="page-lead">
            Tidak perlu paham hukum. Ikuti panduan, seret kartu, dan lihat
            bagaimana SAKSI menjaga kontrak dari draf sampai diawasi warga.
          </p>
          <div className="hero-actions">
            <PillButton href="#simulasi">Mulai simulasi</PillButton>
            <ScrollLink href="#tentang">Tentang SAKSI</ScrollLink>
          </div>
        </div>
        <div className="page-hero-art" aria-hidden="true">
          <p className="art-note">
            5 langkah saja
            <CurvedArrow className="art-note-arrow" />
          </p>
          <Illustration name="contract-signed_vutk" />
        </div>
      </div>
    </section>
  )
}
