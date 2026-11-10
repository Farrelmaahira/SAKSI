import Grip from "@/components/atoms/Grip";
import { clauses, distractor, signItems, types } from "@/data/simulator";
import TypeCardBody from "./TypeCardBody";

interface Props {
  id: string | null;
}

export default function DragPreview({ id }: Props) {
  if (!id) return null;
  const t = types.find((x) => x.id === id);
  if (t)
    return (
      <div className="is-overlay items-center bg-white border-[0.15rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.4rem_0.4rem_0_var(--color-ink)] text-ink cursor-grab flex gap-12 py-14 px-16 text-left [touch-action:manipulation] [transition:transform_0.2s,_box-shadow_0.2s,_opacity_0.2s] w-full [&:hover:not(:disabled)]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&:hover:not(:disabled)]:[transform:translate(-0.2rem,_-0.2rem)] active:cursor-grabbing [&.is-dragging]:opacity-[0.3] disabled:[box-shadow:none] disabled:cursor-default disabled:opacity-[0.35] disabled:[transform:none] [&.is-used]:[box-shadow:none] [&.is-used]:cursor-default [&.is-used]:opacity-[0.35] [&.is-used]:[transform:none] [&.is-overlay]:[box-shadow:0.8rem_0.8rem_0_var(--color-blue)] [&.is-overlay]:cursor-grabbing [&.is-overlay]:[transform:rotate(-2deg)] [&_strong]:block [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_small]:text-[1.3rem] [&_small]:opacity-[0.65]">
        <TypeCardBody option={t} />
      </div>
    );
  const c = [...clauses, distractor].find((x) => x.id === id);
  if (c)
    return (
      <div className="is-overlay items-center bg-white border-[0.15rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.4rem_0.4rem_0_var(--color-ink)] text-ink cursor-grab flex gap-12 text-left [touch-action:manipulation] [transition:transform_0.2s,_box-shadow_0.2s,_opacity_0.2s] [&:hover:not(:disabled)]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&:hover:not(:disabled)]:[transform:translate(-0.2rem,_-0.2rem)] active:cursor-grabbing [&.is-dragging]:opacity-[0.3] disabled:[box-shadow:none] disabled:cursor-default disabled:opacity-[0.35] disabled:[transform:none] [&.is-used]:[box-shadow:none] [&.is-used]:cursor-default [&.is-used]:opacity-[0.35] [&.is-used]:[transform:none] [&.is-overlay]:[box-shadow:0.8rem_0.8rem_0_var(--color-blue)] [&.is-overlay]:cursor-grabbing [&.is-overlay]:[transform:rotate(-2deg)] text-[1.5rem] py-10 px-14 w-auto">
        <Grip />
        {c.title}
      </div>
    );
  const s = signItems.find((x) => x.id === id);
  if (s)
    return (
      <div className="is-overlay items-center bg-white border-[0.15rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.4rem_0.4rem_0_var(--color-ink)] text-ink cursor-grab flex gap-12 py-14 px-16 text-left [touch-action:manipulation] [transition:transform_0.2s,_box-shadow_0.2s,_opacity_0.2s] w-full [&:hover:not(:disabled)]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&:hover:not(:disabled)]:[transform:translate(-0.2rem,_-0.2rem)] active:cursor-grabbing [&.is-dragging]:opacity-[0.3] disabled:[box-shadow:none] disabled:cursor-default disabled:opacity-[0.35] disabled:[transform:none] [&.is-used]:[box-shadow:none] [&.is-used]:cursor-default [&.is-used]:opacity-[0.35] [&.is-used]:[transform:none] [&.is-overlay]:[box-shadow:0.8rem_0.8rem_0_var(--color-blue)] [&.is-overlay]:cursor-grabbing [&.is-overlay]:[transform:rotate(-2deg)] text-[1.5rem] sign-chip">
        <Grip />
        {s.label}
      </div>
    );
  return null;
}
