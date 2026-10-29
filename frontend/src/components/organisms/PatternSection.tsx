import Illustration from '@/components/atoms/Illustration'
import CurvedArrow from '@/components/atoms/CurvedArrow'

export default function PatternSection() {
  return (
    <section className="pattern">
      <div className="container pattern-grid">
        <div data-reveal>
          <p className="label dark">Catatan KPK</p>
          <h2 className="display">Modusnya berulang.</h2>
        </div>
        <ol className="pattern-list" data-reveal>
          <li>
            <span>01</span>Penggelembungan anggaran
          </li>
          <li>
            <span>02</span>Proyek fiktif
          </li>
          <li>
            <span>03</span>Laporan tidak sesuai kondisi lapangan
          </li>
          <li className="gap">
            <span>!</span>Belum ada sistem yang khusus mengurus kontrak desa
          </li>
        </ol>
      </div>

      <div className="container">
        <div className="research" data-reveal>
          <div className="research-art">
            <Illustration name="document-warning_2es6" />
          </div>
          <div className="research-copy">
            <p className="label dark">Riset Olken, 2007</p>
            <p className="research-figure">
              <CurvedArrow className="research-arrow" />
              8<span>poin persen</span>
            </p>
            <p className="research-text">Penurunan dana yang hilang ketika audit dilakukan secara menyeluruh. Pengawasan yang rapi terbukti berpengaruh.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
