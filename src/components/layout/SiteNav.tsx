"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/create", label: "新規作成", ready: true },
  { href: "/easings", label: "イージング", ready: true },
  { href: "/presets", label: "プリセット", ready: true },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="メイン">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const base =
            "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap transition-colors sm:px-3";
          return (
            <li key={item.href}>
              {item.ready ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    base,
                    active
                      ? "bg-surface-muted font-medium text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(base, "cursor-not-allowed text-muted/60")}>
                  {item.label}
                  <span className="hidden rounded bg-surface-muted px-1.5 py-0.5 text-[11px] sm:inline">準備中</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
