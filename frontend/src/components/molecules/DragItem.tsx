"use client";

import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
  onPick?: () => void;
  disabled?: boolean;
}

export default function DragItem({
  id,
  children,
  className,
  onPick,
  disabled,
}: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled,
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn("items-center bg-white border-[0.15rem] border-ink border-solid rounded-[1.4rem] [box-shadow:0.4rem_0.4rem_0_var(--color-ink)] text-ink cursor-grab flex gap-12 py-14 px-16 text-left [touch-action:manipulation] [transition:transform_0.2s,_box-shadow_0.2s,_opacity_0.2s] w-full [&:hover:not(:disabled)]:[box-shadow:0.6rem_0.6rem_0_var(--color-ink)] [&:hover:not(:disabled)]:[transform:translate(-0.2rem,_-0.2rem)] active:cursor-grabbing [&.is-dragging]:opacity-[0.3] disabled:[box-shadow:none] disabled:cursor-default disabled:opacity-[0.35] disabled:[transform:none] [&.is-used]:[box-shadow:none] [&.is-used]:cursor-default [&.is-used]:opacity-[0.35] [&.is-used]:[transform:none] [&.is-overlay]:[box-shadow:0.8rem_0.8rem_0_var(--color-blue)] [&.is-overlay]:cursor-grabbing [&.is-overlay]:[transform:rotate(-2deg)]", className, isDragging && "is-dragging")}
      {...attributes}
      {...listeners}
      onClick={onPick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
