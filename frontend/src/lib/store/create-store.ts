import { useSyncExternalStore } from "react";
import type { Store } from "@/interfaces/store";

/* Tiny localStorage-backed store. Components re-render through useSyncExternalStore when it changes. */
export function createStore<T>(key: string, seed: () => T): Store<T> {
  let cache: T | null = null;
  let serverCache: T | null = null;
  const listeners = new Set<() => void>();

  const get = (): T => {
    if (cache !== null) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : seed();
    } catch {
      cache = seed();
    }
    return cache;
  };

  // The server has no localStorage, so it renders the seed once and keeps that snapshot stable.
  const getServer = (): T => (serverCache ??= seed());

  const write = (next: T) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage full or blocked: keep the in-memory copy */
    }
    listeners.forEach((l) => l());
  };

  const set = (fn: (prev: T) => T) => write(fn(get()));
  const reset = () => write(seed());

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      cache = null;
      l();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const use = () => useSyncExternalStore(subscribe, get, getServer);

  return { get, set, reset, subscribe, use };
}
