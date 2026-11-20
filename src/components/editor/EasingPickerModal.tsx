"use client";

import { EasingCurve } from "@/components/easing/EasingCurve";
import { EasingList } from "@/components/easing/EasingList";
import { Modal } from "@/components/ui";
import { cssEasingValue, type Easing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { AnimationPreview } from "./AnimationPreview";

type Props = {
  open: boolean;
  onClose: () => void;
  config: AnimationConfig;
  easings: Easing[];
  /** 解決済みの選択中イージング */
  easing: Easing;
  onSelect: (id: string) => void;
  imageSrc?: string;
};

/** イージングを選ぶモーダル。左: カーブと現在の設定でのプレビュー / 右: 一覧 */
export function EasingPickerModal({
  open,
  onClose,
  config,
  easings,
  easing,
  onSelect,
  imageSrc,
}: Props) {
  return (
    <Modal title="イージングを選択" size="lg" open={open} onClose={onClose}>
      <div className="grid h-[min(620px,calc(100vh-10rem))] grid-cols-[320px_minmax(0,1fr)] grid-rows-1 gap-6">
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface px-3 py-3 text-foreground">
            <EasingCurve variant="large" bezier={easing.bezier} />
            <span className="text-sm font-semibold">{easing.name}</span>
            <span className="max-w-full font-mono text-[11px] break-all text-muted">
              {cssEasingValue(easing)}
            </span>
          </div>
          {/* 開いている間だけマウントして、裏でアニメーションを回さない */}
          {open && (
            <AnimationPreview
              variant="compact"
              defaultLoop
              config={config}
              easing={easing}
              imageSrc={imageSrc}
            />
          )}
        </div>
        <div className="min-h-0 overflow-y-auto pr-1">
          <EasingList
            easings={easings}
            selectedId={easing.id}
            onSelect={onSelect}
            columns={2}
            showCreateLink
          />
        </div>
      </div>
    </Modal>
  );
}
