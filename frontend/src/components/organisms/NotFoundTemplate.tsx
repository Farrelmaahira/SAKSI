import HeroBg from '@/components/atoms/HeroBg'
import PillButton from '@/components/atoms/PillButton'

export default function NotFoundTemplate() {
  return (
    <main>
      <section className="page-hero">
        <HeroBg />
        <div className="container">
          <p className="label">404</p>
          <h1 className="page-title">Halaman ini tidak ada di arsip.</h1>
          <PillButton to="/">Kembali ke beranda</PillButton>
        </div>
      </section>
    </main>
  )
}
