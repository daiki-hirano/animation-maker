import type { GsapPluginId } from "./gsap-plugins";

/** アニメーションを実行するエンジン */
export type Engine = "css" | "gsap";

/** CSS エンジン時の実装方式 */
export type CssMethod = "transition" | "keyframes";

/** アニメーション対象 */
export type TargetType = "text" | "image";

/** テキストを囲むタグ */
export type TextTag = "span" | "p";

export interface TargetConfig {
  type: TargetType;
  text: string;
  /** テキストを囲むタグ */
  tag: TextTag;
  image: {
    /** 生成コードに出力するパス */
    src: string;
    alt: string;
  };
}

/** 変化させる見た目の状態（開始 / 終了でそれぞれ持つ） */
export interface MotionState {
  opacity: number;
  /** 単位は AnimationConfig.translateUnit */
  x: number;
  /** 単位は AnimationConfig.translateUnit */
  y: number;
  scale: number;
  /** deg */
  rotate: number;
  /** px */
  blur: number;
}

export type MotionKey = keyof MotionState;

/** translate の単位（X / Y・開始 / 終了で共通） */
export type TranslateUnit = "px" | "%";

export interface TimingConfig {
  /** 秒 */
  duration: number;
  /** 秒 */
  delay: number;
  /** イージングの id（組み込み or カスタム） */
  easing: string;
}

export type TransitionPropertyMode = "auto" | "all";

export interface TransitionConfig {
  /** auto: 変化するプロパティのみ / all: transition: all */
  property: TransitionPropertyMode;
}

export type KeyframesDirection =
  | "normal"
  | "reverse"
  | "alternate"
  | "alternate-reverse";

export type KeyframesFillMode = "none" | "forwards" | "backwards" | "both";

export interface KeyframesConfig {
  /** 0 = infinite */
  iterationCount: number;
  direction: KeyframesDirection;
  fillMode: KeyframesFillMode;
}

export interface GsapConfig {
  /** -1 = 無限 */
  repeat: number;
  yoyo: boolean;
  plugin: GsapPluginId;
  splitText: {
    type: "chars" | "words" | "lines";
    /** 秒 */
    stagger: number;
  };
}

export type TriggerMode = "load" | "class";

export interface TriggerConfig {
  /** load: 読み込み時に実行 / class: 特定クラス付与時に実行 */
  mode: TriggerMode;
  className: string;
}

export interface AnimationConfig {
  engine: Engine;
  cssMethod: CssMethod;
  target: TargetConfig;
  timing: TimingConfig;
  transition: TransitionConfig;
  keyframes: KeyframesConfig;
  gsap: GsapConfig;
  from: MotionState;
  to: MotionState;
  translateUnit: TranslateUnit;
  trigger: TriggerConfig;
}

/** コントロールパネルのセクション。プリセットでは表示するものを絞れる */
export type PanelSectionId =
  | "target"
  | "engine"
  | "timing"
  | "motion"
  | "gsapPlugin"
  | "trigger";

/** プリセット定義（今後追加予定） */
export interface AnimationPreset {
  id: string;
  name: string;
  description?: string;
  config: AnimationConfig;
  /** パネルに表示するセクション。未指定なら全て */
  sections?: PanelSectionId[];
}
