import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PresetCard } from "@/components/preset/PresetCard";
import { PRESETS } from "@/utils/animation/presets";

export const metadata: Metadata = {
  title: "プリセット | Animation Maker",
};

export default function PresetsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="プリセット"
        description="用意されたアニメーションを選んで、パラメータを調整できます。"
      />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {PRESETS.map((preset) => (
          <li key={preset.id}>
            <PresetCard
              title={preset.name}
              href={`/presets/${preset.id}`}
              thumbnail={preset.thumbnail}
              config={preset.config}
            />
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
