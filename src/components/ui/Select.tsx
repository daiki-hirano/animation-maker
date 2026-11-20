"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Field, inputClass } from "./Field";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
  /** 指定すると <optgroup> でまとめて表示する */
  group?: string;
};

type Props<T extends string> = {
  label: ReactNode;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onValueChange: (value: T) => void;
  hint?: ReactNode;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onValueChange,
  hint,
}: Props<T>) {
  const id = useId();
  const renderOption = (o: SelectOption<T>) => (
    <option key={o.value} value={o.value} disabled={o.disabled}>
      {o.label}
    </option>
  );
  const hasGroup = options.some((o) => o.group);
  // グループは初出順。グループなしの選択肢は先頭にそのまま並べる
  const groups = hasGroup
    ? Array.from(new Set(options.flatMap((o) => (o.group ? [o.group] : []))))
    : [];
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <select
          id={id}
          className={cn(inputClass, "cursor-pointer appearance-none pr-8")}
          value={value}
          onChange={(e) => onValueChange(e.target.value as T)}
        >
          {hasGroup ? (
            <>
              {options.filter((o) => !o.group).map(renderOption)}
              {groups.map((g) => (
                <optgroup key={g} label={g}>
                  {options.filter((o) => o.group === g).map(renderOption)}
                </optgroup>
              ))}
            </>
          ) : (
            options.map(renderOption)
          )}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </Field>
  );
}
