import { useMemo } from "react";
import { BUILTIN_EASINGS, type Easing } from "@/utils/animation/easings";
import { useCustomEasings } from "@/hooks/useCustomEasings";

/** 組み込み + カスタムの全イージング（参照は安定） */
export function useEasings(): Easing[] {
  const custom = useCustomEasings();
  return useMemo(() => [...BUILTIN_EASINGS, ...custom], [custom]);
}
