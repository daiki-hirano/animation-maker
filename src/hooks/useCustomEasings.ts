import type { Easing } from "@/utils/animation/easings";
import { customEasingsStore } from "@/utils/settings/custom-easings";

/** ユーザーが作成したカスタムイージングを購読する */
export function useCustomEasings(): Easing[] {
  return customEasingsStore.useValue();
}
