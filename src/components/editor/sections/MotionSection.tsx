"use client";

import { Fragment, useState } from "react";
import { Button, Modal, PanelSection, RangeField, SegmentedControl } from "@/components/ui";
import { isMirrored } from "@/utils/animation/motion";
import type {
  MaskDirection,
  MotionKey,
  MotionState,
  TranslateUnit,
} from "@/utils/animation/types";
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
    { key: "opacity", label: "opacity", step: 0.1, range: { min: 0, max: 1 } },
    { key: "x", label: "translateX", step: 1, unit, range: translateRange },
    { key: "y", label: "translateY", step: 1, unit, range: translateRange },
    { key: "scale", label: "scale", step: 0.01, range: "scale" },
    { key: "rotate", label: "rotate", step: 1, unit: "deg", range: "rotate" },
    { key: "blur", label: "blur", step: 0.5, unit: "px", range: "blur" },
    { key: "mask", label: "mask-position", step: 1, unit: "%", range: { min: 0, max: 100 } },
  ];
}

export function MotionSection({ config, update }: SectionProps) {
  const [phase, setPhase] = useState<Phase>("from");
  const [showRanges, setShowRanges] = useState(false);
  const ranges = useSliderRanges();
  const state = config[phase];

  const set = (patch: Partial<MotionState>) => update(phase, patch);

  const changeMaskDirection = (next: MaskDirection) => {
    update("maskDirection", next);
    // 反転する向き（right / bottom）をまたぐときは、アニメーションの意味が変わらないよう値を反転する
    if (isMirrored(config.maskDirection) !== isMirrored(next)) {
      update("from", { mask: 100 - config.from.mask });
      update("to", { mask: 100 - config.to.mask });
    }
  };

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
          <Fragment key={f.key}>
            {f.key === "mask" && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted">mask の向き</span>
                <SegmentedControl<MaskDirection>
                  aria-label="mask の向き"
                  value={config.maskDirection}
                  onValueChange={changeMaskDirection}
                  options={[
                    { value: "left", label: "左から" },
                    { value: "right", label: "右から" },
                    { value: "top", label: "上から" },
                    { value: "bottom", label: "下から" },
                  ]}
                />
              </div>
            )}
            <RangeField
              label={f.label}
              unit={f.unit}
              min={min}
              max={max}
              step={f.step}
              value={state[f.key]}
              onValueChange={(v) => set({ [f.key]: v })}
            />
          </Fragment>
        );
      })}

      <Button
        size="sm"
        variant="ghost"
        aria-haspopup="dialog"
        onClick={() => setShowRanges(true)}
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
      <Modal title="スライダーの範囲" open={showRanges} onClose={() => setShowRanges(false)}>
        <RangeSettings />
      </Modal>
    </PanelSection>
  );
}
