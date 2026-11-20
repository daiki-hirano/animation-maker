"use client";

import type { AnimationConfig, PanelSectionId } from "@/utils/animation/types";
import { GsapPluginSection } from "./sections/GsapPluginSection";
import { MotionSection } from "./sections/MotionSection";
import { TargetSection } from "./sections/TargetSection";
import { TimingSection } from "./sections/TimingSection";
import type { ConfigUpdater } from "@/hooks/useAnimationConfig";

export const ALL_SECTIONS: PanelSectionId[] = [
  "target",
  "timing",
  "motion",
  "gsapPlugin",
];

type Props = {
  config: AnimationConfig;
  update: ConfigUpdater;
  /** 表示するセクション（プリセットで絞り込む用） */
  sections?: PanelSectionId[];
  onImageFile: (file: File) => void;
  /** ローカル選択画像の object URL（イージング選択モーダルのプレビュー用） */
  imageSrc?: string;
};

export function ControlPanel({ config, update, sections = ALL_SECTIONS, onImageFile, imageSrc }: Props) {
  const props = { config, update };
  return (
    <div>
      {sections.map((id) => {
        switch (id) {
          case "target":
            return <TargetSection key={id} {...props} onImageFile={onImageFile} />;
          case "timing":
            return <TimingSection key={id} {...props} imageSrc={imageSrc} />;
          case "motion":
            return <MotionSection key={id} {...props} />;
          case "gsapPlugin":
            return config.engine === "gsap" ? <GsapPluginSection key={id} {...props} /> : null;
        }
      })}
    </div>
  );
}
