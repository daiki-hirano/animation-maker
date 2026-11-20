/** cubic-bezier の制御点 [x1, y1, x2, y2] */
export type Bezier = [x1: number, y1: number, x2: number, y2: number];

export type EasingGroup = "standard" | "easings" | "custom";

export interface Easing {
  /** CustomEase の id としても使うため [a-zA-Z0-9-] のみ */
  id: string;
  name: string;
  bezier: Bezier;
  group: EasingGroup;
  /** CSS キーワードがあるもの（linear, ease, ...） */
  css?: string;
  /** GSAP のネイティブなイージング名があるもの */
  gsap?: string;
}

export const EASING_GROUP_LABELS: Record<EasingGroup, string> = {
  standard: "標準",
  easings: "easings.net",
  custom: "カスタム",
};

export const DEFAULT_EASING_ID = "ease-out";

const standard = (
  id: string,
  bezier: Bezier,
  gsap: string,
): Easing => ({ id, name: id, bezier, group: "standard", css: id, gsap });

const easingsNet = (
  id: string,
  bezier: Bezier,
  gsap: string,
): Easing => ({ id, name: id, bezier, group: "easings", gsap });

/**
 * 組み込みイージング。easings.net グループは easings.net の名前と cubic-bezier 値に従う。
 * GSAP 出力では同等のネイティブ ease（power3.out など）を使う（近似で最大差は約 4%）。
 * CSS 出力は bezier、GSAP 出力はネイティブ名を使う。
 */
export const BUILTIN_EASINGS: Easing[] = [
  standard("linear", [0, 0, 1, 1], "none"),
  standard("ease", [0.25, 0.1, 0.25, 1], "power1.out"),
  standard("ease-in", [0.42, 0, 1, 1], "power1.in"),
  standard("ease-out", [0, 0, 0.58, 1], "power1.out"),
  standard("ease-in-out", [0.42, 0, 0.58, 1], "power1.inOut"),
  easingsNet("easeOutSine", [0.61, 1, 0.88, 1], "sine.out"),
  easingsNet("easeInOutSine", [0.37, 0, 0.63, 1], "sine.inOut"),
  easingsNet("easeInQuad", [0.11, 0, 0.5, 0], "power1.in"),
  easingsNet("easeOutQuad", [0.5, 1, 0.89, 1], "power1.out"),
  easingsNet("easeInOutQuad", [0.45, 0, 0.55, 1], "power1.inOut"),
  easingsNet("easeOutCubic", [0.33, 1, 0.68, 1], "power2.out"),
  easingsNet("easeInOutCubic", [0.65, 0, 0.35, 1], "power2.inOut"),
  easingsNet("easeOutQuart", [0.25, 1, 0.5, 1], "power3.out"),
  easingsNet("easeOutQuint", [0.22, 1, 0.36, 1], "power4.out"),
  easingsNet("easeInOutQuint", [0.83, 0, 0.17, 1], "power4.inOut"),
  easingsNet("easeOutExpo", [0.16, 1, 0.3, 1], "expo.out"),
  easingsNet("easeInOutExpo", [0.87, 0, 0.13, 1], "expo.inOut"),
  easingsNet("easeOutCirc", [0, 0.55, 0.45, 1], "circ.out"),
  easingsNet("easeInOutCirc", [0.85, 0, 0.15, 1], "circ.inOut"),
];

/** id からイージングを解決する。見つからなければ既定の組み込みに戻し missing: true を返す */
export function resolveEasing(
  id: string,
  easings: Easing[],
): { easing: Easing; missing: boolean } {
  const found = easings.find((e) => e.id === id);
  if (found) return { easing: found, missing: false };
  const fallback = BUILTIN_EASINGS.find((e) => e.id === DEFAULT_EASING_ID)!;
  return { easing: fallback, missing: true };
}

/** 小数 3 桁までに丸め、末尾の 0 を落とす */
function num(n: number): string {
  const r = Math.round(n * 1000) / 1000;
  return String(Object.is(r, -0) ? 0 : r);
}

export function formatBezier(b: Bezier): string {
  return `cubic-bezier(${b.map(num).join(", ")})`;
}

export function cssEasingValue(e: Easing): string {
  return e.css ?? formatBezier(e.bezier);
}

const NUMBER = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)`;
const BEZIER_RE = new RegExp(
  String.raw`^(?:cubic-bezier\(\s*(${NUMBER}(?:\s*,\s*${NUMBER}){3})\s*\)|(${NUMBER}(?:\s*,\s*${NUMBER}){3}))$`,
  "i",
);

/** "cubic-bezier(a, b, c, d)" または "a, b, c, d" を解釈する。x1 / x2 は 0〜1 */
export function parseBezier(input: string): Bezier | null {
  const m = BEZIER_RE.exec(input.trim());
  if (!m) return null;
  const nums = (m[1] ?? m[2]).split(",").map((s) => Number(s.trim()));
  if (nums.length !== 4 || !nums.every(Number.isFinite)) return null;
  const [x1, y1, x2, y2] = nums;
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return null;
  return [x1, y1, x2, y2];
}

export function gsapEaseName(e: Easing): string {
  return e.gsap ?? e.id;
}

/** GSAP に同等のネイティブイージングがなく、CustomEase が必要か */
export function needsCustomEase(e: Easing): boolean {
  return !e.gsap;
}

/** CustomEase.create に渡す文字列 "x1,y1,x2,y2" */
export function customEaseData(e: Easing): string {
  return e.bezier.map(num).join(",");
}
