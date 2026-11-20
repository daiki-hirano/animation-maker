import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** ラベル + 入力要素 + 補足テキスト */
export function Field({
  label,
  htmlFor,
  hint,
  aside,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  /** ラベル右側に置く要素（数値入力など） */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex min-h-6 items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent";
