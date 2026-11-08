import type { CSSProperties } from "react";
import FolderPenIcon from "@/components/atoms/FolderPenIcon";
import type { ScopeFolderItem } from "@/interfaces/content";

interface Props {
  folder: ScopeFolderItem;
  index: number;
}

const FOLDERS = [
  "[--folder:var(--color-blue)] [--folder-ink:var(--color-white)]",
  "[--folder:var(--color-soft)] [--folder-ink:var(--color-ink)]",
  "[--folder:var(--color-deep)] [--folder-ink:var(--color-white)]",
  "[--folder:var(--color-ink)] [--folder-ink:var(--color-white)]",
];

export default function ScopeFolder({ folder: f, index: i }: Props) {
  return (
    <article
      className={`mb-[14vh] sticky top-70 lg:top-110 ${FOLDERS[i]} folder folder-${i + 1}`}
      style={{ "--i": i } as CSSProperties}
    >
      <div className="flex flex-col h-full relative folder-sheet">
        <div className="items-center [background:var(--folder)] rounded-[1.4rem_1.4rem_0_0] [color:var(--folder-ink)] inline-flex text-[1.4rem] gap-10 h-46 self-start ml-[calc(var(--i)_*_22%)] py-0 px-22 relative uppercase select-none after:[background:var(--folder)] after:rounded-tr-[1.2rem] after:bottom-0 after:content-[''] after:h-full after:absolute after:-right-16 after:[transform:skewX(28deg)] after:w-32 after:-z-1 [&_b]:hidden [&_b]:font-[400] md:text-[1.5rem] md:h-54 md:py-0 md:px-30 md:[&_b]:inline">
          <span>0{i + 1}</span>
          <b>{f.title}</b>
        </div>
        <div className="[background:var(--folder)] rounded-[0_2rem_2rem_2rem] [color:var(--folder-ink)] grid flex-1 gap-36 pt-34 px-24 pb-30 relative [.folder:not(.folder-1)_&]:rounded-tl-[2rem] md:p-50 lg:items-center lg:gap-80 lg:grid-cols-[0.85fr_1.15fr] lg:min-h-[min(68svh,_72rem)] lg:py-70 lg:px-80">
          <div className="[&_h3]:text-[4.4rem] [&_h3]:font-[320] [&_h3]:tracking-[-0.04em] [&_h3]:leading-[1] [&_h3]:mb-16 [&>p:last-child]:text-[1.7rem] [&>p:last-child]:leading-[1.45] [&>p:last-child]:opacity-[0.8] md:[&_h3]:text-[7rem] lg:[&_h3]:text-[9rem] lg:[&>p:last-child]:text-[2.4rem]">
            <p className="text-[1.3rem] mb-16 opacity-[0.7] uppercase">Kontrak 0{i + 1}</p>
            <h3>{f.title}</h3>
            <p>{f.note}</p>
          </div>

          <div className="pb-90 relative max-md:pb-6">
            <div className="bg-white rounded-[1.2rem] text-ink max-w-620 p-22 md:p-30 lg:p-36 doc">
              <div className="items-center flex text-[1.15rem] gap-10 justify-between mb-16 uppercase lg:text-[1.3rem]">
                <span>{f.doc}</span>
                <span className="border-[0.1rem] border-ink border-solid rounded-[3rem] flex-none py-3 px-10 [&_em]:not-italic [&_em:last-child]:hidden [&.is-done_em:first-child]:hidden [&.is-done]:bg-blue [&.is-done]:border-blue [&.is-done]:text-white [&.is-done_em:last-child]:inline! doc-status">
                  <em>Draf</em>
                  <em>Pasal ditambahkan</em>
                </span>
              </div>
              <p className="text-[1.25rem] font-[500] mt-14 mx-0 mb-8 [&.strong]:text-blue max-md:[.doc_&:first-of-type]:hidden max-md:[.doc_&:nth-of-type(2)]:hidden! lg:text-[1.4rem]">Pasal 1. Para Pihak</p>
              <span className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-7 max-md:[.doc_&:nth-of-type(-n_+_4)]:hidden doc-bar" style={{ width: "92%" }} />
              <span className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-7 max-md:[.doc_&:nth-of-type(-n_+_4)]:hidden doc-bar" style={{ width: "74%" }} />
              <p className="text-[1.25rem] font-[500] mt-14 mx-0 mb-8 [&.strong]:text-blue max-md:[.doc_&:first-of-type]:hidden max-md:[.doc_&:nth-of-type(2)]:hidden! lg:text-[1.4rem]">Pasal 2. Objek Perjanjian</p>
              <span className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-7 max-md:[.doc_&:nth-of-type(-n_+_4)]:hidden doc-bar" style={{ width: "86%" }} />
              <span className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-7 max-md:[.doc_&:nth-of-type(-n_+_4)]:hidden doc-bar" style={{ width: "58%" }} />
              <p className="text-[1.25rem] font-[500] mt-14 mx-0 mb-8 [&.strong]:text-blue max-md:[.doc_&:first-of-type]:hidden max-md:[.doc_&:nth-of-type(2)]:hidden! lg:text-[1.4rem] strong">{f.clause}</p>
              <p className="text-blue text-[1.45rem] leading-[1.5] mb-10 min-h-[4.5em] relative lg:text-[1.7rem] doc-typed">
                <svg
                  className="[fill:none] overflow-visible pointer-events-none [stroke:currentColor] [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:3] [&_path]:[vector-effect:non-scaling-stroke] text-blue h-full -left-15 absolute top-0 w-10 [&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:0] margin-mark"
                  viewBox="0 0 12 60"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    pathLength={1}
                    d="M7 2c-3 8 2 14-1 22s3 15 0 24c-1 4 0 7 1 10"
                  />
                </svg>
                <span className="typed" data-text={f.text}>
                  {f.text}
                </span>
                <i className="bg-blue inline-block h-[1.1em] ml-2 opacity-[0] [vertical-align:text-bottom] w-1.5 [.doc-typed.is-writing_&]:[animation:blink_0.8s_steps(1)_infinite] [.doc-typed.is-writing_&]:opacity-[1] [&.is-on]:[animation:blink_0.8s_steps(1)_infinite] [&.is-on]:opacity-[1]" />
              </p>
              <span className="bg-[#e3e3e0] rounded-[0.4rem] block h-7 mb-7 max-md:[.doc_&:nth-of-type(-n_+_4)]:hidden doc-bar" style={{ width: "66%" }} />
            </div>

            <div className="bg-white border-[0.2rem] border-ink border-solid rounded-[1.2rem] bottom-0 [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] text-ink py-16 px-18 absolute right-0 w-[min(30rem,_86%)] z-2 [.folder-4_&]:[box-shadow:0.6rem_0.6rem_0_var(--color-blue)] max-md:-mt-14 max-md:mr-0 max-md:mb-0 max-md:ml-auto max-md:relative max-md:w-[90%] md:-right-10 md:w-320 lg:py-20 lg:px-24 lg:-right-20 lg:w-380 ai-card">
              <p className="items-center text-blue flex text-[1.2rem] font-[500] gap-8 uppercase [&_svg]:[fill:none] [&_svg]:h-16 [&_svg]:[stroke:currentColor] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:[stroke-width:1.8] [&_svg]:w-16 ai-tag">
                <FolderPenIcon />
                Rekomendasi AI
              </p>
              <p className="text-[1.45rem] leading-[1.4] mt-8 mx-0 mb-14 lg:text-[1.7rem]">{f.suggestion}</p>
              <span className="border-[0.1rem] border-ink border-solid rounded-[3rem] inline-block text-[1.15rem] py-5 px-14 uppercase ai-apply">Terapkan</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
