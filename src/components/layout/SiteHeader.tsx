import Link from "next/link";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[90vw] items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-bold tracking-tight whitespace-nowrap">
          <span aria-hidden className="grid size-6 place-items-center rounded bg-accent text-accent-foreground">
            <svg viewBox="0 0 16 16" className="size-3.5">
              <path d="M3 12c2-6 4-8 5-8s3 2 5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          Animation Maker
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
