import Badge from "@/components/atoms/Badge";
import type { Counterparty } from "@/interfaces/master";
import { cn } from "@/lib/utils";

interface PartyOptionProps {
  party: Counterparty;
  selected: boolean;
  onPick: () => void;
}

export default function PartyOption({
  party,
  selected,
  onPick,
}: PartyOptionProps) {
  return (
    <label
      onClick={onPick}
      className={cn(
        "items-center border-[0.15rem] border-solid rounded-[1.4rem] cursor-pointer grid gap-12 grid-cols-[auto_minmax(0,1fr)_auto] py-12 px-14 [transition:border-color_0.2s,_box-shadow_0.2s] [&_input]:[accent-color:var(--color-blue)] [&_input]:h-18 [&_input]:w-18 [&_span]:grid [&_span]:gap-2 [&_span]:min-w-0 [&_strong]:font-[420] [&_small]:text-[1.25rem] [&_small]:text-dim [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap",
        selected
          ? "border-blue [box-shadow:0.3rem_0.3rem_0_var(--color-blue)]"
          : "border-[#dcdcd8] [&:hover]:border-ink",
      )}
    >
      <input
        type="radio"
        name="party"
        value={party.id}
        checked={selected}
        onChange={onPick}
      />
      <span>
        <strong>{party.name}</strong>
        <small>
          {[party.type, party.contact, party.email].filter(Boolean).join(" · ")}
        </small>
      </span>
      {party.invited && <Badge tone="tint">Diundang</Badge>}
    </label>
  );
}
