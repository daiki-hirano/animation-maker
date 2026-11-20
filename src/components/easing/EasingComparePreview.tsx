"use client";

import { useState } from "react";
import { Button, RangeField, Select } from "@/components/ui";
import {
  cssEasingValue,
  EASING_GROUP_LABELS,
  type Easing,
} from "@/utils/animation/easings";

const PINK = "#ec4899";
const SQUARE = "2.5rem";

function Track({
  label,
  color,
  easing,
  duration,
  atEnd,
}: {
  label: string;
  color: string;
  easing: Easing;
  duration: number;
  atEnd: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="truncate text-xs font-medium text-muted">{label}</p>
      <div className="relative h-12 overflow-hidden rounded-lg bg-surface-muted">
        <div className="absolute inset-x-2 top-1/2 h-px bg-border" aria-hidden />
        <div
          aria-hidden
          className="absolute top-1 rounded-md"
          style={{
            width: SQUARE,
            height: SQUARE,
            background: color,
            left: atEnd ? `calc(100% - ${SQUARE} - 0.25rem)` : "0.25rem",
            transition: `left ${duration}s ${cssEasingValue(easing)}`,
          }}
        />
      </div>
    </div>
  );
}

/** 現在のイージングと別のイージングを並べて動かして比べる */
export function EasingComparePreview({
  current,
  easings,
}: {
  current: Easing;
  easings: Easing[];
}) {
  const [compareId, setCompareId] = useState("linear");
  const [duration, setDuration] = useState(1);
  const [atEnd, setAtEnd] = useState(false);

  const compare =
    easings.find((e) => e.id === compareId) ??
    easings.find((e) => e.id === "linear") ??
    easings[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Track
          label={`現在: ${current.name.trim() || "（名前なし）"}`}
          color="var(--accent)"
          easing={current}
          duration={duration}
          atEnd={atEnd}
        />
        <Track
          label={`比較: ${compare.name}`}
          color={PINK}
          easing={compare}
          duration={duration}
          atEnd={atEnd}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Select
          label="比較するイージング"
          value={compare.id}
          onValueChange={setCompareId}
          options={easings.map((e) => ({
            value: e.id,
            label: e.name,
            group: EASING_GROUP_LABELS[e.group],
          }))}
        />
        <RangeField
          label="duration"
          unit="s"
          min={0.1}
          max={5}
          step={0.1}
          value={duration}
          onValueChange={setDuration}
        />
        <Button variant="primary" onClick={() => setAtEnd((v) => !v)}>
          再生
        </Button>
      </div>
    </div>
  );
}
