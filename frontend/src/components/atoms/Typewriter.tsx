"use client";

import { useEffect, useState } from "react";

interface Props {
  text: string;
  speed?: number;
}

export default function Typewriter({ text, speed = 22 }: Props) {
  const [n, setN] = useState(0);
  const [lastText, setLastText] = useState(text);
  if (text !== lastText) {
    setLastText(text);
    setN(0);
  }
  useEffect(() => {
    const t = setInterval(
      () => setN((v) => (v >= text.length ? (clearInterval(t), v) : v + 1)),
      speed,
    );
    return () => clearInterval(t);
  }, [text, speed]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <i className="bg-blue inline-block h-[1.1em] ml-2 opacity-[0] [vertical-align:text-bottom] w-1.5 [.doc-typed.is-writing_&]:[animation:blink_0.8s_steps(1)_infinite] [.doc-typed.is-writing_&]:opacity-[1] [&.is-on]:[animation:blink_0.8s_steps(1)_infinite] [&.is-on]:opacity-[1] [.d-chips_button&]:bg-ink [.d-chips_button&]:border-ink [.d-chips_button&]:text-white [.d-tabs_button&]:border-blue! [.d-tabs_button&]:text-blue! [.d-seg_button&]:bg-white! [.d-seg_button&]:[box-shadow:0_0_0_0.15rem_var(--color-ink)] [.d-wizard-steps_li&]:text-blue! [.d-wizard-steps_li&_span]:bg-blue [.d-wizard-steps_li&_span]:border-blue [.d-wizard-steps_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)] [.d-wizard-steps_li&_span]:text-white [.d-lifecycle_li&]:text-blue! [.d-lifecycle_li&_span]:bg-blue! [.d-lifecycle_li&_span]:border-blue! [.d-lifecycle_li&_span]:[box-shadow:0.2rem_0.2rem_0_var(--color-ink)]! [.d-lifecycle_li&_span]:text-white! [.d-sign_li&]:border-blue! [.d-sign_li&]:[box-shadow:0.4rem_0.4rem_0_var(--color-blue)]! [.d-chips_button&_span]:text-ink-dim! [.app-notif-tabs_button&]:border-blue! [.app-notif-tabs_button&]:text-blue! is-on" />}
    </>
  );
}
