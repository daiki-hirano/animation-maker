import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

const CARDS = [
  {
    href: "/create",
    title: "新規作成",
    body: "テキストや画像に対して、CSS / GSAP のアニメーションを一から組み立てます。",
    ready: true,
  },
  {
    href: "/easings",
    title: "イージング",
    body: "カスタムイージングを作成・編集し、アニメーション作成で使えます。",
    ready: true,
  },
  {
    href: "/presets",
    title: "プリセット",
    body: "よく使うアニメーションを選んで、パラメータだけ調整します。",
    ready: false,
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-16 lg:px-6">
      <PageHeader
        size="lg"
        title="Animation Maker"
        description="アニメーションを UI で確認・調整し、HTML / Pug / React と SCSS・JS のコードをそのままコピーして使えます。"
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const inner = (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{card.title}</h2>
                {!card.ready && (
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[11px] text-muted">
                    準備中
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted">{card.body}</p>
            </>
          );
          const base = "flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-6";
          return (
            <li key={card.href}>
              {card.ready ? (
                <Link href={card.href} className={`${base} transition-colors hover:border-accent`}>
                  {inner}
                </Link>
              ) : (
                <div className={`${base} opacity-60`}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
