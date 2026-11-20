"use client";

import { AnimationPreview } from "@/components/editor/AnimationPreview";
import { useEasings } from "@/hooks/useEasings";
import { resolveEasing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";

type Props = {
  config: AnimationConfig;
  /** true の間だけループ再生する。false は終了状態で静止表示 */
  playing: boolean;
};

/** プリセットのアニメーションをカード内に表示するサムネイル（普段は終了状態で静止、再生中は GIF のようにループ） */
export function PresetThumbnail({ config, playing }: Props) {
  const easings = useEasings();
  const { easing } = resolveEasing(config.timing.easing, easings);

  return (
    <div className="absolute inset-0 bg-stage">
      <AnimationPreview variant="thumbnail" config={config} easing={easing} playing={playing} />
    </div>
  );
}
