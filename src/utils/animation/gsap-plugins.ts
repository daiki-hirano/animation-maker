import type { TargetType } from "./types";

/**
 * GSAP プラグイン定義。新しいプラグインはここに追加し、
 * codegen/script.ts と preview 側の分岐を足す。
 */
export const GSAP_PLUGINS = [
  {
    id: "none",
    label: "なし",
    importName: null,
    importPath: null,
    targets: ["text", "image"],
  },
  {
    id: "splitText",
    label: "SplitText",
    importName: "SplitText",
    importPath: "gsap/SplitText",
    targets: ["text"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  importName: string | null;
  importPath: string | null;
  targets: ReadonlyArray<TargetType>;
}>;

export type GsapPluginId = (typeof GSAP_PLUGINS)[number]["id"];

export function getGsapPlugin(id: GsapPluginId) {
  return GSAP_PLUGINS.find((p) => p.id === id) ?? GSAP_PLUGINS[0];
}

export function isPluginAvailable(id: GsapPluginId, target: TargetType) {
  return (getGsapPlugin(id).targets as ReadonlyArray<TargetType>).includes(
    target,
  );
}
