"use client";

import type { TabItem } from "@/interfaces/dash";
import { useEffect, useRef } from "react";
import Icon from "@/components/atoms/Icon";

interface Props {
  items: TabItem[];
  value: string;
  onChange: (k: string) => void;
}

export default function Tabs({ items, value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = ref.current;
    const el = bar?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!bar || !el) return;
    const delta =
      el.getBoundingClientRect().left - bar.getBoundingClientRect().left;
    if (delta < 0 || delta + el.offsetWidth > bar.clientWidth)
      bar.scrollLeft = Math.max(0, bar.scrollLeft + delta - 24);
  }, [value]);
  return (
    <div className="border-b-[0.15rem] border-b-line [border-bottom-style:solid] flex gap-4 overflow-x-auto [scrollbar-width:thin] [&_button:first-child]:pl-4 [&_button]:items-center [&_button]:[background:none] [&_button]:border-0 [&_button]:border-none [&_button]:border-b-[0.3rem] [&_button]:border-b-transparent [&_button]:[border-bottom-style:solid] [&_button]:inline-flex [&_button]:flex-none [&_button]:text-[1.45rem] [&_button]:gap-6 [&_button]:-mb-1.5 [&_button]:text-dim [&_button]:pt-12 [&_button]:px-12 [&_button]:pb-11 [&_button]:[transition:border-color_0.2s,_color_0.2s] [&_button]:whitespace-nowrap [&_button:hover]:text-ink d-tabs" role="tablist" ref={ref}>
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          type="button"
          aria-selected={value === t.key}
          className={value === t.key ? "[.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on" : ""}
          onClick={() => onChange(t.key)}
        >
          {t.done && <Icon name="check" className="text-green h-15 w-15" />}
          {t.label}
          {Boolean(t.badge) && <span className="bg-red rounded-[2rem] text-white text-[1.1rem] leading-[1.9rem] min-w-19 py-0 px-5 text-center">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
