"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

type Props = {
  value: number;
  /** 確定時（blur / Enter）に呼ばれる。false を返すと入力を元に戻す */
  onCommit: (value: number) => boolean | void;
  "aria-label": string;
  step?: number;
  className?: string;
};

/** 入力中は反映せず、確定時にだけ値を渡す数値入力 */
export function NumberInput({ value, onCommit, step, className, ...aria }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onCommit(n);
    setDraft(null);
  };

  return (
    <input
      type="number"
      aria-label={aria["aria-label"]}
      step={step}
      value={draft ?? String(value)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") setDraft(null);
      }}
      className={cn(
        "h-8 w-full rounded border border-border bg-surface px-2 text-right font-mono text-xs tabular-nums text-foreground outline-none focus:border-accent",
        className,
      )}
    />
  );
}
