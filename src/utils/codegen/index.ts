import type { Easing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { buildHtml, buildPug } from "./markup";
import { buildReact } from "./react";
import { buildVanillaScript } from "./script";
import { buildStyleModel, formatCss, formatStyle } from "./style";

export { PREVIEW_HOLD_CLASS, PREVIEW_REST_CLASS, previewHoldCss, previewRestCss } from "./style";

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
  css: string;
  /** React の場合はコンポーネントに含まれるため null */
  js: string | null;
  notes: string[];
}

export function generateCode(
  config: AnimationConfig,
  format: MarkupFormat,
  easing: Easing,
): GeneratedCode {
  const styleModel = buildStyleModel(config, easing);
  const css = formatStyle(styleModel);
  const notes = buildNotes(config);

  if (format === "react") {
    return { markup: buildReact(config, easing), markupLang: "tsx", css, js: null, notes };
  }
  return {
    markup: format === "pug" ? buildPug(config) : buildHtml(config),
    markupLang: format,
    css,
    js: buildVanillaScript(config, easing),
    notes,
  };
}

/** プレビュー用の CSS */
export function generatePreviewCss(config: AnimationConfig, scope: string, easing: Easing) {
  return formatCss(buildStyleModel(config, easing), scope);
}

/** コード上部に表示する注記。形式・方式・トリガーに関わらず常に全件を表示する */
function buildNotes(config: AnimationConfig): string[] {
  return [
    "CSS はネスト記法で出力しています（Chrome 120+ / Safari 17.2+ / Firefox 117+）。",
    "transition の読み込み時の再生には @starting-style を使っています（Chrome 117+ / Safari 17.5+ / Firefox 129+）。",
    `CSS のクラス付与時は、任意のタイミングで .${TARGET_CLASS} に .${config.trigger.className} を付与すると発火します（React は show プロパティを true にします）。`,
    "GSAP を使う場合のインストール: npm i gsap（React は npm i gsap @gsap/react）。JS は ES Modules 形式です。",
    "GSAP の任意のタイミングでは、tween.play() を呼ぶと再生します（React は show プロパティを true にします）。",
    "GSAP でカスタムイージングを使う場合は、CustomEase プラグインで再現しています。",
    "SplitText 使用時は mask-position のアニメーションは反映されません。",
  ];
}
