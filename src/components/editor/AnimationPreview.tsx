"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CirclePause } from "lucide-react";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { Button } from "@/components/ui";
import { customEaseData, needsCustomEase, type Easing } from "@/utils/animation/easings";
import { buildGsapVars, usesSplitText } from "@/utils/animation/motion";
import type { AnimationConfig } from "@/utils/animation/types";
import {
  generatePreviewCss,
  PREVIEW_HOLD_CLASS,
  PREVIEW_REST_CLASS,
  previewHoldCss,
  previewRestCss,
} from "@/utils/codegen";
import { TARGET_CLASS } from "@/utils/codegen/constants";
import { cn } from "@/utils/cn";

gsap.registerPlugin(useGSAP, SplitText, CustomEase);

const SCOPE_ATTR = "data-anim-preview";
/** ループ再生時、終了から次の再生までの間隔 */
const LOOP_GAP_MS = 600;
/** 再生ボタンを押してから、開始状態を見せたままアニメーションを始めるまでの待機時間 */
const PLAY_HOLD_MS = 200;

type Props = {
  config: AnimationConfig;
  /** config.timing.easing を解決済みのイージング */
  easing: Easing;
  /** ローカル選択画像の object URL（なければ config の src） */
  imageSrc?: string;
  /**
   * 表示形式
   * - full: ツールバー付きの通常表示
   * - compact: 小さめのステージ（モーダル内のプレビュー用）
   * - thumbnail: ツールバーなしで親要素いっぱいにループ再生（一覧カードのサムネイル用。playing=false で終了状態を静止表示）
   */
  variant?: "full" | "compact" | "thumbnail";
  /** ループ再生の初期状態（thumbnail は常に true） */
  defaultLoop?: boolean;
  /**
   * 再生するか（thumbnail 用）。false の間は何も動かさず、終了状態で静止表示する。
   * true に切り替わると最初から再生する
   */
  playing?: boolean;
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

/** 設定変更 or 再生で要素を作り直すためのキー（count は再生回数） */
function buildRunKey(count: number, config: AnimationConfig, easing: Easing, imageSrc?: string, playing = true) {
  return `${playing ? "play" : "rest"}:${count}:${JSON.stringify(config)}:${JSON.stringify(easing)}:${imageSrc ?? ""}`;
}

export function AnimationPreview({ config, easing, imageSrc, variant = "full", defaultLoop = false, playing = true }: Props) {
  const compact = variant === "compact";
  const thumbnail = variant === "thumbnail";
  // 複数のプレビューが同時にあっても CSS が干渉しないよう、インスタンスごとにスコープを分ける
  const scopeId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement>(null);
  const [playCount, setPlayCount] = useState(0);
  const [loop, setLoop] = useState(defaultLoop || thumbnail);
  // 再生ボタンで始めた実行の runKey。一致する間だけ開始状態を待機表示する（設定変更で runKey が変わると解除される）
  const [holdKey, setHoldKey] = useState<string | null>(null);

  const cls = config.trigger.className;
  const isGsap = config.engine === "gsap";
  // クラス付与時のみクラスを使う。読み込み時は @keyframes / @starting-style / 即時トゥイーンで再生
  const classMode = config.trigger.mode === "class";
  const infinite = isInfinite(config);
  const looping = loop && !infinite;
  // 設定変更 or 再生ボタンで要素を作り直して最初から再生
  const runKey = buildRunKey(playCount, config, easing, imageSrc, playing);
  const hold = playing && holdKey === runKey;
  const totalMs = cssTotalMs(config);

  // GSAP の onComplete など非同期のコールバックから最新のループ状態を読むための ref
  const loopingRef = useRef(looping);
  useEffect(() => {
    loopingRef.current = looping;
  }, [looping]);

  // ループの再開など（待機なし）
  const replay = () => setPlayCount((n) => n + 1);
  // 再生ボタン: 開始状態を待機表示してから再生する
  const play = () => {
    setPlayCount(playCount + 1);
    setHoldKey(buildRunKey(playCount + 1, config, easing, imageSrc));
  };

  // CSS: 開始処理（待機の解除 / クラス付与）。ループの切り替えでは再実行しない
  useEffect(() => {
    if (isGsap || !playing) return;
    const el = targetRef.current;
    if (!el) return;

    let raf = 0;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    if (hold) {
      // 待機中は HOLD_CLASS が開始状態に固定している。外すと transition / animation が有効に戻り、開始状態から再生される
      holdTimer = setTimeout(() => {
        el.classList.remove(PREVIEW_HOLD_CLASS);
        // 開始状態は待機中に描画済みなので、クラス付与は同時に行う（reverse の keyframes で開始状態がちらつかないように）
        if (classMode) el.classList.add(cls);
      }, PLAY_HOLD_MS);
    } else if (classMode) {
      // 開始状態を一度描画してからクラスを付与する
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => el.classList.add(cls));
      });
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
  }, [runKey, config, isGsap, classMode, cls, hold, playing]);

  // CSS: ループ再生の次回予約。ループを切ると予約を取り消す（再生中の実行はそのまま終わる）
  useEffect(() => {
    if (isGsap || !playing || !looping) return;
    const timer = setTimeout(
      () => setPlayCount((n) => n + 1),
      totalMs + (hold ? PLAY_HOLD_MS : 0) + LOOP_GAP_MS,
    );
    return () => clearTimeout(timer);
  }, [runKey, isGsap, playing, looping, hold, totalMs]);

  // GSAP: 生成コードと同じ vars でトゥイーンを作る
  useGSAP(
    () => {
      if (!isGsap || !playing) return;
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
      // 待機中は fromTo が描画した開始状態のまま止めておく
      const tween = gsap.fromTo(targets, from, { ...to, paused: classMode || hold });

      let timer: ReturnType<typeof setTimeout> | undefined;
      // 完了時にループ中なら次回を予約する（ループの切り替えでトゥイーンは作り直さない）
      tween.eventCallback("onComplete", () => {
        if (!loopingRef.current) return;
        timer = setTimeout(() => {
          if (loopingRef.current) replay();
        }, LOOP_GAP_MS);
      });

      let raf = 0;
      let holdTimer: ReturnType<typeof setTimeout> | undefined;
      if (hold) {
        holdTimer = setTimeout(() => tween.play(), PLAY_HOLD_MS);
      } else if (classMode) {
        raf = requestAnimationFrame(() => {
          tween.play();
        });
      }
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(holdTimer);
        clearTimeout(timer);
        split?.revert();
      };
    },
    { scope: stageRef, dependencies: [runKey, playing], revertOnUpdate: true },
  );

  const scope = `[${SCOPE_ATTR}="${scopeId}"]`;
  const css = [
    generatePreviewCss(config, scope, easing),
    hold ? previewHoldCss(config, scope) : "",
    !playing ? previewRestCss(config, scope) : "",
  ]
    .filter(Boolean)
    .join("\n");
  const { target } = config;
  const Tag = target.tag;
  const imageSizeClass = thumbnail
    ? "max-h-[60%] max-w-full"
    : compact
      ? "max-h-32 max-w-full"
      : "max-h-64 max-w-[min(100%,320px)]";
  // .anim img の規則（max-width: 100%）より優先させるため max-w は ! を付ける。
  // figure の高さは内容で決まるため、サムネイルの高さ上限は % ではなく固定値にする
  const wrapperImageSizeClass = thumbnail
    ? "max-h-24 max-w-full!"
    : compact
      ? "max-h-32 max-w-full!"
      : "max-h-64 max-w-[min(100%,320px)]!";

  const stage = (
    <div
      ref={stageRef}
      {...{ [SCOPE_ATTR]: scopeId }}
      aria-hidden={thumbnail || undefined}
      className={cn(
        "grid place-items-center overflow-hidden bg-stage",
        !thumbnail && "relative",
        thumbnail
          ? "absolute inset-0 p-3"
          : compact
            ? "min-h-[200px] p-4"
            : "min-h-[320px] p-8 lg:min-h-[440px]",
      )}
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
          className={cn(
            TARGET_CLASS,
            hold && PREVIEW_HOLD_CLASS,
            !playing && PREVIEW_REST_CLASS,
            "max-w-full text-center font-bold tracking-tight break-words",
            thumbnail ? "text-xl" : compact ? "text-2xl" : "text-4xl lg:text-6xl",
          )}
        >
          {target.text || " "}
        </Tag>
      ) : target.image.wrapper ? (
        // figure がアニメーション対象。img は生成コードと同じ規則（.anim img）で表示する
        <figure
          key={runKey}
          ref={(el) => {
            targetRef.current = el;
          }}
          className={cn(TARGET_CLASS, hold && PREVIEW_HOLD_CLASS, !playing && PREVIEW_REST_CLASS, "max-w-full")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 任意の画像 URL をそのまま表示するため */}
          <img src={imageSrc ?? target.image.src} alt={target.image.alt} className={cn("w-auto", wrapperImageSizeClass)} />
        </figure>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 任意の画像 URL をそのまま表示するため
        <img
          key={runKey}
          ref={(el) => {
            targetRef.current = el;
          }}
          src={imageSrc ?? target.image.src}
          alt={target.image.alt}
          className={cn(
            TARGET_CLASS,
            hold && PREVIEW_HOLD_CLASS,
            !playing && PREVIEW_REST_CLASS,
            "w-auto",
            imageSizeClass,
          )}
        />
      )}
    </div>
  );

  if (thumbnail) return stage;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded bg-surface-muted px-2 py-0.5 font-medium text-foreground">
            {isGsap ? "GSAP" : config.cssMethod === "transition" ? "CSS transition" : "CSS @keyframes"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            aria-pressed={looping}
            disabled={infinite}
            title={infinite ? "無限に繰り返す設定のためループ再生は不要です" : undefined}
            onClick={() => {
              // ON にした瞬間に「再生」と同じ動きで始める。OFF は再生中の実行が終わって止まるだけ
              if (!looping) {
                setLoop(true);
                play();
              } else {
                setLoop(false);
              }
            }}
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
          <Button size="sm" variant="primary" onClick={play}>
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5">
              <path d="M5 3.5v9l7-4.5z" fill="currentColor" />
            </svg>
            再生
          </Button>
        </div>
      </div>

      {stage}
    </div>
  );
}
