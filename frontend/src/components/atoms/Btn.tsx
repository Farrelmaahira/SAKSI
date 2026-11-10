"use client";

import Icon from "@/components/atoms/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant?: "primary" | "dark" | "ghost" | "danger" | "light";
  icon?: string;
  to?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  small?: boolean;
  id?: string;
  /* accessible name when the visible text alone is ambiguous, e.g. "Hapus" in a list */
  label?: string;
}

const BASE =
  "whitespace-nowrap items-center border-[0.15rem] border-transparent border-solid rounded-[3rem] inline-flex text-[1.4rem] font-[400] gap-8 justify-center leading-[1.2] min-h-44 py-6 px-20 text-center [transition:background_0.2s,_color_0.2s,_border-color_0.2s,_box-shadow_0.2s,_transform_0.2s] [&:hover:not(:disabled)]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)] [&:hover:not(:disabled)]:[transform:translate(-0.1rem,_-0.1rem)] focus-visible:[outline:0.2rem_solid_var(--color-ink)] focus-visible:[outline-offset:0.2rem] disabled:bg-line disabled:border-line disabled:text-dim disabled:cursor-not-allowed [.d-empty_&]:mt-8 [.d-next_&]:[grid-column:1_/_-1] [.d-next_&]:[justify-self:start] [.d-sign_li_&]:[grid-column:2] [.d-sign_li_&]:[justify-self:start] [.d-findings_.sev-kritis_&]:bg-white [.d-findings_.sev-kritis_&]:border-white [.d-findings_.sev-kritis_&]:text-ink [.d-findings_.sev-saran_&]:bg-white! [.d-findings_.sev-saran_&]:border-white! [.d-findings_.sev-saran_&]:text-ink! md:[.d-next_&]:[grid-column:auto] md:[.d-sign_li_&]:[grid-column:auto]";
const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary: "bg-blue text-white",
  dark: "bg-ink text-white [&:hover:not(:disabled)]:[box-shadow:0.3rem_0.3rem_0_var(--color-blue)]",
  ghost: "bg-transparent border-ink text-ink [&:hover:not(:disabled)]:bg-white",
  danger: "bg-red text-white",
  light:
    "bg-white text-blue [.d-next.is-mine_&:hover:not(:disabled)]:[box-shadow:0.3rem_0.3rem_0_var(--color-ink)]",
};
const SMALL = "text-[1.3rem] min-h-36 py-4 px-15";

export default function Btn({
  children,
  variant = "primary",
  icon,
  to,
  onClick,
  type = "button",
  disabled,
  small,
  id,
  label,
}: Props) {
  const cls = cn(BASE, VARIANTS[variant], small && SMALL);
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  );
  if (to)
    return (
      <Link className={cls} href={to}>
        {inner}
      </Link>
    );
  return (
    <button id={id} aria-label={label} className={cls} type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
