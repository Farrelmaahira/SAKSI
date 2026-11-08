import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  children: string;
  tone?: "light" | "blue" | "ink";
  to?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const TONES = {
  light: "items-center border-[0.1rem] border-solid rounded-[6rem] inline-flex text-[1.4rem] font-[400] h-50 justify-center min-w-160 overflow-hidden py-0 px-25 relative uppercase [transition:color_0.6s_var(--ease-saksi),_border-color_0.6s_var(--ease-saksi)] [&:hover]:border-ink md:text-[1.6rem] md:h-60 md:min-w-200 [.navbar-right_&]:hidden lg:[.navbar-right_&]:inline-flex disabled:cursor-not-allowed disabled:opacity-[0.3] [.auth-form_&]:mt-8 [.auth-form_&]:w-full [.auth-actions_&]:flex-1 [.auth-actions_&]:mt-0! [.auth-actions_&]:max-w-280 [.auth-actions.is-end_&]:max-w-none [.hash-panel_&]:self-start bg-white border-white text-blue",
  blue: "items-center border-[0.1rem] border-solid rounded-[6rem] inline-flex text-[1.4rem] font-[400] h-50 justify-center min-w-160 overflow-hidden py-0 px-25 relative uppercase [transition:color_0.6s_var(--ease-saksi),_border-color_0.6s_var(--ease-saksi)] [&:hover]:border-ink md:text-[1.6rem] md:h-60 md:min-w-200 [.navbar-right_&]:hidden lg:[.navbar-right_&]:inline-flex disabled:cursor-not-allowed disabled:opacity-[0.3] [.auth-form_&]:mt-8 [.auth-form_&]:w-full [.auth-actions_&]:flex-1 [.auth-actions_&]:mt-0! [.auth-actions_&]:max-w-280 [.auth-actions.is-end_&]:max-w-none [.hash-panel_&]:self-start bg-blue border-blue text-white",
  ink: "items-center border-[0.1rem] border-current border-solid rounded-[6rem] inline-flex text-[1.4rem] font-[400] h-50 justify-center min-w-160 overflow-hidden py-0 px-25 relative uppercase [transition:color_0.6s_var(--ease-saksi),_border-color_0.6s_var(--ease-saksi)] [&:hover]:border-ink md:text-[1.6rem] md:h-60 md:min-w-200 [.navbar-right_&]:hidden lg:[.navbar-right_&]:inline-flex disabled:cursor-not-allowed disabled:opacity-[0.3] [.auth-form_&]:mt-8 [.auth-form_&]:w-full [.auth-actions_&]:flex-1 [.auth-actions_&]:mt-0! [.auth-actions_&]:max-w-280 [.auth-actions.is-end_&]:max-w-none [.hash-panel_&]:self-start",
};

export default function PillButton({
  children,
  tone = "light",
  to,
  href,
  onClick,
  type = "button",
  disabled,
}: Props) {
  const inner: ReactNode = (
    <>
      <span className="bg-ink inset-0 absolute [transform:scaleY(0)] [transform-origin:bottom_center] [transition:transform_0.6s_var(--ease-saksi)] [.pill:hover_&]:[transform:scaleY(1)] [.pill:disabled_&]:[transform:none]!" />
      <span className="block h-[1.2em] leading-[1.2em] overflow-hidden relative">
        <span className="flex flex-col [transition:transform_0.6s_var(--ease-saksi)] [&_span:last-child]:text-white [.pill:hover_&]:[transform:translateY(-50%)] [.pill:disabled_&]:[transform:none]!">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
      </span>
    </>
  );
  const className = `pill ${TONES[tone]}`;
  if (to)
    return (
      <Link className={className} href={to}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a className={className} href={href}>
        {inner}
      </a>
    );
  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {inner}
    </button>
  );
}
