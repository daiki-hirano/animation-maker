import { Button } from "@/components/ui";
import type { Easing } from "@/utils/animation/easings";
import { EasingList } from "./EasingList";

type Props = {
  easings: Easing[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

/** 保存済みイージングの一覧 */
export function EasingLibrary({ easings, selectedId, onSelect, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">イージング一覧</h2>
        <Button variant="primary" onClick={onCreate}>
          ＋ 新規作成
        </Button>
      </div>

      <EasingList easings={easings} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
