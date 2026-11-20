"use client";

import Link from "next/link";
import { EasingCurve } from "@/components/easing/EasingCurve";
import { PanelSection, RangeField, Select, Switch } from "@/components/ui";
import {
  EASING_GROUP_LABELS,
  cssEasingValue,
  gsapEaseName,
  needsCustomEase,
  resolveEasing,
} from "@/utils/animation/easings";
import type {
  KeyframesDirection,
  KeyframesFillMode,
  TransitionPropertyMode,
} from "@/utils/animation/types";
import { useEasings } from "@/hooks/useEasings";
import type { SectionProps } from "./types";

const DIRECTIONS: KeyframesDirection[] = ["normal", "reverse", "alternate", "alternate-reverse"];
const FILL_MODES: KeyframesFillMode[] = ["none", "forwards", "backwards", "both"];

export function TimingSection({ config, update }: SectionProps) {
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
      <Select
        label="easing"
        value={easing.id}
        onValueChange={(id) => update("timing", { easing: id })}
        options={easings.map((e) => ({
          value: e.id,
          label: e.name,
          group: EASING_GROUP_LABELS[e.group],
        }))}
        hint={easingHint}
      />
      <div className="flex items-center gap-3">
        <span className="rounded border border-border bg-surface p-0.5 text-foreground">
          <EasingCurve bezier={easing.bezier} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-mono text-[11px] text-muted">
            {cssEasingValue(easing)}
          </span>
          <Link
            href="/easings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
          >
            イージングを管理
          </Link>
        </div>
      </div>

      {!isGsap && cssMethod === "transition" && (
        <Select<TransitionPropertyMode>
          label="transition-property"
          value={config.transition.property}
          onValueChange={(property) => update("transition", { property })}
          options={[
            { value: "auto", label: "自動（変化するプロパティのみ）" },
            { value: "all", label: "all" },
          ]}
        />
      )}

      {!isGsap && cssMethod === "keyframes" && (
        <>
          <Switch
            label="無限に繰り返す（infinite）"
            checked={keyframes.iterationCount === 0}
            onCheckedChange={(on) => update("keyframes", { iterationCount: on ? 0 : 1 })}
          />
          {keyframes.iterationCount !== 0 && (
            <RangeField
              label="iteration-count"
              unit="回"
              min={1}
              max={10}
              value={keyframes.iterationCount}
              onValueChange={(iterationCount) => update("keyframes", { iterationCount })}
            />
          )}
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
