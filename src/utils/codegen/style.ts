import { cssEasingValue, type Easing } from "@/utils/animation/easings";
import {
  changedKeys,
  cssPropertyNames,
  MASK_DEFS,
  round,
  stateToCss,
} from "@/utils/animation/motion";
import type { AnimationConfig } from "@/utils/animation/types";
import { KEYFRAMES_NAME, TARGET_CLASS } from "./constants";

type Decl = [property: string, value: string];

/** ネスト記法 CSS / プレビュー用フラット CSS のどちらにも書き出せる中間表現 */
interface StyleModel {
  base: Decl[];
  /** .anim の子要素に当てる規則（figure で囲んだ画像の img など） */
  children?: { selector: string; decls: Decl[] }[];
  modifier?: { className: string; decls: Decl[] };
  keyframes?: { name: string; from: Decl[]; to: Decl[] };
  /** @starting-style で書く開始状態（クラスなしで transition を読み込み時に再生する） */
  startingStyle?: Decl[];
  comment?: string;
}

const IMAGE_DECLS: Decl[] = [["display", "block"], ["max-width", "100%"], ["height", "auto"]];

/** figure で囲んだ画像: img は figure の中で自身の規則を持つ */
function hasImageWrapper(config: AnimationConfig) {
  return config.target.type === "image" && config.target.image.wrapper;
}

function childRules(config: AnimationConfig): StyleModel["children"] {
  return hasImageWrapper(config) ? [{ selector: "img", decls: IMAGE_DECLS }] : undefined;
}

function baseDecls(config: AnimationConfig, withMask: boolean): Decl[] {
  const decls: Decl[] = [];
  if (config.target.type === "image") {
    if (config.target.image.wrapper) {
      // figure は既定でマージンがあり、幅いっぱいに広がってマスクが画像の幅からずれるため
      decls.push(["margin", "0"]);
      if (withMask) decls.push(["width", "fit-content"]);
    } else {
      decls.push(...IMAGE_DECLS);
    }
  } else if (config.target.tag === "span") {
    // span はインライン要素で transform が効かないため
    decls.push(["display", "inline-block"]);
  } else if (withMask) {
    // p は幅いっぱいに広がり、マスクがテキストの幅からずれるため
    decls.push(["width", "fit-content"]);
  }
  if (withMask) {
    // mask-position のアニメーションに必要なマスク本体（CSS / GSAP 共通）
    const def = MASK_DEFS[config.maskDirection];
    decls.push(
      ["mask-image", def.image],
      ["mask-size", def.size],
      ["mask-repeat", "no-repeat"],
    );
  }
  return decls;
}

function seconds(n: number) {
  return `${round(n)}s`;
}

export function buildStyleModel(config: AnimationConfig, easingDef: Easing): StyleModel {
  const keys = changedKeys(config.from, config.to);
  const base = baseDecls(config, keys.includes("mask"));
  const children = childRules(config);

  if (config.engine === "gsap") {
    return {
      base,
      children,
      comment: "アニメーションは GSAP で制御するため、ここでは基本スタイルのみ",
    };
  }

  const cssOpts = { unit: config.translateUnit, maskDirection: config.maskDirection };
  const from = stateToCss(config.from, keys, cssOpts);
  const to = stateToCss(config.to, keys, cssOpts);
  const { timing, trigger } = config;
  const easing = cssEasingValue(easingDef);

  if (config.cssMethod === "transition") {
    // 変化するプロパティのみを transition-property に指定する
    const props = cssPropertyNames(keys);
    const transition: Decl[] = [
      ["transition-property", props.length ? props.join(", ") : "none"],
      ["transition-duration", seconds(timing.duration)],
      ["transition-timing-function", easing],
    ];
    if (timing.delay) transition.push(["transition-delay", seconds(timing.delay)]);
    if (trigger.mode === "load") {
      // クラスなし: 終了状態を基本スタイルにし、開始状態は @starting-style で指定する
      return { base: [...base, ...to, ...transition], children, startingStyle: from };
    }
    return {
      base: [...base, ...from, ...transition],
      children,
      modifier: { className: trigger.className, decls: to },
    };
  }

  // keyframes
  const { iterationCount, direction, fillMode } = config.keyframes;
  const animation: Decl = [
    "animation",
    [
      KEYFRAMES_NAME,
      seconds(timing.duration),
      easing,
      seconds(timing.delay),
      iterationCount === 0 ? "infinite" : String(iterationCount),
      direction,
      fillMode,
    ].join(" "),
  ];
  const keyframes = { name: KEYFRAMES_NAME, from, to };

  if (trigger.mode === "load") {
    return { base: [...base, animation], children, keyframes };
  }
  return {
    base: [...base, ...from],
    children,
    modifier: { className: trigger.className, decls: [...to, animation] },
    keyframes,
  };
}

const indent = (depth: number) => "  ".repeat(depth);

