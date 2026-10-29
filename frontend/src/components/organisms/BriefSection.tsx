import Loop from "@/components/atoms/Loop";

export default function BriefSection() {
  return (
    <section className="brief" id="masalah">
      <div className="container narrow" data-reveal>
        <p className="label">Masalahnya</p>
        <p className="brief-text">
          Kontrak yang tidak jelas membuka ruang{" "}
          <span className="marked">
            penyimpangan.
            <Loop className="brief-loop" />
          </span>{" "}
          <span className="dim">
            Dana desa terus mengalir, sementara isi perjanjiannya jarang bisa
            diperiksa.
          </span>
        </p>
      </div>
    </section>
  );
}
