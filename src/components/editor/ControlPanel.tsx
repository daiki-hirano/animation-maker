"use client";

import type { AnimationConfig, PanelSectionId } from "@/utils/animation/types";
import { EngineSection } from "./sections/EngineSection";
import { GsapPluginSection } from "./sections/GsapPluginSection";
import { MotionSection } from "./sections/MotionSection";
import { TargetSection } from "./sections/TargetSection";
import { TimingSection } from "./sections/TimingSection";
import { TriggerSection } from "./sections/TriggerSection";
import type { ConfigUpdater } from "@/hooks/useAnimationConfig";

export const ALL_SECTIONS: PanelSectionId[] = [
  "target",
  "engine",
  "timing",
  "motion",
  "gsapPlugin",
  "trigger",
];

type Props = {
  config: AnimationConfig;
  update: ConfigUpdater;
  /** 表示するセクション（プリセットで絞り込む用） */
  sections?: PanelSectionId[];
  onImageFile: (file: File) => void;
};

export function ControlPanel({ config, update, sections = ALL_SECTIONS, onImageFile }: Props) {
  const props = { config, update };
  return (
    <div>
      {sections.map((id) => {
        switch (id) {
          case "target":
            return <TargetSection key={id} {...props} onImageFile={onImageFile} />;
          case "engine":
            return <EngineSection key={id} {...props} />;
          case "timing":
            return <TimingSection key={id} {...props} />;
          case "motion":
            return <MotionSection key={id} {...props} />;
          case "gsapPlugin":
            return config.engine === "gsap" ? <GsapPluginSection key={id} {...props} /> : null;
          case "trigger":
            return <TriggerSection key={id} {...props} />;
        }
      })}
    </div>
  );
}
