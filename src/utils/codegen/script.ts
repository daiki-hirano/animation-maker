import { customEaseData, needsCustomEase, type Easing } from "@/utils/animation/easings";
import { getGsapPlugin } from "@/utils/animation/gsap-plugins";
import { buildGsapVars, usesSplitText } from "@/utils/animation/motion";
import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { formatObject, indentBlock } from "./format";

/** GSAP の import 文と registerPlugin */
export function gsapImports(
  config: AnimationConfig,
  react: boolean,
  easing: Easing,
): string {
  const plugin = getGsapPlugin(config.gsap.plugin);
  const usePlugin = plugin.importName && usesSplitText(config);
  const lines = [`import gsap from "gsap";`];
  if (react) lines.push(`import { useGSAP } from "@gsap/react";`);
  if (usePlugin) lines.push(`import { ${plugin.importName} } from "${plugin.importPath}";`);
  const customEase = needsCustomEase(easing);
  if (customEase) lines.push(`import { CustomEase } from "gsap/CustomEase";`);

  const registered = [
    react && "useGSAP",
    usePlugin && plugin.importName,
    customEase && "CustomEase",
  ].filter(Boolean);
  if (registered.length) {
    lines.push("", `gsap.registerPlugin(${registered.join(", ")});`);
  }
  if (customEase) {
    lines.push("", `CustomEase.create("${easing.id}", "${customEaseData(easing)}");`);
  }
  return lines.join("\n");
}

/** el を対象にトゥイーンを作る文（最後の行で tween を作る） */
export function gsapTweenStatements(
  config: AnimationConfig,
  opts: { paused: boolean; assign: string },
  easing: Easing,
): string {
  const { from, to } = buildGsapVars(config, easing);
  const toVars = opts.paused ? { ...to, paused: true } : to;
  const lines: string[] = [];
  let target = "el";
  if (usesSplitText(config)) {
    const type = config.gsap.splitText.type;
    // span の中に div が入らないよう、分割要素も span にする
    const tagOpt = config.target.tag === "span" ? `, tag: "span"` : "";
    lines.push(`const split = SplitText.create(el, { type: "${type}"${tagOpt} });`);
    target = `split.${type}`;
  }
  lines.push(
    `${opts.assign}gsap.fromTo(${target}, ${formatObject(from)}, ${formatObject(toVars)});`,
  );
  return lines.join("\n");
}

/** HTML / Pug 向けの JS。不要な場合は null */
export function buildVanillaScript(
  config: AnimationConfig,
  easing: Easing,
): string | null {
  const { trigger } = config;
  const select = `const targets = document.querySelectorAll(".${TARGET_CLASS}");`;

  if (config.engine === "css") {
    return null;
  }

  // GSAP
  const imports = gsapImports(config, false, easing);
  const split = usesSplitText(config);
  const wrapFonts = (body: string) =>
    split
      ? `// フォント読み込み後に分割する\ndocument.fonts.ready.then(() => {\n${indentBlock(body, 1)}\n});`
      : body;

  if (trigger.mode === "load") {
    const factory = [
      `const createTween = (el) => {`,
      indentBlock(gsapTweenStatements(config, { paused: false, assign: "return " }, easing), 1),
      `};`,
    ].join("\n");
    return [
      imports,
      "",
      select,
      "",
      factory,
      "",
      wrapFonts(`targets.forEach((el) => createTween(el));`),
    ].join("\n");
  }

  const factory = [
    `const createTween = (el) => {`,
    indentBlock(gsapTweenStatements(config, { paused: true, assign: "return " }, easing), 1),
    `};`,
  ].join("\n");

  const body = [
    `const tweens = [...targets].map((el) => createTween(el));`,
    "",
    `// 任意のタイミングで再生する`,
    `// tweens.forEach((tween) => tween.play());`,
  ].join("\n");
  return [imports, "", select, "", factory, "", wrapFonts(body)].join("\n");
}
