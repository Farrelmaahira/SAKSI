import { cn } from "@/lib/utils";

interface CategoryOptionProps {
  title: string;
  note: string;
  selected: boolean;
  onPick: () => void;
}

export default function CategoryOption({
  title,
  note,
  selected,
  onPick,
}: CategoryOptionProps) {
  return (
    <label
      className={cn(
        "[&_input]:h-[1px] [&_input]:opacity-[0] [&_input]:pointer-events-none [&_input]:absolute [&_input]:w-[1px] bg-white border-[0.2rem] border-solid rounded-[1.2rem] cursor-pointer grid gap-4 py-16 px-18 relative [transition:border-color_0.2s,_box-shadow_0.2s] [&_strong]:text-[1.7rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65] [&:has(input:focus-visible)]:[outline:0.2rem_solid_var(--color-blue)] [&:has(input:focus-visible)]:[outline-offset:0.2rem]",
        selected
          ? "border-blue [box-shadow:0.4rem_0.4rem_0_var(--color-blue)]"
          : "border-transparent",
      )}
    >
      <input
        type="radio"
        name="category"
        value={title}
        checked={selected}
        onChange={onPick}
      />
      <strong>{title}</strong>
      <small>{note}</small>
    </label>
  );
}
