import MoneyBundle from '@/components/atoms/MoneyBundle'
import MoneyPile from '@/components/atoms/MoneyPile'

export default function LoreSection() {
  return (
    <section className="bg-deep text-white overflow-hidden py-100 px-0 lg:py-160 lg:px-0">
      <div className="my-0 mx-auto max-w-1680 py-0 px-20 relative w-full md:py-0 md:px-40 lg:py-0 lg:px-80 items-center grid gap-60 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-30 [.auth>&]:relative [.auth>&]:z-1 [.page-hero>&]:relative [.page-hero>&]:z-1 container">
        <div className="[container-type:inline-size] min-w-0 text-center md:text-left md:[&.right]:text-right lore-side" data-reveal>
          <MoneyPile />
          <p className="text-[6rem] font-[300] tracking-[-0.04em] leading-[1] mb-15 [&_small]:text-[0.4em] [&_small]:tracking-[0] [&_small]:my-0 [&_small]:mx-[0.15em] [&_small]:opacity-[0.8] [&.big]:text-[9rem] md:[.lore-side_&]:text-[length:min(9rem,_26cqi)] lg:[&.big]:text-[18rem]">
            <small>Rp</small>609,9<small>T</small>
          </p>
          <p className="text-[rgba(255,_255,_255,_0.8)] text-[1.6rem] leading-[1.4] max-w-260 [.lore-center-text_&]:my-0 [.lore-center-text_&]:mx-auto [.lore-center-text_&]:max-w-160 [.lore-side_&]:my-0 [.lore-side_&]:mx-auto md:[.lore-side_&]:m-0 md:[.lore-side.right_&]:ml-auto lg:text-[2rem] lg:[.lore-center-text_&]:max-w-260">Dana desa tersalurkan, 2015 sampai 2024</p>
        </div>
        <div className="items-center aspect-[1] flex justify-center my-0 mx-auto relative w-320 lg:w-[min(62rem,_40vw)]" data-reveal>
          <div className="rounded-[50%] absolute border-[0.1rem] border-[rgba(255,_255,_255,_0.2)] border-solid inset-0 ring" />
          <div className="rounded-[50%] absolute bg-blue border-[0.1rem] border-[rgba(255,_255,_255,_0.8)] border-solid inset-[17%] ring" />
          <div className="relative text-center lore-center-text">
            <p className="text-[6rem] font-[300] tracking-[-0.04em] leading-[1] mb-15 [&_small]:text-[0.4em] [&_small]:tracking-[0] [&_small]:my-0 [&_small]:mx-[0.15em] [&_small]:opacity-[0.8] [&.big]:text-[9rem] md:[.lore-side_&]:text-[length:min(9rem,_26cqi)] lg:[&.big]:text-[18rem] big">77</p>
            <p className="text-[rgba(255,_255,_255,_0.8)] text-[1.6rem] leading-[1.4] max-w-260 [.lore-center-text_&]:my-0 [.lore-center-text_&]:mx-auto [.lore-center-text_&]:max-w-160 [.lore-side_&]:my-0 [.lore-side_&]:mx-auto md:[.lore-side_&]:m-0 md:[.lore-side.right_&]:ml-auto lg:text-[2rem] lg:[.lore-center-text_&]:max-w-260">dari 364 kasus korupsi tahun 2024 terjadi di desa</p>
            <p className="text-[1.2rem] mt-15 opacity-[0.6] uppercase">Sumber: ICW</p>
          </div>
        </div>
        <div className="[container-type:inline-size] min-w-0 text-center md:text-left md:[&.right]:text-right right lore-side" data-reveal>
          <MoneyBundle />
          <p className="text-[6rem] font-[300] tracking-[-0.04em] leading-[1] mb-15 [&_small]:text-[0.4em] [&_small]:tracking-[0] [&_small]:my-0 [&_small]:mx-[0.15em] [&_small]:opacity-[0.8] [&.big]:text-[9rem] md:[.lore-side_&]:text-[length:min(9rem,_26cqi)] lg:[&.big]:text-[18rem]">
            <small>Rp</small>60,57<small>T</small>
          </p>
          <p className="text-[rgba(255,_255,_255,_0.8)] text-[1.6rem] leading-[1.4] max-w-260 [.lore-center-text_&]:my-0 [.lore-center-text_&]:mx-auto [.lore-center-text_&]:max-w-160 [.lore-side_&]:my-0 [.lore-side_&]:mx-auto md:[.lore-side_&]:m-0 md:[.lore-side.right_&]:ml-auto lg:text-[2rem] lg:[.lore-center-text_&]:max-w-260">Pagu dana desa tahun 2026</p>
        </div>
      </div>
    </section>
  )
}
