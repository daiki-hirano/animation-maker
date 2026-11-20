"use client";

import { useId, useState, type ReactNode } from "react";
import { Field } from "./Field";

type Props = {
  label: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: ReactNode;
  disabled?: boolean;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** step の小数桁数（0.1 → 1、0.05 → 2、1 → 0） */
const decimalsOf = (step: number) => {
  const s = String(step);
  if (s.includes("e-")) return parseInt(s.split("e-")[1], 10);
  return s.split(".")[1]?.length ?? 0;
};

/** step の小数桁数で丸める（浮動小数の誤差も除く） */
const roundTo = (n: number, step: number) => Number(n.toFixed(decimalsOf(step)));

/** スライダー + 数値入力 */
export function RangeField({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  unit,
  hint,
  disabled,
}: Props) {
  const id = useId();
  // 入力途中の "0." などを保持するための下書き
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      aside={
        <div className="flex items-center gap-1">
          <input
            type="number"
            aria-label={typeof label === "string" ? `${label}の値` : undefined}
            className="h-6 w-16 rounded border border-border bg-surface px-1.5 text-right font-mono text-xs tabular-nums text-foreground outline-none focus:border-accent disabled:opacity-50"
            value={draft ?? String(value)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = parseFloat(e.target.value);
              if (!Number.isNaN(n)) onValueChange(clamp(roundTo(n, step), min, max));
            }}
            onBlur={() => setDraft(null)}
          />
          {unit && <span className="w-5 text-xs text-muted">{unit}</span>}
        </div>
      }
    >
      <input
        id={id}
        type="range"
        className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onValueChange(roundTo(parseFloat(e.target.value), step))}
      />
    </Field>
  );
}
