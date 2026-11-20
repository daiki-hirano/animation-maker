"use client";

import { Copy } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button } from "./Button";

type Props = {
  text: string;
  className?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
};

export function CopyButton({ text, className, size = "sm", variant = "ghost" }: Props) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={() => copy(text)}
      aria-live="polite"
    >
      <Copy aria-hidden className="size-3.5" />
      {copied ? "コピーしました" : "コピー"}
    </Button>
  );
}
