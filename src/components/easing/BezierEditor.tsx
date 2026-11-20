"use client";

import { useId, useRef, type KeyboardEvent, type PointerEvent } from "react";
import type { Bezier } from "@/utils/animation/easings";

/**
 * 座標系: 1 単位 = 100 viewBox 単位。
 * x ∈ [0,1] → 0..100、y ∈ [-0.5, 1.5] → 200..0（上が大きい値）。
 * 単位正方形（y 0..1）は縦方向の中央に収まる。
 */
const SCALE = 100;
const Y_MIN = -0.5;
const Y_MAX = 1.5;
const PAD_LEFT = 18;
const PAD_RIGHT = 10;
const PAD_Y = 8;
const VIEW_W = PAD_LEFT + SCALE + PAD_RIGHT;
const VIEW_H = (Y_MAX - Y_MIN) * SCALE + PAD_Y * 2;

const HANDLE_R = 6;
const HIT_R = 12;
const PINK = "#ec4899";

const sx = (x: number) => x * SCALE;
const sy = (y: number) => (Y_MAX - y) * SCALE;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

type HandleIndex = 0 | 1;

const HANDLES: { index: HandleIndex; label: string; color: string }[] = [
  { index: 0, label: "制御点1", color: "var(--accent)" },
  { index: 1, label: "制御点2", color: PINK },
];

/** 制御点（0: P1, 1: P2）の座標。表示は y の範囲内に収める */
function handlePoint(b: Bezier, i: HandleIndex) {
  return { x: b[i * 2], y: clamp(b[i * 2 + 1], Y_MIN, Y_MAX) };
}

function withPoint(b: Bezier, i: HandleIndex, x: number, y: number): Bezier {
  const next: Bezier = [...b];
  next[i * 2] = round2(clamp(x, 0, 1));
  next[i * 2 + 1] = round2(clamp(y, Y_MIN, Y_MAX));
  return next;
}

type Props = {
  value: Bezier;
  onChange: (value: Bezier) => void;
};

