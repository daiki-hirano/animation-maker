"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Field, inputClass } from "./Field";

type Props = Omit<ComponentProps<"input">, "onChange"> & {
  label: ReactNode;
  hint?: ReactNode;
  onValueChange: (value: string) => void;
};

export function TextField({ label, hint, onValueChange, className, ...props }: Props) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="text"
        className={cn(inputClass, className)}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      />
    </Field>
  );
}
