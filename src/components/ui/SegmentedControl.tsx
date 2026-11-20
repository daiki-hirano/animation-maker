"use client";

import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean;
};

type Props<T extends string> = {
  value: T;
  options: ReadonlyArray<SegmentOption<T>>;
  onValueChange: (value: T) => void;
  "aria-label": string;
  className?: string;
};

/** 排他選択（ラジオグループ） */
export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  className,
  ...aria
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn("flex rounded-md bg-surface-muted p-0.5", className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={o.disabled}
            onClick={() => onValueChange(o.value)}
            className={cn(
              "h-8 flex-1 cursor-pointer rounded px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed",
              "focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
