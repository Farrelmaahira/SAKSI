import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HintProps {
  children: ReactNode;
  as?: "p" | "small" | "span";
  className?: string;
}

export default function Hint({
  children,
  as: Tag = "p",
  className,
}: HintProps) {
  return (
    <Tag className={cn("text-[1.4rem] leading-[1.5] text-dim", className)}>
      {children}
    </Tag>
  );
}
