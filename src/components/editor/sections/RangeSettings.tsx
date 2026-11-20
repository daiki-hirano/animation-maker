"use client";

import { useState } from "react";
import { Button, NumberInput } from "@/components/ui";
import { useSliderRanges } from "@/hooks/useSliderRanges";
import {
  RANGE_FIELDS,
  resetSliderRanges,
  setSliderRange,
  type RangeKey,
} from "@/utils/settings/slider-ranges";

/** 「動き」スライダーの最小値 / 最大値を編集する */
export function RangeSettings() {
  const ranges = useSliderRanges();
  const [error, setError] = useState<{ key: RangeKey; message: string } | null>(null);

  const commit = (key: RangeKey, edge: "min" | "max", value: number) => {
    const field = RANGE_FIELDS.find((f) => f.key === key);
    const next = { ...ranges[key], [edge]: value };
    if (field?.minFloor !== undefined && next.min < field.minFloor) {
      setError({ key, message: `最小値は ${field.minFloor} 以上にしてください。` });
      return false;
    }
    if (next.min >= next.max) {
      setError({ key, message: "最小値は最大値より小さくしてください。" });
      return false;
    }
    setError(null);
    setSliderRange(key, next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-x-2 gap-y-2">
        <span className="text-xs font-medium text-muted">項目</span>
        <span className="text-right text-xs font-medium text-muted">最小</span>
        <span className="text-right text-xs font-medium text-muted">最大</span>
        {RANGE_FIELDS.map((f) => {
          const label = f.unit ? `${f.label}（${f.unit}）` : f.label;
          return (
            <div key={f.key} className="contents">
              <span className="text-xs">{label}</span>
              <NumberInput
                aria-label={`${label}の最小値`}
                value={ranges[f.key].min}
                onCommit={(v) => commit(f.key, "min", v)}
              />
              <NumberInput
                aria-label={`${label}の最大値`}
                value={ranges[f.key].max}
                onCommit={(v) => commit(f.key, "max", v)}
              />
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error.message}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">この設定はブラウザに保存されます。</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            resetSliderRanges();
            setError(null);
          }}
        >
          範囲を初期値に戻す
        </Button>
      </div>
    </div>
  );
}
