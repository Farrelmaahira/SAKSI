import Illustration from '@/components/atoms/Illustration'
import CurvedArrow from '@/components/atoms/CurvedArrow'

export default function ThemeSection() {
  return (
    <section className="theme" id="tema">
      <div className="container">
        <div className="theme-head" data-reveal>
          <p className="label">Tema</p>
          <h2 className="display">Satu kontrak, dua peran.</h2>
        </div>
        <div className="theme-grid" data-reveal>
          <article>
            <p className="theme-kicker">Public Service Tracking</p>
            <p className="theme-role">Patokan pelacakan</p>
            <p>Volume, nilai, dan tenggat di dalam kontrak menjadi acuan untuk membandingkan progres di lapangan.</p>
          </article>
          <div className="theme-center">
            <CurvedArrow className="theme-arrow left" />
            <div className="theme-circle">
              <Illustration name="contract-signed_vutk" alt="Ilustrasi kontrak yang telah ditandatangani" />
            </div>
            <CurvedArrow className="theme-arrow right" />
          </div>
          <article>
            <p className="theme-kicker">Civic Reporting &amp; Accountability</p>
            <p className="theme-role">Bukti laporan</p>
            <p>Laporan warga merujuk pada pasal yang jelas, sehingga pengawas punya dasar untuk menindaklanjuti.</p>
          </article>
        </div>
      </div>
    </section>
  )
}
