"use client";

import { useState } from "react";
import { Checkbox, CodeBlock, Field, SegmentedControl, Tabs, TextField } from "@/components/ui";
import type { ConfigUpdater } from "@/hooks/useAnimationConfig";
import type { Easing } from "@/utils/animation/easings";
import type { AnimationConfig, TriggerMode } from "@/utils/animation/types";
import { generateCode, MARKUP_FORMATS, type MarkupFormat } from "@/utils/codegen";

const MARKUP_FILENAME: Record<MarkupFormat, (config: AnimationConfig) => string> = {
  html: () => "index.html",
  pug: () => "index.pug",
  react: (c) => (c.target.type === "image" ? "AnimatedImage.tsx" : "AnimatedText.tsx"),
};

/** 実装方式（エンジン + CSS の方式をまとめた選択肢） */
type Implementation = "transition" | "keyframes" | "gsap";

/** クラス名として使える文字だけ残す */
const sanitizeClass = (v: string) => v.replace(/[^\w-]/g, "");

type Props = {
  config: AnimationConfig;
  update: ConfigUpdater;
  easing: Easing;
};

export function CodeOutput({ config, update, easing }: Props) {
  const [format, setFormat] = useState<MarkupFormat>("html");
  const code = generateCode(config, format, easing);
  const isGsap = config.engine === "gsap";
  const implementation: Implementation = isGsap ? "gsap" : config.cssMethod;
  const { trigger } = config;

  const onImplementationChange = (value: Implementation) => {
    if (value === "gsap") {
      update("engine", "gsap");
      return;
    }
    update("engine", "css");
    update("cssMethod", value);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">コード</h2>
      </div>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <Field label="実装方式" className="w-72">
          <SegmentedControl<Implementation>
            aria-label="実装方式"
            value={implementation}
            onValueChange={onImplementationChange}
            options={[
              { value: "transition", label: "transition" },
              { value: "keyframes", label: "@keyframes" },
              { value: "gsap", label: "GSAP" },
            ]}
          />
        </Field>

        <Field label="発火タイミング" className={isGsap ? "w-72" : "w-64"}>
          <SegmentedControl<TriggerMode>
            aria-label="発火タイミング"
            value={trigger.mode}
            onValueChange={(mode) => update("trigger", { mode })}
            options={[
              { value: "load", label: "読み込み時" },
              { value: "class", label: isGsap ? "任意のタイミング" : "クラス付与時" },
            ]}
          />
        </Field>

        {config.target.type === "image" && (
          <Checkbox
            label="figure で囲む"
            hint="img ではなく figure にアニメーションをかけます"
            checked={config.target.image.wrapper}
            onCheckedChange={(wrapper) =>
              update("target", { image: { ...config.target.image, wrapper } })
            }
          />
        )}

        {!isGsap && trigger.mode === "class" && (
          <div className="w-44">
            <TextField
              label="付与するクラス名"
              value={trigger.className}
              spellCheck={false}
              className="font-mono"
              onValueChange={(v) => {
                const className = sanitizeClass(v);
                if (className) update("trigger", { className });
              }}
            />
          </div>
        )}
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
          <ul className="flex flex-col gap-1 text-sm leading-relaxed">
            {code.notes.map((n) => (
              <li key={n}>・{n}</li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CodeBlock filename={MARKUP_FILENAME[format](config)} code={code.markup} />
          <CodeBlock filename={format === "react" ? "anim.css" : "style.css"} code={code.css} />
          {code.js && (
            <div className="min-w-0 lg:col-span-2">
              <CodeBlock filename="main.js" code={code.js} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
