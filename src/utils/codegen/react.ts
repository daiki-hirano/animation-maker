import type { Easing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { indentBlock } from "./format";
import { gsapImports, gsapTweenStatements } from "./script";

const CSS_IMPORT = `import "./anim.css";`;

function elementInfo(config: AnimationConfig) {
  if (config.target.type === "image") {
    const { src, alt, wrapper } = config.target.image;
    const img = `<img src=${JSON.stringify(src)} alt=${JSON.stringify(alt)} />`;
    if (wrapper) {
      return {
        name: "AnimatedImage",
        refType: "HTMLElement",
        // 複数行になるので return ( ) で囲む
        multiline: true,
        jsx: (attrs: string) => `<figure${attrs}>\n  ${img}\n</figure>`,
      };
    }
    return {
      name: "AnimatedImage",
      refType: "HTMLImageElement",
      multiline: false,
      jsx: (attrs: string) => `<img${attrs} src=${JSON.stringify(src)} alt=${JSON.stringify(alt)} />`,
    };
  }
  const { text, tag } = config.target;
  const children = /[{}<>]/.test(text) ? `{${JSON.stringify(text)}}` : text;
  return {
    name: "AnimatedText",
    refType: tag === "p" ? "HTMLParagraphElement" : "HTMLSpanElement",
    multiline: false,
    jsx: (attrs: string) => `<${tag}${attrs}>${children}</${tag}>`,
  };
}

type ElementInfo = ReturnType<typeof elementInfo>;

/** return 文を作る。複数行の JSX は ( ) で囲んでインデントする */
function returnLines(el: ElementInfo, attrs: string): string[] {
  const jsx = el.jsx(attrs);
  if (!el.multiline) return [`  return ${jsx};`];
  return [`  return (`, indentBlock(jsx, 2), `  );`];
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
      CSS_IMPORT,
      "",
      `export function ${el.name}() {`,
      ...returnLines(el, ` className="${TARGET_CLASS}"`),
      `}`,
    ].join("\n");
  }

  // 親から show で制御
  return [
    CSS_IMPORT,
    "",
    `type Props = {`,
    `  /** true で .${cls} が付与されアニメーションが発火 */`,
    `  show?: boolean;`,
    `};`,
    "",
    `export function ${el.name}({ show = false }: Props) {`,
    ...returnLines(el, toggledClass("show", cls)),
    `}`,
  ].join("\n");
}

function buildGsapReact(config: AnimationConfig, easing: Easing): string {
  const { trigger } = config;
  const el = elementInfo(config);
  const header = [`"use client";`, "", `import { useRef } from "react";`, gsapImports(config, true, easing)];
  // gsapImports の registerPlugin 前に CSS を import したいので差し込む
  const imports = header.join("\n").replace(
    "\n\ngsap.registerPlugin",
    `\n${CSS_IMPORT}\n\ngsap.registerPlugin`,
  );

  if (trigger.mode === "class") {
    return [
      imports,
      "",
      `type Props = {`,
      `  /** true で再生 */`,
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
      ...returnLines(el, ` ref={ref} className="${TARGET_CLASS}"`),
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
    ...returnLines(el, ` ref={ref} className="${TARGET_CLASS}"`),
    `}`,
  ].join("\n");
}
