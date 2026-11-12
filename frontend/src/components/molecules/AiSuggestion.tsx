import Pen from "@/components/atoms/Pen";

interface Props {
  suggestion: { title: string; why: string };
  onApply: () => void;
}

/* The AI points at a missing clause and offers to add it */
export default function AiSuggestion({ suggestion, onApply }: Props) {
  return (
    <div className="[animation:pop_0.4s_ease-out] bg-white border-[0.2rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.6rem_0.6rem_0_var(--color-ink)] py-18 px-20 [&>p:not(.ai-tag)]:text-[1.5rem] [&>p:not(.ai-tag)]:leading-[1.45] [&>p:not(.ai-tag)]:mt-8 [&>p:not(.ai-tag)]:mx-0 [&>p:not(.ai-tag)]:mb-14 [&_strong]:font-[500]">
      <p className="items-center text-blue flex text-[1.2rem] font-[500] gap-8 uppercase [&_svg]:[fill:none] [&_svg]:h-16 [&_svg]:[stroke:currentColor] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&_svg]:[stroke-width:1.8] [&_svg]:w-16 ai-tag">
        <Pen />
        Rekomendasi AI
      </p>
      <p>
        Pasal <strong>{suggestion.title}</strong> belum ada. {suggestion.why}
      </p>
      <button
        type="button"
        className="bg-ink border-0 border-none rounded-[3rem] text-white text-[1.3rem] py-9 px-18 uppercase [transition:background_0.3s] [&:hover]:bg-blue"
        onClick={onApply}
      >
        Terapkan
      </button>
    </div>
  );
}
