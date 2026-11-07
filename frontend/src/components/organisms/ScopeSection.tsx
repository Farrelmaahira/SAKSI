import ScopeFolders from "./ScopeFolders";

export default function ScopeSection() {
  return (
    <section className="scope" id="cakupan">
      <div className="container">
        <div className="scope-head" data-reveal>
          <p className="label dark">Cakupan</p>
          <h2 className="display" data-split>Empat jenis kontrak desa.</h2>
          <p className="scope-intro">
            Setiap jenis punya pasal wajibnya sendiri. Saat ada yang terlewat,
            AI memberi rekomendasi dan menuliskannya ke dalam draf.
          </p>
        </div>
        <ScopeFolders />
      </div>
    </section>
  );
}