function declLines(decls: Decl[], depth: number) {
  return decls.map(([p, v]) => `${indent(depth)}${p}: ${v};`);
}

function keyframesLines(model: StyleModel) {
  if (!model.keyframes) return [];
  const { name, from, to } = model.keyframes;
  return [
    "",
    `@keyframes ${name} {`,
    `  from {`,
    ...declLines(from, 2),
    `  }`,
    `  to {`,
    ...declLines(to, 2),
    `  }`,
    `}`,
  ];
}

function startingStyleLines(decls: Decl[], depth: number) {
  return [
    `${indent(depth)}@starting-style {`,
    ...declLines(decls, depth + 1),
    `${indent(depth)}}`,
  ];
}

/** 配布用の CSS。ネイティブ CSS のネスト記法（&.xxx / @starting-style の入れ子）で出力する */
export function formatStyle(model: StyleModel): string {
  const lines: string[] = [];
  if (model.comment) lines.push(`/* ${model.comment} */`);
  lines.push(`.${TARGET_CLASS} {`, ...declLines(model.base, 1));
  for (const child of model.children ?? []) {
    if (model.base.length) lines.push("");
    lines.push(`  & ${child.selector} {`, ...declLines(child.decls, 2), `  }`);
  }
  if (model.startingStyle) {
    if (model.base.length) lines.push("");
    lines.push(...startingStyleLines(model.startingStyle, 1));
  }
  if (model.modifier) {
    if (model.base.length) lines.push("");
    lines.push(
      `  &.${model.modifier.className} {`,
      ...declLines(model.modifier.decls, 2),
      `  }`,
    );
  }
  lines.push("}", ...keyframesLines(model));
  return lines.join("\n");
}

/** プレビュー用のプレーンCSS。scope でセレクタを限定する */
export function formatCss(model: StyleModel, scope: string): string {
  const sel = `${scope} .${TARGET_CLASS}`;
  const lines = [`${sel} {`, ...declLines(model.base, 1), "}"];
  for (const child of model.children ?? []) {
    lines.push(`${sel} ${child.selector} {`, ...declLines(child.decls, 1), "}");
  }
  if (model.modifier) {
    lines.push(
      `${sel}.${model.modifier.className} {`,
      ...declLines(model.modifier.decls, 1),
      "}",
    );
  }
  if (model.startingStyle) {
    // 互換性のためトップレベルに出力する
    lines.push(
      "@starting-style {",
      `  ${sel} {`,
      ...declLines(model.startingStyle, 2),
      "  }",
      "}",
    );
  }
  lines.push(...keyframesLines(model));
  return lines.join("\n");
}

/** プレビュー専用: 再生ボタンを押した直後に開始状態を固定表示するためのクラス（生成コードには含めない） */
export const PREVIEW_HOLD_CLASS = "is-preview-hold";

/** プレビュー専用: 再生せず終了状態で静止表示するためのクラス（生成コードには含めない） */
export const PREVIEW_REST_CLASS = "is-preview-rest";

/** プレビュー専用クラスで状態を固定する CSS を作る。トリガークラスの規則より優先させるため !important を付ける */
function previewForceCss(config: AnimationConfig, scope: string, className: string, useTo: boolean): string {
  const keys = changedKeys(config.from, config.to);
  const cssOpts = { unit: config.translateUnit, maskDirection: config.maskDirection };
  const state = stateToCss(useTo ? config.to : config.from, keys, cssOpts);
  const decls: Decl[] = [
    ...state.map(([p, v]): Decl => [p, `${v} !important`]),
    ["transition", "none !important"],
    ["animation", "none !important"],
  ];
  return [`${scope} .${TARGET_CLASS}.${className} {`, ...declLines(decls, 1), "}"].join("\n");
}

/** keyframes の reverse 系は終了状態からアニメーションが始まる（CSS のみ） */
function startsAtTo(config: AnimationConfig) {
  return (
    config.engine !== "gsap" &&
    config.cssMethod === "keyframes" &&
    (config.keyframes.direction === "reverse" || config.keyframes.direction === "alternate-reverse")
  );
}

/**
 * プレビュー専用 CSS。再生前の待機中、対象を開始状態に固定する。
 * 生成コードには出力しない。GSAP は fromTo が即座に開始状態を描画するため空文字を返す。
 */
export function previewHoldCss(config: AnimationConfig, scope: string): string {
  if (config.engine === "gsap") return "";
  return previewForceCss(config, scope, PREVIEW_HOLD_CLASS, startsAtTo(config));
}

/**
 * プレビュー専用 CSS。再生せず、対象を終了状態で静止表示する。
 * 生成コードには出力しない。GSAP は再生しないため、CSS の終了状態が最終フレームを表す。
 * 終了状態は config.to（keyframes の reverse 系のみ config.from）。
 */
export function previewRestCss(config: AnimationConfig, scope: string): string {
  return previewForceCss(config, scope, PREVIEW_REST_CLASS, !startsAtTo(config));
}
