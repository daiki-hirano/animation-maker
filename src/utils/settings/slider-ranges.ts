import { createLocalStore } from "./local-store";

/**
 * 「動き」スライダーの最小値 / 最大値の設定。
 * アニメーションの設定値ではなくエディタの表示設定なので、config とは分けて localStorage に保存する。
 */

export type RangeKey = "translatePx" | "translatePercent" | "scale" | "rotate" | "blur";

export type SliderRange = { min: number; max: number };

export type SliderRanges = Record<RangeKey, SliderRange>;

export const RANGE_FIELDS: { key: RangeKey; label: string; unit?: string; minFloor?: number }[] = [
  { key: "translatePx", label: "translate", unit: "px" },
  { key: "translatePercent", label: "translate", unit: "%" },
  { key: "scale", label: "scale" },
  { key: "rotate", label: "rotate", unit: "deg" },
  // blur に負の値は使えない
  { key: "blur", label: "blur", unit: "px", minFloor: 0 },
];

export const DEFAULT_RANGES: SliderRanges = {
  translatePx: { min: -100, max: 100 },
  translatePercent: { min: -100, max: 100 },
  scale: { min: 0, max: 3 },
  rotate: { min: -360, max: 360 },
  blur: { min: 0, max: 40 },
};

function isRange(v: unknown): v is SliderRange {
  if (typeof v !== "object" || v === null) return false;
  const { min, max } = v as Record<string, unknown>;
  return typeof min === "number" && typeof max === "number" && min < max;
}

function parse(raw: unknown): SliderRanges {
  if (typeof raw !== "object" || raw === null) return DEFAULT_RANGES;
  const data = raw as Partial<Record<RangeKey, unknown>>;
  const result = { ...DEFAULT_RANGES };
  for (const key of Object.keys(DEFAULT_RANGES) as RangeKey[]) {
    const value = data[key];
    if (isRange(value)) result[key] = value;
  }
  return result;
}

export const sliderRangesStore = createLocalStore<SliderRanges>({
  key: "animation-maker:slider-ranges",
  parse,
  fallback: DEFAULT_RANGES,
});

export function setSliderRange(key: RangeKey, range: SliderRange) {
  sliderRangesStore.set({ ...sliderRangesStore.get(), [key]: range });
}

export function resetSliderRanges() {
  sliderRangesStore.reset();
}
