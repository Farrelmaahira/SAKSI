import CategoryOption from "@/components/molecules/CategoryOption";
import ReportField from "@/components/molecules/ReportField";
import { reportCategories } from "@/data/report-form";
import type { SealedContract } from "@/interfaces/contract";

interface Props {
  registry: SealedContract[];
  code: string;
  category: string;
  onCode: (code: string) => void;
  onCategory: (title: string) => void;
}

export default function ReportStepIssue({
  registry,
  code,
  category,
  onCode,
  onCategory,
}: Props) {
  return (
    <div className="[animation:pop_0.3s_ease-out] grid gap-24">
      <ReportField label="Kontrak yang dilaporkan">
        <select value={code} onChange={(e) => onCode(e.target.value)}>
          {registry.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.title}
            </option>
          ))}
        </select>
      </ReportField>
      <fieldset className="border-0 border-none grid gap-10 [&_legend]:text-[1.3rem] [&_legend]:mb-12 [&_legend]:opacity-[0.7] [&_legend]:uppercase md:grid-cols-[1fr_1fr]">
        <legend>Apa yang janggal?</legend>
        {reportCategories.map(({ title, note }) => (
          <CategoryOption
            key={title}
            title={title}
            note={note}
            selected={category === title}
            onPick={() => onCategory(title)}
          />
        ))}
      </fieldset>
    </div>
  );
}
