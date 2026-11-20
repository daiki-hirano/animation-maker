import type { ReactNode } from "react";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

/**
 * エディタ画面のレイアウト
 * - 左: プレビュー / 右: コントロールパネル（ヘッダー固定 + 本体スクロール）
 * - 下: コード表示
 * 新規作成・プリセットの両方で使う
 */
export function EditorLayout({
  title,
  description,
  preview,
  panelHeader,
  panel,
  code,
}: {
  title: string;
  description?: string;
  preview: ReactNode;
  /** パネル上部に固定表示するヘッダー */
  panelHeader: ReactNode;
  /** パネル本体（はみ出した分はスクロールする） */
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
        {/* コード表示までの距離を短くするため、パネルは最大 800px でスクロールさせ、ヘッダーは固定する。
            lg:self-start でグリッド行の高さに引き伸ばされず、内容が短いときは内容の高さになる */}
        <aside
          aria-label="アニメーションプロパティ"
          className="flex max-h-[800px] flex-col overflow-hidden rounded-xl border border-border bg-surface lg:self-start"
        >
          <div className="shrink-0 border-b border-border">{panelHeader}</div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{panel}</div>
        </aside>
      </div>

      <section aria-label="コード" className="min-w-0">
        {code}
      </section>
    </PageContainer>
  );
}
