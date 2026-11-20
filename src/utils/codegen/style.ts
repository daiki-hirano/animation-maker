import { cssEasingValue, type Easing } from "@/utils/animation/easings";
import {
  changedKeys,
  cssPropertyNames,
  round,
  stateToCss,
} from "@/utils/animation/motion";
import type { AnimationConfig } from "@/utils/animation/types";
import { KEYFRAMES_NAME, TARGET_CLASS } from "./constants";

type Decl = [property: string, value: string];

/** SCSS / CSS どちらにも書き出せる中間表現 */
interface StyleModel {
  base: Decl[];
  modifier?: { className: string; decls: Decl[] };
  keyframes?: { name: string; from: Decl[]; to: Decl[] };
  /** @starting-style で書く開始状態（クラスなしで transition を読み込み時に再生する） */
  startingStyle?: Decl[];
  comment?: string;
}

function baseDecls(config: AnimationConfig): Decl[] {
  if (config.target.type === "image") {
    return [
      ["display", "block"],
      ["max-width", "100%"],
      ["height", "auto"],
    ];
  }
  // span はインライン要素で transform が効かないため
  if (config.target.tag === "span") return [["display", "inline-block"]];
  return [];
}

function seconds(n: number) {
  return `${round(n)}s`;
}

export function buildStyleModel(config: AnimationConfig, easingDef: Easing): StyleModel {
  const base = baseDecls(config);

  if (config.engine === "gsap") {
    return {
      base,
      comment: "アニメーションは GSAP で制御するため、ここでは基本スタイルのみ",
    };
  }

  const keys = changedKeys(config.from, config.to);
  const from = stateToCss(config.from, keys, config.translateUnit);
  const to = stateToCss(config.to, keys, config.translateUnit);
  const { timing, trigger } = config;
  const easing = cssEasingValue(easingDef);

  if (config.cssMethod === "transition") {
    const props =
      config.transition.property === "all"
        ? ["all"]
        : cssPropertyNames(keys);
    const transition: Decl[] = [
      ["transition-property", props.length ? props.join(", ") : "none"],
      ["transition-duration", seconds(timing.duration)],
      ["transition-timing-function", easing],
    ];
    if (timing.delay) transition.push(["transition-delay", seconds(timing.delay)]);
    if (trigger.mode === "load") {
      // クラスなし: 終了状態を基本スタイルにし、開始状態は @starting-style で指定する
      return { base: [...base, ...to, ...transition], startingStyle: from };
    }
    return {
      base: [...base, ...from, ...transition],
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
    return { base: [...base, animation], keyframes };
  }
  return {
    base: [...base, ...from],
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

export function formatScss(model: StyleModel): string {
  const lines: string[] = [];
  if (model.comment) lines.push(`// ${model.comment}`);
  lines.push(`.${TARGET_CLASS} {`, ...declLines(model.base, 1));
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
