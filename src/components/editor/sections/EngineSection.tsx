"use client";

import { Field, PanelSection, SegmentedControl } from "@/components/ui";
import type { CssMethod, Engine } from "@/utils/animation/types";
import type { SectionProps } from "./types";

export function EngineSection({ config, update }: SectionProps) {
  return (
    <PanelSection title="実装方式">
      <Field label="エンジン">
        <SegmentedControl<Engine>
          aria-label="エンジン"
          value={config.engine}
          onValueChange={(engine) => update("engine", engine)}
          options={[
            { value: "css", label: "CSS のみ" },
            { value: "gsap", label: "GSAP を使用" },
          ]}
        />
      </Field>

      {config.engine === "css" && (
        <Field
          label="CSS の方式"
          hint={
            config.cssMethod === "transition"
              ? "クラスの付け外しで状態を切り替えます。"
              : "@keyframes で開始→終了を再生します。繰り返しも可能です。"
          }
        >
          <SegmentedControl<CssMethod>
            aria-label="CSS の方式"
            value={config.cssMethod}
            onValueChange={(cssMethod) => update("cssMethod", cssMethod)}
            options={[
              { value: "transition", label: "transition" },
              { value: "keyframes", label: "@keyframes" },
            ]}
          />
        </Field>
      )}
    </PanelSection>
  );
}
