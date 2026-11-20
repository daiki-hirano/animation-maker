import type { Bezier, Easing } from "@/utils/animation/easings";
import { createLocalStore } from "./local-store";

/**
 * ユーザーが作成したカスタムイージング。
 * アニメーションの設定値ではなくエディタ側の資産なので、localStorage に保存する。
 */

const ID_PATTERN = /^[a-zA-Z0-9-]+$/;

function isBezier(v: unknown): v is Bezier {
  return (
    Array.isArray(v) &&
    v.length === 4 &&
    v.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    v[0] >= 0 &&
    v[0] <= 1 &&
    v[2] >= 0 &&
    v[2] <= 1
  );
}

function parse(raw: unknown): Easing[] {
  if (!Array.isArray(raw)) return [];
  const result: Easing[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const { id, name, bezier } = item as Record<string, unknown>;
    if (typeof id !== "string" || !ID_PATTERN.test(id)) continue;
    if (typeof name !== "string") continue;
    if (!isBezier(bezier)) continue;
    result.push({ id, name, bezier: [...bezier] as Bezier, group: "custom" });
  }
  return result;
}

const EMPTY: Easing[] = [];

export const customEasingsStore = createLocalStore<Easing[]>({
  key: "animation-maker:custom-easings",
  parse,
  fallback: EMPTY,
});

function newId() {
  const rand = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
  return `custom-${Date.now().toString(36)}${rand}`;
}

export function addCustomEasing(input: { name: string; bezier: Bezier }): Easing {
  const easing: Easing = {
    id: newId(),
    name: input.name,
    bezier: input.bezier,
    group: "custom",
  };
  customEasingsStore.set([...customEasingsStore.get(), easing]);
  return easing;
}

export function updateCustomEasing(
  id: string,
  patch: { name?: string; bezier?: Bezier },
): void {
  customEasingsStore.set(
    customEasingsStore.get().map((e) =>
      e.id === id
        ? { ...e, name: patch.name ?? e.name, bezier: patch.bezier ?? e.bezier }
        : e,
    ),
  );
}

export function deleteCustomEasing(id: string): void {
  customEasingsStore.set(customEasingsStore.get().filter((e) => e.id !== id));
}
