import ScopeFolders from "./ScopeFolders";

export default function ScopeSection() {
  return (
    <section className="bg-white py-120 px-0 lg:pt-180 lg:px-0 lg:pb-0" id="cakupan">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="mb-80 max-w-1300 lg:mb-120">
          <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 dark [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Cakupan</p>
          <h2 className="text-[5.2rem] font-[320] tracking-[-0.04em] leading-[1] md:text-[8rem] lg:text-[12rem]">Empat jenis kontrak desa.</h2>
          <p className="text-[1.8rem] leading-[1.5] mt-30 max-w-600 lg:text-[2.4rem]">
            Setiap jenis punya pasal wajibnya sendiri. Saat ada yang terlewat,
            AI memberi rekomendasi dan menuliskannya ke dalam draf.
          </p>
        </div>
        <ScopeFolders />
      </div>
    </section>
  );
}
