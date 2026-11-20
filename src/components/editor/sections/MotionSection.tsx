"use client";

import { useId, useState } from "react";
import { Button, PanelSection, RangeField, SegmentedControl } from "@/components/ui";
import { NEUTRAL_STATE } from "@/utils/animation/defaults";
import type { MotionKey, MotionState, TranslateUnit } from "@/utils/animation/types";
import { useSliderRanges } from "@/hooks/useSliderRanges";
import type { RangeKey } from "@/utils/settings/slider-ranges";
import { RangeSettings } from "./RangeSettings";
import type { SectionProps } from "./types";

type Phase = "from" | "to";

type FieldDef = {
  key: MotionKey;
  label: string;
  step: number;
  unit?: string;
  /** スライダー範囲の設定キー（なければ固定範囲） */
  range: RangeKey | { min: number; max: number };
};

function fieldsFor(unit: TranslateUnit): FieldDef[] {
  const translateRange: RangeKey = unit === "%" ? "translatePercent" : "translatePx";
  return [
    { key: "opacity", label: "opacity", step: 0.01, range: { min: 0, max: 1 } },
    { key: "x", label: "translateX", step: 1, unit, range: translateRange },
    { key: "y", label: "translateY", step: 1, unit, range: translateRange },
    { key: "scale", label: "scale", step: 0.01, range: "scale" },
    { key: "rotate", label: "rotate", step: 1, unit: "deg", range: "rotate" },
    { key: "blur", label: "blur", step: 0.5, unit: "px", range: "blur" },
  ];
}

export function MotionSection({ config, update }: SectionProps) {
  const [phase, setPhase] = useState<Phase>("from");
  const [showRanges, setShowRanges] = useState(false);
  const rangesId = useId();
  const ranges = useSliderRanges();
  const state = config[phase];

  const set = (patch: Partial<MotionState>) => update(phase, patch);

  return (
    <PanelSection title="動き">
      <SegmentedControl<Phase>
        aria-label="編集する状態"
        value={phase}
        onValueChange={setPhase}
        options={[
          { value: "from", label: "開始状態" },
          { value: "to", label: "終了状態" },
        ]}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted">translate の単位</span>
        <SegmentedControl<TranslateUnit>
          aria-label="translate の単位"
          className="w-32"
          value={config.translateUnit}
          onValueChange={(translateUnit) => update("translateUnit", translateUnit)}
          options={[
            { value: "px", label: "px" },
            { value: "%", label: "%" },
          ]}
        />
      </div>

      {fieldsFor(config.translateUnit).map((f) => {
        const { min, max } = typeof f.range === "string" ? ranges[f.range] : f.range;
        return (
          <RangeField
            key={f.key}
            label={f.label}
            unit={f.unit}
            min={min}
            max={max}
            step={f.step}
            value={state[f.key]}
            onValueChange={(v) => set({ [f.key]: v })}
          />
        );
      })}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            update("from", config.to);
            update("to", config.from);
          }}
        >
          開始⇄終了を入れ替え
        </Button>
        <Button size="sm" variant="ghost" onClick={() => update(phase, NEUTRAL_STATE)}>
          この状態をリセット
        </Button>
      </div>

      <Button
        size="sm"
        variant="ghost"
        aria-expanded={showRanges}
        aria-controls={rangesId}
        onClick={() => setShowRanges((v) => !v)}
        className="self-start"
      >
        <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
          <path
            d="M2 4h7M13 4h1M2 12h1M7 12h7M11 2v4M5 10v4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        スライダーの範囲を設定
      </Button>
      {showRanges && <RangeSettings id={rangesId} />}
    </PanelSection>
  );
}
