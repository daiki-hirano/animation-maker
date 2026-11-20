import { gsapEaseName, type Easing } from "./easings";
import type {
  AnimationConfig,
  MaskDirection,
  MotionKey,
  MotionState,
  TranslateUnit,
} from "./types";

export const MOTION_KEYS: MotionKey[] = [
  "opacity",
  "x",
  "y",
  "scale",
  "rotate",
  "blur",
  "mask",
];

const MASK_STOPS = "#000 0%, #000 50%, transparent 60%, transparent 100%";

/** 向きごとのマスク定義（値は固定）。position の v はスライダーの値（コードに書く数値そのまま） */
export const MASK_DEFS: Record<
  MaskDirection,
  { image: string; size: string; position: (v: number) => string }
> = {
  left: {
    image: `linear-gradient(to right, ${MASK_STOPS})`,
    size: "300% 100%",
    position: (v) => `${v}% 0%`,
  },
  right: {
    image: `linear-gradient(to left, ${MASK_STOPS})`,
    size: "300% 100%",
    position: (v) => `${v}% 0%`,
  },
  top: {
    image: `linear-gradient(to bottom, ${MASK_STOPS})`,
    size: "100% 300%",
    position: (v) => `0% ${v}%`,
  },
  bottom: {
    image: `linear-gradient(to top, ${MASK_STOPS})`,
    size: "100% 300%",
    position: (v) => `0% ${v}%`,
  },
};

/** right / bottom は left / top と値が反転する（0 が非表示側） */
export function isMirrored(direction: MaskDirection) {
  return direction === "right" || direction === "bottom";
}

/** mask-position の値（CSS / GSAP 共通） */
export function maskPositionValue(value: number, direction: MaskDirection) {
  return MASK_DEFS[direction].position(round(value));
}

/** 小数のノイズを除去 */
export function round(n: number, digits = 3) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}

/** 開始 / 終了で値が異なるプロパティ */
export function changedKeys(from: MotionState, to: MotionState): MotionKey[] {
  return MOTION_KEYS.filter((k) => from[k] !== to[k]);
}

const TRANSFORM_KEYS: MotionKey[] = ["x", "y", "scale", "rotate"];

/** CSS 宣言（プロパティ → 値）。keys に含まれるものだけ出力 */
export function stateToCss(
  state: MotionState,
  keys: MotionKey[],
  opts: { unit: TranslateUnit; maskDirection: MaskDirection },
): [string, string][] {
  const { unit, maskDirection } = opts;
  const decls: [string, string][] = [];
  if (keys.includes("opacity")) decls.push(["opacity", `${round(state.opacity)}`]);

  const transforms: string[] = [];
  if (keys.includes("x") || keys.includes("y")) {
    transforms.push(`translate(${round(state.x)}${unit}, ${round(state.y)}${unit})`);
  }
  if (keys.includes("scale")) transforms.push(`scale(${round(state.scale)})`);
  if (keys.includes("rotate")) transforms.push(`rotate(${round(state.rotate)}deg)`);
  if (transforms.length) decls.push(["transform", transforms.join(" ")]);

  if (keys.includes("blur")) decls.push(["filter", `blur(${round(state.blur)}px)`]);
  if (keys.includes("mask")) {
    decls.push(["mask-position", maskPositionValue(state.mask, maskDirection)]);
  }
  return decls;
}

/** transition-property 用のCSSプロパティ名一覧 */
export function cssPropertyNames(keys: MotionKey[]): string[] {
  const names: string[] = [];
  if (keys.includes("opacity")) names.push("opacity");
  if (keys.some((k) => TRANSFORM_KEYS.includes(k))) names.push("transform");
  if (keys.includes("blur")) names.push("filter");
  if (keys.includes("mask")) names.push("mask-position");
  return names;
}

export type GsapVars = Record<string, number | string | boolean | object>;

function stateToGsap(
  state: MotionState,
  keys: MotionKey[],
  unit: TranslateUnit,
  maskDirection: MaskDirection,
): GsapVars {
  const vars: GsapVars = {};
  // % は GSAP では xPercent / yPercent で指定する
  const [xProp, yProp] = unit === "%" ? ["xPercent", "yPercent"] : ["x", "y"];
  if (keys.includes("opacity")) vars.opacity = round(state.opacity);
  if (keys.includes("x")) vars[xProp] = round(state.x);
  if (keys.includes("y")) vars[yProp] = round(state.y);
  if (keys.includes("scale")) vars.scale = round(state.scale);
  if (keys.includes("rotate")) vars.rotation = round(state.rotate);
  if (keys.includes("blur")) vars.filter = `blur(${round(state.blur)}px)`;
  if (keys.includes("mask")) vars.maskPosition = maskPositionValue(state.mask, maskDirection);
  return vars;
}

/** gsap.fromTo に渡す from / to vars（プレビューとコード生成で共通） */
export function buildGsapVars(
  config: AnimationConfig,
  easing: Easing,
): {
  from: GsapVars;
  to: GsapVars;
} {
  const keys = changedKeys(config.from, config.to);
  const { timing, gsap } = config;
  const to: GsapVars = {
    ...stateToGsap(config.to, keys, config.translateUnit, config.maskDirection),
    duration: round(timing.duration),
    ease: gsapEaseName(easing),
  };
  if (timing.delay) to.delay = round(timing.delay);
  if (gsap.repeat !== 0) to.repeat = gsap.repeat;
  if (gsap.yoyo && gsap.repeat !== 0) to.yoyo = true;
  if (usesSplitText(config)) to.stagger = round(gsap.splitText.stagger);
  return {
    from: stateToGsap(config.from, keys, config.translateUnit, config.maskDirection),
    to,
  };
}

export function usesSplitText(config: AnimationConfig) {
  return (
    config.engine === "gsap" &&
    config.gsap.plugin === "splitText" &&
    config.target.type === "text"
  );
}
