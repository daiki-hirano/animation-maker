"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** クリップボードへのコピーと、コピー済み表示の状態を扱う */
export function useCopyToClipboard(resetMs = 1500): {
  copied: boolean;
  copy: (text: string) => Promise<void>;
} {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      } catch {
        // クリップボードが使えない環境では何もしない
      }
    },
    [resetMs],
  );

  return { copied, copy };
}
