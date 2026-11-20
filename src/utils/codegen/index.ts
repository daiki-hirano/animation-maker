import type { Easing } from "@/utils/animation/easings";
import { needsCustomEase } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { buildHtml, buildPug } from "./markup";
import { buildReact } from "./react";
import { buildVanillaScript } from "./script";
import { buildStyleModel, formatCss, formatScss } from "./style";

export type MarkupFormat = "html" | "pug" | "react";

export const MARKUP_FORMATS: { id: MarkupFormat; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "pug", label: "Pug" },
  { id: "react", label: "React" },
];

export interface GeneratedCode {
  markup: string;
  /** markup の言語（ハイライト / ファイル名表示用） */
  markupLang: "html" | "pug" | "tsx";
  scss: string;
  /** React の場合はコンポーネントに含まれるため null */
  js: string | null;
  notes: string[];
}

export function generateCode(
  config: AnimationConfig,
  format: MarkupFormat,
  easing: Easing,
): GeneratedCode {
  const scss = formatScss(buildStyleModel(config, easing));
  const notes = buildNotes(config, format, easing);

  if (format === "react") {
    return { markup: buildReact(config, easing), markupLang: "tsx", scss, js: null, notes };
  }
  return {
    markup: format === "pug" ? buildPug(config) : buildHtml(config),
    markupLang: format,
    scss,
    js: buildVanillaScript(config, easing),
    notes,
  };
}

/** プレビュー用の CSS */
export function generatePreviewCss(config: AnimationConfig, scope: string, easing: Easing) {
  return formatCss(buildStyleModel(config, easing), scope);
}

function buildNotes(config: AnimationConfig, format: MarkupFormat, easing: Easing): string[] {
  const notes: string[] = [];
  if (config.engine === "gsap") {
    notes.push(
      format === "react"
        ? "インストール: npm i gsap @gsap/react"
        : "インストール: npm i gsap（JS は ES Modules 形式です）",
    );
  }
  if (config.engine === "gsap" && needsCustomEase(easing)) {
    notes.push("カスタムイージングは GSAP の CustomEase プラグインで再現しています。");
  }
  const { trigger } = config;
  if (config.engine === "css" && config.cssMethod === "transition" && trigger.mode === "load") {
    notes.push(
      "読み込み時のアニメーションは CSS の @starting-style で再生しています（Chrome 117+ / Safari 17.5+ / Firefox 129+）。",
    );
  }
  if (trigger.mode === "class") {
    notes.push(
      format === "react"
        ? `show プロパティを true にすると .${trigger.className} が付与され発火します。`
        : `任意のタイミングで .${TARGET_CLASS} に .${trigger.className} を付与すると発火します。`,
    );
  }
  return notes;
}
