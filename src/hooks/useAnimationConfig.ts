"use client";

import { useCallback, useState } from "react";
import type { AnimationConfig } from "@/utils/animation/types";

type Patch<V> = V extends object ? Partial<V> : V;

export type ConfigUpdater = <K extends keyof AnimationConfig>(
  key: K,
  value: Patch<AnimationConfig[K]>,
) => void;

/** オブジェクト型のセクションは浅くマージ、プリミティブは置き換え */
export function useAnimationConfig(initial: AnimationConfig) {
  const [config, setConfig] = useState(initial);

  const update = useCallback<ConfigUpdater>((key, value) => {
    setConfig((prev) => {
      const current = prev[key];
      const next =
        typeof current === "object" && current !== null
          ? { ...current, ...(value as object) }
          : value;
      return { ...prev, [key]: next };
    });
  }, []);

  const reset = useCallback(() => setConfig(initial), [initial]);

  return { config, update, setConfig, reset };
}
