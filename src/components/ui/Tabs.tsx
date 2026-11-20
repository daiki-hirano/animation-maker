"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/utils/cn";

export type TabItem<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  items: ReadonlyArray<TabItem<T>>;
  value: T;
  onValueChange: (value: T) => void;
  "aria-label": string;
  /** 各タブが制御するパネルの id 接頭辞 */
  idPrefix: string;
};

/** タブ切り替え（←→キー対応） */
export function Tabs<T extends string>({
  items,
  value,
  onValueChange,
  idPrefix,
  ...aria
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + items.length) % items.length;
    onValueChange(items[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={aria["aria-label"]}
      className="flex gap-1 border-b border-border"
    >
      {items.map((item, i) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${item.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "-mb-px cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-accent",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
