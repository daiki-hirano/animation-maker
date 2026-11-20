import { useSyncExternalStore } from "react";

export interface LocalStore<T> {
  get(): T;
  set(value: T): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
  /** useSyncExternalStore 経由で値を購読する（SSR 時は fallback） */
  useValue(): T;
}

/**
 * localStorage に JSON で保存する汎用ストア。
 * - get() は生の文字列が変わらない限り同じオブジェクトを返す（useSyncExternalStore の要件）
 * - ストレージが使えない環境ではメモリ上の値で動作する
 */
export function createLocalStore<T>(options: {
  key: string;
  /** JSON.parse 済みの値を検証して T にする */
  parse: (raw: unknown) => T;
  fallback: T;
}): LocalStore<T> {
  const { key, parse, fallback } = options;
  let memory: T = fallback;
  let cachedRaw: string | null | undefined;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((l) => l());

  function get(): T {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      // ストレージが使えない環境ではメモリ上の値を使う
      return memory;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      if (raw === null) {
        memory = fallback;
      } else {
        try {
          memory = parse(JSON.parse(raw));
        } catch {
          memory = fallback;
        }
      }
    }
    return memory;
  }

  function set(value: T) {
    memory = value;
    try {
      const raw = JSON.stringify(value);
      localStorage.setItem(key, raw);
      // 直後の get() で同じ値をそのまま返せるようキャッシュを揃える
      cachedRaw = raw;
    } catch {
      // 保存できなくてもメモリ上では反映する
    }
    notify();
  }

  function reset() {
    try {
      localStorage.removeItem(key);
      cachedRaw = null;
    } catch {}
    memory = fallback;
    notify();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, reset, subscribe, useValue };
}
