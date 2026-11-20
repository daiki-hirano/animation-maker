import { sliderRangesStore, type SliderRanges } from "@/utils/settings/slider-ranges";

/** 「動き」スライダーの範囲設定を購読する */
export function useSliderRanges(): SliderRanges {
  return sliderRangesStore.useValue();
}
