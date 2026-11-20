import { Button } from "@/components/ui";
import {
  EASING_GROUP_LABELS,
  formatBezier,
  type Easing,
  type EasingGroup,
} from "@/utils/animation/easings";
import { cn } from "@/utils/cn";
import { EasingCurve } from "./EasingCurve";

const GROUP_ORDER: EasingGroup[] = ["standard", "gsap", "custom"];

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

      <div className="flex flex-col gap-4">
        {GROUP_ORDER.map((group) => {
          const items = easings.filter((e) => e.group === group);
          return (
            <section key={group} aria-label={EASING_GROUP_LABELS[group]}>
              <h3 className="mb-1.5 px-1 text-xs font-semibold text-muted">
                {EASING_GROUP_LABELS[group]}
              </h3>
              {items.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
                  まだカスタムイージングはありません
                </p>
              ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                  {items.map((e) => {
                    const selected = e.id === selectedId;
                    return (
                      <li key={e.id} className="min-w-0">
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(e.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 rounded-lg border px-2 py-1.5 text-left transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                            selected
                              ? "border-accent bg-surface-muted"
                              : "border-transparent hover:bg-surface-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "rounded border border-border bg-surface p-0.5",
                              selected ? "text-accent" : "text-foreground",
                            )}
                          >
                            <EasingCurve bezier={e.bezier} />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium">{e.name}</span>
                            <span className="truncate font-mono text-[11px] text-muted">
                              {formatBezier(e.bezier)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
