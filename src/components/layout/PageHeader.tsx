import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  /** md: 各ページ共通 / lg: トップページ用 */
  size?: "md" | "lg";
};

/** ページの見出し（タイトルと説明文） */
export function PageHeader({ title, description, size = "md" }: Props) {
  if (size === "lg") {
    return (
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-muted">{description}</p>}
      </header>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}
