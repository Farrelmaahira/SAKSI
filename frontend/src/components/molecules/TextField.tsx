import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function TextField({ label, error, hint, id, ...input }: Props) {
  const msgId = `${id}-msg`;
  return (
    <div className={cn("grid gap-8 [&_label]:text-[1.3rem] [&_label]:opacity-[0.7] [&_label]:uppercase [&_input]:bg-white [&_input]:border-[0.15rem] [&_input]:border-[#d6d6d2] [&_input]:border-solid [&_input]:rounded-[1.2rem] [&_input]:text-ink [&_input]:text-[1.6rem] [&_input]:h-54 [&_input]:[outline:none] [&_input]:py-0 [&_input]:px-16 [&_input]:[transition:border-color_0.2s,_box-shadow_0.2s] [&_input]:w-full [&_input:focus]:border-blue [&_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)] [&.has-error_input]:border-red [&.has-error_input:focus]:[box-shadow:0.3rem_0.3rem_0_var(--color-red)]", error && "has-error")}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? msgId : undefined}
        {...input}
      />
      {(error || hint) && (
        <p id={msgId} className={error ? "text-red text-[1.4rem] leading-[1.4]" : "text-[1.3rem] opacity-[0.6]"}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
