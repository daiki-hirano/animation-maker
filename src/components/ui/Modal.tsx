"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 幅。md: 420px / lg: 880px */
  size?: "md" | "lg";
  className?: string;
};

const SIZES = {
  md: "w-[420px]",
  lg: "w-[880px]",
} as const;

/** ネイティブの <dialog> を使ったモーダル（フォーカストラップ・Esc で閉じる・トップレイヤー表示） */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // open の状態をダイアログの開閉に同期する
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto max-h-[calc(100vh-4rem)] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl",
        // ダイアログ本体
        "invisible opacity-0 transition-[opacity,visibility,display,overlay] transition-discrete duration-200 ease-out open:visible open:opacity-100 starting:open:invisible starting:open:opacity-0 motion-reduce:transition-none",
        // ::backdrop
        "backdrop:invisible backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-[opacity,visibility,display,overlay] backdrop:transition-discrete backdrop:duration-200 backdrop:ease-out open:backdrop:visible open:backdrop:opacity-100 starting:open:backdrop:invisible starting:open:backdrop:opacity-0 motion-reduce:backdrop:transition-none",
        SIZES[size],
        className,
      )}>
      <div className="flex max-h-[calc(100vh-4rem)] flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-4">{children}</div>
      </div>
    </dialog>
  );
}
