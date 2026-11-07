"use client";

import {
  createContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import type { IllustrationName } from "@/data/illustrations";

export interface ConfirmOptions {
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel?: string;
  art?: IllustrationName;
  tone?: "primary" | "danger";
}

export type Ask = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Ask | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const ask = useCallback<Ask>(
    (o) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(o);
      }),
    [],
  );

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {options && (
        <ConfirmDialog
          open
          {...options}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
