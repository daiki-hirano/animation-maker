import type { AnimationConfig } from "@/utils/animation/types";
import type { ConfigUpdater } from "@/hooks/useAnimationConfig";

export type SectionProps = {
  config: AnimationConfig;
  update: ConfigUpdater;
};
