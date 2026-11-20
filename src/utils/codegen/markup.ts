import type { AnimationConfig } from "@/utils/animation/types";
import { TARGET_CLASS } from "./constants";
import { escapeHtml } from "./format";

export function buildHtml(config: AnimationConfig): string {
  const { target } = config;
  if (target.type === "image") {
    const attrs = `src="${escapeHtml(target.image.src)}" alt="${escapeHtml(target.image.alt)}"`;
    if (target.image.wrapper) {
      return `<figure class="${TARGET_CLASS}">\n  <img ${attrs}>\n</figure>`;
    }
    return `<img class="${TARGET_CLASS}" ${attrs}>`;
  }
  return `<${target.tag} class="${TARGET_CLASS}">${escapeHtml(target.text)}</${target.tag}>`;
}

export function buildPug(config: AnimationConfig): string {
  const { target } = config;
  if (target.type === "image") {
    const attrs = `(src=${JSON.stringify(target.image.src)} alt=${JSON.stringify(target.image.alt)})`;
    if (target.image.wrapper) {
      return `figure.${TARGET_CLASS}\n  img${attrs}`;
    }
    return `img.${TARGET_CLASS}${attrs}`;
  }
  // #{ / !{ は Pug の補間になるのでエスケープ
  const text = target.text.replace(/([#!])\{/g, "\\$1{");
  return `${target.tag}.${TARGET_CLASS} ${text}`;
}
