import type { Easing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { indentBlock } from "./format";
import { gsapImports, gsapTweenStatements } from "./script";

const SCSS_IMPORT = `import "./anim.scss";`;

function elementInfo(config: AnimationConfig) {
  if (config.target.type === "image") {
    return {
      name: "AnimatedImage",
      refType: "HTMLImageElement",
      jsx: (attrs: string) =>
        `<img${attrs} src=${JSON.stringify(config.target.image.src)} alt=${JSON.stringify(config.target.image.alt)} />`,
    };
  }
  const { text, tag } = config.target;
  const children = /[{}<>]/.test(text) ? `{${JSON.stringify(text)}}` : text;
  return {
    name: "AnimatedText",
    refType: tag === "p" ? "HTMLParagraphElement" : "HTMLSpanElement",
    jsx: (attrs: string) => `<${tag}${attrs}>${children}</${tag}>`,
  };
}

const toggledClass = (cond: string, cls: string) =>
  ` className={${cond} ? "${TARGET_CLASS} ${cls}" : "${TARGET_CLASS}"}`;

export function buildReact(config: AnimationConfig, easing: Easing): string {
  return config.engine === "gsap" ? buildGsapReact(config, easing) : buildCssReact(config);
}

function buildCssReact(config: AnimationConfig): string {
  const { trigger } = config;
  const el = elementInfo(config);
  const cls = trigger.className;

  // クラス不要（読み込み時。keyframes / @starting-style の transition）
  if (trigger.mode === "load") {
    return [
      SCSS_IMPORT,
      "",
      `export function ${el.name}() {`,
      `  return ${el.jsx(` className="${TARGET_CLASS}"`)};`,
      `}`,
    ].join("\n");
  }

  // 親から show で制御
  return [
    SCSS_IMPORT,
    "",
    `type Props = {`,
    `  /** true で .${cls} が付与されアニメーションが発火 */`,
    `  show?: boolean;`,
    `};`,
    "",
    `export function ${el.name}({ show = false }: Props) {`,
    `  return ${el.jsx(toggledClass("show", cls))};`,
    `}`,
  ].join("\n");
}

function buildGsapReact(config: AnimationConfig, easing: Easing): string {
  const { trigger } = config;
  const el = elementInfo(config);
  const cls = trigger.className;
  const header = [`"use client";`, "", `import { useRef } from "react";`, gsapImports(config, true, easing)];
  // gsapImports の registerPlugin 前に SCSS を import したいので差し込む
  const imports = header.join("\n").replace(
    "\n\ngsap.registerPlugin",
    `\n${SCSS_IMPORT}\n\ngsap.registerPlugin`,
  );

  if (trigger.mode === "class") {
    return [
      imports,
      "",
      `type Props = {`,
      `  /** true で .${cls} が付与されアニメーションが再生 */`,
      `  show?: boolean;`,
      `};`,
      "",
      `export function ${el.name}({ show = false }: Props) {`,
      `  const ref = useRef<${el.refType}>(null);`,
      `  const tween = useRef<gsap.core.Tween>(null);`,
      "",
      `  useGSAP(`,
      `    () => {`,
      `      const el = ref.current;`,
      `      if (!el) return;`,
      indentBlock(gsapTweenStatements(config, { paused: true, assign: "tween.current = " }, easing), 3),
      `    },`,
      `    { scope: ref },`,
      `  );`,
      "",
      `  useGSAP(() => {`,
      `    if (show) tween.current?.play();`,
      `    else tween.current?.pause(0);`,
      `  }, [show]);`,
      "",
      `  return ${el.jsx(` ref={ref}${toggledClass("show", cls)}`)};`,
      `}`,
    ].join("\n");
  }

  // 読み込み時
  const body = [
    `      const el = ref.current;`,
    `      if (!el) return;`,
    indentBlock(gsapTweenStatements(config, { paused: false, assign: "" }, easing), 3),
  ];

  return [
    imports,
    "",
    `export function ${el.name}() {`,
    `  const ref = useRef<${el.refType}>(null);`,
    "",
    `  useGSAP(`,
    `    () => {`,
    ...body,
    `    },`,
    `    { scope: ref },`,
    `  );`,
    "",
    `  return ${el.jsx(` ref={ref} className="${TARGET_CLASS}"`)};`,
    `}`,
  ].join("\n");
}
