"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { AnimationConfig } from "@/utils/animation/types";
import { PresetThumbnail } from "./PresetThumbnail";

type Props = {
  title: string;
  href: string;
  /** サムネイル表示用にライブ再生するアニメーション設定 */
  config: AnimationConfig;
  /** アニメーション GIF のパス。未指定ならカード内でライブ再生する */
  thumbnail?: string;
};

/** プリセット一覧のカード（サムネイル + タイトル）。ホバー / フォーカス中だけサムネイルを再生する */
export function PresetCard({ title, href, config, thumbnail }: Props) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        {thumbnail ? (
          <Image src={thumbnail} alt={title} fill unoptimized className="object-cover" />
        ) : (
          <PresetThumbnail config={config} playing={active} />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
    </Link>
  );
}
