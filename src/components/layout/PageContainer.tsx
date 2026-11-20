import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** ページの外枠（中央寄せ・最大幅 90vw） */
export function PageContainer({ children, className }: Props) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[90vw] flex-col gap-6 px-4 py-6 lg:px-6", className)}>
      {children}
    </div>
  );
}
