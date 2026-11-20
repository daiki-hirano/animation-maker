"use client";

import { useState } from "react";
import { CodeBlock, Tabs } from "@/components/ui";
import type { Easing } from "@/utils/animation/easings";
import type { AnimationConfig } from "@/utils/animation/types";
import { generateCode, MARKUP_FORMATS, type MarkupFormat } from "@/utils/codegen";

const MARKUP_FILENAME: Record<MarkupFormat, (config: AnimationConfig) => string> = {
  html: () => "index.html",
  pug: () => "index.pug",
  react: (c) => (c.target.type === "image" ? "AnimatedImage.tsx" : "AnimatedText.tsx"),
};

export function CodeOutput({ config, easing }: { config: AnimationConfig; easing: Easing }) {
  const [format, setFormat] = useState<MarkupFormat>("html");
  const code = generateCode(config, format, easing);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">コード</h2>
      </div>

      <Tabs<MarkupFormat>
        aria-label="マークアップ形式"
        idPrefix="code"
        items={MARKUP_FORMATS}
        value={format}
        onValueChange={setFormat}
      />

      <div
        id="code-panel"
        role="tabpanel"
        aria-labelledby={`code-tab-${format}`}
        className="flex flex-col gap-4"
      >
        {code.notes.length > 0 && (
          <ul className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted">
            {code.notes.map((n) => (
              <li key={n}>・{n}</li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="xl:col-span-2">
            <CodeBlock filename={MARKUP_FILENAME[format](config)} code={code.markup} />
          </div>
          <div className={format === "react" ? "xl:col-span-2" : undefined}>
            <CodeBlock filename={format === "react" ? "anim.scss" : "style.scss"} code={code.scss} />
          </div>
          {code.js ? (
            <CodeBlock filename="main.js" code={code.js} />
          ) : (
            format !== "react" && (
              <div className="grid place-items-center rounded-lg border border-dashed border-border p-6 text-xs text-muted">
                この設定では JS は不要です
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
