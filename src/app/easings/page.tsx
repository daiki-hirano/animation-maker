import type { Metadata } from "next";
import { EasingManager } from "@/components/easing/EasingManager";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "イージング | Animation Maker",
};

export default function EasingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="イージング"
        description="カスタムイージングを作成・編集できます。ここで保存したイージングはアニメーション作成で選択できます。"
      />
      <EasingManager />
    </PageContainer>
  );
}
