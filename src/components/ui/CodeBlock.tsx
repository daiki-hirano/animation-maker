"use client";

import { CopyButton } from "./CopyButton";

type Props = {
  filename: string;
  code: string;
};

export function CodeBlock({ filename, code }: Props) {
  return (
    <figure className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <figcaption className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-muted">{filename}</span>
        <CopyButton text={code} />
      </figcaption>
      <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[14px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
