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
      className={cn("drag-item", className, isDragging && "is-dragging")}
      {...attributes}
      {...listeners}
      onClick={onPick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
