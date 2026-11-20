"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CirclePause } from "lucide-react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { Button } from "@/components/ui";
import { customEaseData, needsCustomEase, type Easing } from "@/utils/animation/easings";
import { buildGsapVars, usesSplitText } from "@/utils/animation/motion";
import type { AnimationConfig, TriggerMode } from "@/utils/animation/types";
import { generatePreviewCss } from "@/utils/codegen";
import { TARGET_CLASS } from "@/utils/codegen/constants";
import { cn } from "@/utils/cn";

gsap.registerPlugin(useGSAP, SplitText, CustomEase);

const SCOPE_ATTR = "data-anim-preview";
/** ループ再生時、終了から次の再生までの間隔 */
const LOOP_GAP_MS = 600;

type Props = {
  config: AnimationConfig;
  /** config.timing.easing を解決済みのイージング */
  easing: Easing;
  /** ローカル選択画像の object URL（なければ config の src） */
  imageSrc?: string;
  /** 「クラスを外す / 付与」ボタンで発火タイミングを切り替える（なければボタンを出さない） */
  onTriggerModeChange?: (mode: TriggerMode) => void;
};

/** 設定自体が無限繰り返しか（ループ再生は不要） */
function isInfinite(config: AnimationConfig) {
  if (config.engine === "gsap") return config.gsap.repeat === -1;
  return config.cssMethod === "keyframes" && config.keyframes.iterationCount === 0;
}

/** CSS アニメーション 1 回分の所要時間（ms） */
function cssTotalMs(config: AnimationConfig) {
  const { duration, delay } = config.timing;
  const count = config.cssMethod === "keyframes" ? config.keyframes.iterationCount : 1;
  return (delay + duration * count) * 1000;
}

export function AnimationPreview({ config, easing, imageSrc, onTriggerModeChange }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement>(null);
  const [playCount, setPlayCount] = useState(0);
  const [loop, setLoop] = useState(false);

  const cls = config.trigger.className;
  const isGsap = config.engine === "gsap";
  // クラス付与時のみクラスを使う。読み込み時は @keyframes / @starting-style / 即時トゥイーンで再生
  const classMode = config.trigger.mode === "class";
  const infinite = isInfinite(config);
  const looping = loop && !infinite;
  // 設定変更 or 再生ボタンで要素を作り直して最初から再生
  const runKey = `${playCount}:${JSON.stringify(config)}:${JSON.stringify(easing)}:${imageSrc ?? ""}`;

  const replay = () => setPlayCount((n) => n + 1);

  // CSS: クラス付与時のクラス付与 + ループ再生
  useEffect(() => {
    if (isGsap) return;
    const el = targetRef.current;
    if (!el) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (classMode) {
      // 開始状態を一度描画してからクラスを付与する
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => el.classList.add(cls));
      });
    }
    if (looping) {
      timer = setTimeout(replay, cssTotalMs(config) + LOOP_GAP_MS);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [runKey, config, isGsap, classMode, cls, looping]);

  // GSAP: 生成コードと同じ vars でトゥイーンを作る
  useGSAP(
    () => {
      if (!isGsap) return;
      const el = targetRef.current;
      if (!el) return;
      if (needsCustomEase(easing)) CustomEase.create(easing.id, customEaseData(easing));
      const { from, to } = buildGsapVars(config, easing);
      const split = usesSplitText(config)
        ? SplitText.create(el, {
            type: config.gsap.splitText.type,
            ...(config.target.tag === "span" ? { tag: "span" } : {}),
          })
        : null;
      const targets = split ? split[config.gsap.splitText.type] : el;
      const tween = gsap.fromTo(targets, from, { ...to, paused: classMode });

      let timer: ReturnType<typeof setTimeout> | undefined;
      if (looping) {
        tween.eventCallback("onComplete", () => {
          timer = setTimeout(replay, LOOP_GAP_MS);
        });
      }

      let raf = 0;
      if (classMode) {
        raf = requestAnimationFrame(() => {
          el.classList.add(cls);
          tween.play();
        });
      }
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
        split?.revert();
      };
    },
    { scope: stageRef, dependencies: [runKey, looping], revertOnUpdate: true },
  );

  const css = generatePreviewCss(config, `[${SCOPE_ATTR}]`, easing);
  const { target } = config;
  const Tag = target.tag;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded bg-surface-muted px-2 py-0.5 font-medium text-foreground">
            {isGsap ? "GSAP" : config.cssMethod === "transition" ? "CSS transition" : "CSS @keyframes"}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <span
              aria-hidden
              className={cn("size-2 rounded-full", classMode ? "bg-emerald-500" : "bg-border")}
            />
            {classMode ? `.${cls} 付与中` : "クラスなし"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {onTriggerModeChange && (
            <Button
              size="sm"
              onClick={() => onTriggerModeChange(classMode ? "load" : "class")}
            >
              {classMode ? `.${cls} を外す` : `.${cls} を付与`}
            </Button>
          )}
          <Button
            size="sm"
            aria-pressed={looping}
            disabled={infinite}
            title={infinite ? "無限に繰り返す設定のためループ再生は不要です" : undefined}
            onClick={() => setLoop((v) => !v)}
            className={cn(looping && "border-accent text-accent")}
          >
            {looping ? (
              <CirclePause aria-hidden className="size-3.5" />
            ) : (
              <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
                <path
                  d="M2.5 8a5 5 0 0 1 8.6-3.5M13.5 8a5 5 0 0 1-8.6 3.5M11.5 1.5v3h-3M4.5 14.5v-3h3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {looping ? "停止" : "ループ再生"}
          </Button>
          <Button size="sm" variant="primary" onClick={replay}>
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
              <path d="M5 3.5v9l7-4.5z" fill="currentColor" />
            </svg>
            再生
          </Button>
        </div>
      </div>

      <div
        ref={stageRef}
        {...{ [SCOPE_ATTR]: "" }}
        className="relative grid min-h-[320px] place-items-center overflow-hidden bg-stage p-8 lg:min-h-[440px]"
        style={{
          backgroundImage: "radial-gradient(var(--stage-dot) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {css && <style>{css}</style>}
        {target.type === "text" ? (
          <Tag
            key={runKey}
            ref={(el) => {
              targetRef.current = el;
            }}
            className={cn(TARGET_CLASS, "max-w-full text-center text-4xl font-bold tracking-tight break-words lg:text-6xl")}
          >
            {target.text || " "}
          </Tag>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- 任意の画像 URL をそのまま表示するため
          <img
            key={runKey}
            ref={(el) => {
              targetRef.current = el;
            }}
            src={imageSrc ?? target.image.src}
            alt={target.image.alt}
            className={cn(TARGET_CLASS, "max-h-64 w-auto max-w-[min(100%,320px)]")}
          />
        )}
      </div>
    </div>
  );
}
