import { DEFAULT_CONFIG, NEUTRAL_STATE } from "./defaults";
import type { AnimationPreset } from "./types";

/** 組み込みプリセット一覧 */
export const PRESETS: AnimationPreset[] = [
  {
    id: "mask-in",
    name: "マスクイン",
    description: "マスクを左から右へ動かして、テキストを表示します。",
    config: {
      ...DEFAULT_CONFIG,
      engine: "css",
      cssMethod: "transition",
      maskDirection: "left",
      timing: { duration: 2.6, delay: 0, easing: "easeOutQuart" },
      from: { ...NEUTRAL_STATE, mask: 90 },
      to: { ...NEUTRAL_STATE, mask: 20 },
    },
  },
];

/** id からプリセットを取得する */
export function getPreset(id: string): AnimationPreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}