/** 2 つの制御点をドラッグ / 矢印キーで動かす cubic-bezier エディタ */
export function BezierEditor({ value, onChange }: Props) {
  const clipId = `clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const handleRefs = useRef<(SVGGElement | null)[]>([null, null]);
  const drag = useRef<{ index: HandleIndex; dx: number; dy: number; pointerId: number } | null>(
    null,
  );

  const [x1, y1, x2, y2] = value;
  const p0 = { x: 0, y: 0 };
  const p3 = { x: 1, y: 1 };
  const h1 = handlePoint(value, 0);
  const h2 = handlePoint(value, 1);

  /** クライアント座標 → 値の座標（x, y） */
  const toValue = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x / SCALE, y: Y_MAX - p.y / SCALE };
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const pos = toValue(e.clientX, e.clientY);
    if (!pos) return;
    // 一番近い制御点を掴む
    const dist = (i: HandleIndex) => {
      const h = handlePoint(value, i);
      return Math.hypot(h.x - pos.x, h.y - pos.y);
    };
    const index: HandleIndex = dist(0) <= dist(1) ? 0 : 1;
    const h = handlePoint(value, index);
    const onHandle = dist(index) * SCALE <= HIT_R;
    // ハンドル上を押したときは位置を保ったまま、空き領域ならその場所へ移動する
    drag.current = {
      index,
      dx: onHandle ? h.x - pos.x : 0,
      dy: onHandle ? h.y - pos.y : 0,
      pointerId: e.pointerId,
    };
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    handleRefs.current[index]?.focus({ preventScroll: true });
    if (!onHandle) onChange(withPoint(value, index, pos.x, pos.y));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const pos = toValue(e.clientX, e.clientY);
    if (!pos) return;
    onChange(withPoint(value, d.index, pos.x + d.dx, pos.y + d.dy));
  };

  const endDrag = (e: PointerEvent<SVGSVGElement>) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
  };

  const onKeyDown = (e: KeyboardEvent<SVGGElement>, index: HandleIndex) => {
    const step = (e.shiftKey ? 0.1 : 0.01) * 1;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = step;
    else if (e.key === "ArrowDown") dy = -step;
    else return;
    e.preventDefault();
    const h = handlePoint(value, index);
    onChange(withPoint(value, index, h.x + dx, h.y + dy));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`${-PAD_LEFT} ${-PAD_Y} ${VIEW_W} ${VIEW_H}`}
      className="mx-auto block w-full max-w-[360px] select-none"
      style={{ touchAction: "none", aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      role="group"
      aria-label="cubic-bezier エディタ"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={-2} y={-PAD_Y} width={SCALE + 4} height={VIEW_H} />
        </clipPath>
      </defs>

      {/* 単位正方形 + グリッド */}
      <rect
        x={0}
        y={sy(1)}
        width={SCALE}
        height={SCALE}
        fill="var(--surface-muted)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      {[0.25, 0.5, 0.75].map((g) => (
        <g key={g} stroke="var(--border)" strokeWidth={0.6}>
          <line x1={sx(g)} y1={sy(1)} x2={sx(g)} y2={sy(0)} />
          <line x1={0} y1={sy(g)} x2={SCALE} y2={sy(g)} />
        </g>
      ))}

      {/* 軸ラベル */}
      <text
        x={SCALE / 2}
        y={sy(0) + 11}
        textAnchor="middle"
        fontSize={6}
        fill="var(--muted)"
      >
        時間 →
      </text>
      <text
        transform={`translate(-6 ${sy(0.5)}) rotate(-90)`}
        textAnchor="middle"
        fontSize={6}
        fill="var(--muted)"
      >
        進行度 →
      </text>

      {/* リニア */}
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(1)}
        y2={sy(1)}
        stroke="var(--muted)"
        strokeOpacity={0.6}
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* 制御線 */}
      <line
        x1={sx(p0.x)}
        y1={sy(p0.y)}
        x2={sx(h1.x)}
        y2={sy(h1.y)}
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <line
        x1={sx(p3.x)}
        y1={sy(p3.y)}
        x2={sx(h2.x)}
        y2={sy(h2.y)}
        stroke={PINK}
        strokeWidth={1.5}
      />

      {/* カーブ */}
      <path
        d={`M ${sx(p0.x)} ${sy(p0.y)} C ${sx(x1)} ${sy(y1)} ${sx(x2)} ${sy(y2)} ${sx(p3.x)} ${sy(p3.y)}`}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={4}
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      />

      {/* 端点 */}
      <circle cx={sx(p0.x)} cy={sy(p0.y)} r={2.5} fill="var(--foreground)" />
      <circle cx={sx(p3.x)} cy={sy(p3.y)} r={2.5} fill="var(--foreground)" />

      {/* ハンドル */}
      {HANDLES.map(({ index, label, color }) => {
        const h = index === 0 ? h1 : h2;
        const rawX = value[index * 2];
        const rawY = value[index * 2 + 1];
        return (
          <g
            key={index}
            ref={(el) => {
              handleRefs.current[index] = el;
            }}
            tabIndex={0}
            role="slider"
            aria-label={label}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={rawX}
            aria-valuetext={`x ${rawX.toFixed(2)}, y ${rawY.toFixed(2)}`}
            onKeyDown={(e) => onKeyDown(e, index)}
            className="group cursor-grab outline-none active:cursor-grabbing"
          >
            {/* 当たり判定を広げる透明な円 */}
            <circle cx={sx(h.x)} cy={sy(h.y)} r={HIT_R} fill="transparent" />
            {/* フォーカスリング */}
            <circle
              cx={sx(h.x)}
              cy={sy(h.y)}
              r={HANDLE_R + 3.5}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              className="opacity-0 group-focus-visible:opacity-100"
            />
            <circle
              cx={sx(h.x)}
              cy={sy(h.y)}
              r={HANDLE_R}
              fill={color}
              stroke="var(--surface)"
              strokeWidth={1.5}
            />
          </g>
        );
      })}
    </svg>
  );
}
