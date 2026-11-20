import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimationEditor } from "@/components/editor/AnimationEditor";
import { getPreset, PRESETS } from "@/utils/animation/presets";

type Props = {
  params: Promise<{ id: string }>;
};

// データ取得がなく params を読むだけなので、Instant Navigation の検証から外す（ブロッキングを許可）
export const instant = false;

// Cache Components 有効時は dynamicParams を使えないため、未定義の id は notFound() で 404 にする
export function generateStaticParams() {
  return PRESETS.map((preset) => ({ id: preset.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const preset = getPreset(id);
  return {
    title: preset ? `${preset.name} | Animation Maker` : "プリセット | Animation Maker",
  };
}

export default async function PresetDetailPage({ params }: Props) {
  const { id } = await params;
  const preset = getPreset(id);
  if (!preset) notFound();

  return (
    // key: プリセット間を移動したときにエディタの状態をリセットする
    <AnimationEditor
      key={preset.id}
      title={preset.name}
      description={preset.description}
      initialConfig={preset.config}
      sections={preset.sections}
    />
  );
}
