import { DEFAULT_EASING_ID } from "./easings";
import type { AnimationConfig, MotionState } from "./types";

/** 何も変化していない状態 */
export const NEUTRAL_STATE: MotionState = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  blur: 0,
  mask: 0,
};

export const DEFAULT_CONFIG: AnimationConfig = {
  engine: "css",
  cssMethod: "transition",
  target: {
    type: "text",
    text: "Hello Animation",
    tag: "span",
    image: { src: "/sample.svg", alt: "", wrapper: true },
  },
  timing: { duration: 0.8, delay: 0, easing: DEFAULT_EASING_ID },
  keyframes: { iterationCount: 1, direction: "normal", fillMode: "both" },
  gsap: {
    repeat: 0,
    yoyo: false,
    plugin: "none",
    splitText: { type: "chars", stagger: 0.05 },
  },
  from: { ...NEUTRAL_STATE, opacity: 0, y: 40 },
  to: { ...NEUTRAL_STATE },
  translateUnit: "px",
  maskDirection: "left",
  trigger: {
    mode: "class",
    className: "is-show",
  },
};
