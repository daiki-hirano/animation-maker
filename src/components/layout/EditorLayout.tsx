import type { ReactNode } from "react";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

/**
 * エディタ画面のレイアウト
 * - 左: プレビュー / 右: コントロールパネル
 * - 下: コード表示
 * 新規作成・プリセットの両方で使う
 */
export function EditorLayout({
  title,
  description,
  preview,
  panel,
  code,
}: {
  title: string;
  description?: string;
  preview: ReactNode;
  panel: ReactNode;
  code: ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="プレビュー" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          {preview}
        </section>
        <aside
          aria-label="アニメーションプロパティ"
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          {panel}
        </aside>
      </div>

      <section aria-label="コード" className="min-w-0">
        {code}
      </section>
    </PageContainer>
  );
}
