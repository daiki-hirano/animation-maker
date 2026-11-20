import Link from "next/link";
import {
  EASING_GROUP_LABELS,
  formatBezier,
  type Easing,
  type EasingGroup,
} from "@/utils/animation/easings";
import { cn } from "@/utils/cn";
import { EasingCurve } from "./EasingCurve";

const GROUP_ORDER: EasingGroup[] = ["standard", "easings", "custom"];

/** auto: 幅に応じて自動で列を増やす / 2: 2 列固定 */
const COLUMNS = {
  auto: "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]",
  2: "grid-cols-2",
} as const;

type Props = {
  easings: Easing[];
  selectedId: string;
  onSelect: (id: string) => void;
  columns?: keyof typeof COLUMNS;
  /** カスタムが 0 件のとき「イージングを作成」リンクを出す */
  showCreateLink?: boolean;
  className?: string;
};

/** グループ別のイージング一覧（選択ボタンのリスト） */
export function EasingList({
  easings,
  selectedId,
  onSelect,
  columns = "auto",
  showCreateLink = false,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
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
                {showCreateLink && (
                  <>
                    <br />
                    <Link
                      href="/easings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      イージングを作成
                    </Link>
                  </>
                )}
              </p>
            ) : (
              <ul className={cn("grid gap-2", COLUMNS[columns])}>
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
  );
}
