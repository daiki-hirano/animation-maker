"use client";

import { PanelSection, SegmentedControl, TextField } from "@/components/ui";
import type { TriggerMode } from "@/utils/animation/types";
import type { SectionProps } from "./types";

/** クラス名として使える文字だけ残す */
const sanitizeClass = (v: string) => v.replace(/[^\w-]/g, "");

export function TriggerSection({ config, update }: SectionProps) {
  const { trigger } = config;
  const startingStyle =
    config.engine === "css" && config.cssMethod === "transition" && trigger.mode === "load";

  return (
    <PanelSection title="発火タイミング">
      <SegmentedControl<TriggerMode>
        aria-label="発火タイミング"
        value={trigger.mode}
        onValueChange={(mode) => update("trigger", { mode })}
        options={[
          { value: "load", label: "読み込み時" },
          { value: "class", label: "クラス付与時" },
        ]}
      />

      {startingStyle && (
        <p className="text-xs leading-relaxed text-muted">
          @starting-style により、クラスなしで読み込み時に再生します。
        </p>
      )}

      {trigger.mode === "class" && (
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
      )}

      {trigger.mode === "class" && (
        <p className="text-xs leading-relaxed text-muted">
          クラスの付与は任意のタイミングで行ってください。
        </p>
      )}
    </PanelSection>
  );
}
