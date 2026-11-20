"use client";

import { useId, type ReactNode } from "react";

type Props = {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hint?: ReactNode;
  disabled?: boolean;
};

export function Checkbox({ label, checked, onCheckedChange, hint, disabled }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="size-4 cursor-pointer accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
        />
        <label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-foreground has-[:disabled]:cursor-not-allowed"
        >
          {label}
        </label>
      </div>
      {hint && <p className="text-xs leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}
