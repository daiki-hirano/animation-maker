import type { ReactNode } from "react";

/** コントロールパネル内の折りたたみ可能なセクション */
export function PanelSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
        {title}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="size-4 text-muted transition-transform group-open:rotate-180"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </summary>
      <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>
    </details>
  );
}
