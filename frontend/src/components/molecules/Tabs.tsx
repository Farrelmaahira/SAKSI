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
    <div className="d-tabs" role="tablist" ref={ref}>
      {items.map((t) => (
        <button
          key={t.key}
          role="tab"
          type="button"
          aria-selected={value === t.key}
          className={value === t.key ? "is-on" : ""}
          onClick={() => onChange(t.key)}
        >
          {t.done && <Icon name="check" className="d-tab-check" />}
          {t.label}
          {Boolean(t.badge) && <span className="d-tab-badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
