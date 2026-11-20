import type { Bezier } from "@/utils/animation/easings";
import { cn } from "@/utils/cn";

/** 100×100 の viewBox。x ∈ [0,1] → 18..82、y ∈ [-0.25, 1.25] → 98..2 */
const X0 = 18;
const SCALE = 64;
const Y0 = 82;
const Y_MIN = -0.25;
const Y_MAX = 1.25;
const SAMPLES = 32;

const px = (x: number) => X0 + x * SCALE;
const py = (y: number) => Y0 - y * SCALE;

function curvePath([x1, y1, x2, y2]: Bezier): string {
  const points: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const u = 1 - t;
    const x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
    const y = 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
    const cy = Math.min(Y_MAX, Math.max(Y_MIN, y));
    points.push(`${i === 0 ? "M" : "L"}${px(x).toFixed(2)} ${py(cy).toFixed(2)}`);
  }
  return points.join(" ");
}

/** cubic-bezier の静的なサムネイル */
export function EasingCurve({ bezier, className }: { bezier: Bezier; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn("size-10 shrink-0", className)}>
      <line
        x1={px(0)}
        y1={py(0)}
        x2={px(1)}
        y2={py(1)}
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth={3}
        strokeDasharray="5 5"
      />
      <path
        d={curvePath(bezier)}
        fill="none"
        stroke="currentColor"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
