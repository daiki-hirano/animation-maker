"use client";

import { useState } from "react";
import { Button, RangeField } from "@/components/ui";
import { cssEasingValue, type Easing } from "@/utils/animation/easings";

const SQUARE = "2.5rem";

function Track({
  label,
  easing,
  duration,
  atEnd,
}: {
  label: string;
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
            background: "var(--accent)",
            left: atEnd ? `calc(100% - ${SQUARE} - 0.25rem)` : "0.25rem",
            transition: `left ${duration}s ${cssEasingValue(easing)}`,
          }}
        />
      </div>
    </div>
  );
}

/** 現在のイージングで動かして確認する */
export function EasingPreview({ current }: { current: Easing }) {
  const [duration, setDuration] = useState(1);
  const [atEnd, setAtEnd] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Track
        label={current.name.trim() || "（名前なし）"}
        easing={current}
        duration={duration}
        atEnd={atEnd}
      />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
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
