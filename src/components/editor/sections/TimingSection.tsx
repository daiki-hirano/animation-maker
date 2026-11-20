"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EasingCurve } from "@/components/easing/EasingCurve";
import { Field, PanelSection, RangeField, Select, Switch } from "@/components/ui";
import {
  cssEasingValue,
  gsapEaseName,
  needsCustomEase,
  resolveEasing,
} from "@/utils/animation/easings";
import type {
  KeyframesDirection,
  KeyframesFillMode,
} from "@/utils/animation/types";
import { useEasings } from "@/hooks/useEasings";
import { EasingPickerModal } from "../EasingPickerModal";
import type { SectionProps } from "./types";

const DIRECTIONS: KeyframesDirection[] = ["normal", "reverse", "alternate", "alternate-reverse"];
const FILL_MODES: KeyframesFillMode[] = ["none", "forwards", "backwards", "both"];

type Props = SectionProps & {
  /** ローカル選択画像の object URL（イージング選択モーダルのプレビュー用） */
  imageSrc?: string;
};

export function TimingSection({ config, update, imageSrc }: Props) {
  const easingButtonId = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { timing, engine, cssMethod, keyframes, gsap } = config;
  const isGsap = engine === "gsap";
  const easings = useEasings();
  const { easing, missing } = resolveEasing(timing.easing, easings);
  const easingHint = missing
    ? "選択中のイージングが見つからないため ease-out を使用しています。"
    : isGsap
      ? needsCustomEase(easing)
        ? "GSAP では CustomEase プラグインで出力します。"
        : `GSAP では "${gsapEaseName(easing)}" として出力します。`
      : undefined;

  return (
    <PanelSection title="タイミング">
      <RangeField
        label="duration"
        unit="s"
        min={0}
        max={5}
        step={0.05}
        value={timing.duration}
        onValueChange={(duration) => update("timing", { duration })}
      />
      <RangeField
        label="delay"
        unit="s"
        min={0}
        max={5}
        step={0.05}
        value={timing.delay}
        onValueChange={(delay) => update("timing", { delay })}
      />
      <Field label="easing" htmlFor={easingButtonId} hint={easingHint}>
        <button
          id={easingButtonId}
          type="button"
          aria-haspopup="dialog"
          onClick={() => setPickerOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-2 py-1.5 text-left text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="rounded border border-border bg-surface p-0.5">
            <EasingCurve bezier={easing.bezier} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{easing.name}</span>
            <span className="truncate font-mono text-[11px] text-muted">
              {cssEasingValue(easing)}
            </span>
          </span>
          <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
        </button>
      </Field>
      <Link
        href="/easings"
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-xs text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
      >
        イージングを管理
      </Link>
      <EasingPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        config={config}
        easings={easings}
        easing={easing}
        onSelect={(id) => update("timing", { easing: id })}
        imageSrc={imageSrc}
      />

      {!isGsap && cssMethod === "keyframes" && (
        <>
          <Switch
            label="無限に繰り返す（infinite）"
            checked={keyframes.iterationCount === 0}
            onCheckedChange={(on) => update("keyframes", { iterationCount: on ? 0 : 1 })}
          />
          <Select<KeyframesDirection>
            label="direction"
            value={keyframes.direction}
            onValueChange={(direction) => update("keyframes", { direction })}
            options={DIRECTIONS.map((d) => ({ value: d, label: d }))}
          />
          <Select<KeyframesFillMode>
            label="fill-mode"
            value={keyframes.fillMode}
            onValueChange={(fillMode) => update("keyframes", { fillMode })}
            options={FILL_MODES.map((d) => ({ value: d, label: d }))}
          />
        </>
      )}

      {isGsap && (
        <>
          <Switch
            label="無限に繰り返す（repeat: -1）"
            checked={gsap.repeat === -1}
            onCheckedChange={(on) => update("gsap", { repeat: on ? -1 : 0 })}
          />
          {gsap.repeat !== -1 && (
            <RangeField
              label="repeat"
              unit="回"
              min={0}
              max={10}
              value={gsap.repeat}
              onValueChange={(repeat) => update("gsap", { repeat })}
            />
          )}
          <Switch
            label="yoyo（往復）"
            checked={gsap.yoyo}
            disabled={gsap.repeat === 0}
            hint={gsap.repeat === 0 ? "repeat が 1 以上のとき有効です。" : undefined}
            onCheckedChange={(yoyo) => update("gsap", { yoyo })}
          />
        </>
      )}
    </PanelSection>
  );
}
