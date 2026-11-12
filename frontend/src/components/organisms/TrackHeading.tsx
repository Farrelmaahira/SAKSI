import Underline from '@/components/atoms/Underline'

/* Label, title and intro of the lacak page; plain markup so the server can render it for search engines. */
export default function TrackHeading() {
  return (
    <>
      <p className="text-white text-[1.4rem] font-[350] tracking-[0.01em] leading-[1.6] mb-30 uppercase [&.dark]:text-blue md:text-[2rem] md:mb-40 [.flow-head_&]:mb-0 [.d-panel-ink_&]:text-[1.3rem] [.d-panel-ink_&]:tracking-[0.06em] [.d-panel-ink_&]:text-ink-dim [.d-panel-ink_&]:uppercase label">Lacak dan lapor</p>
      <h1 className="text-[5rem] font-[320] tracking-[-0.04em] leading-[1] mb-36 md:text-[7.2rem] lg:text-[clamp(7.2rem,_7.4vw,_12rem)] lg:mb-50 page-title">
        <span className="lg:block">Lacak kontrak,</span> laporkan{' '}
        <span className="inline-block relative [.auth-title_&]:whitespace-nowrap [.page-title_&]:whitespace-nowrap">
          kejanggalan.
          <Underline className="bottom-[-0.12em] h-[0.28em] left-[-2%] absolute w-[104%]" />
        </span>
      </h1>
      <p className="text-[rgba(255,_255,_255,_0.85)] text-[1.8rem] leading-[1.5] mb-40 max-w-560 md:text-[2rem]">Masukkan kode kontrak atau hash dokumen. Anda bisa melihat isi kontrak, progres pekerjaan, dan laporan warga lainnya.</p>
    </>
  )
}
