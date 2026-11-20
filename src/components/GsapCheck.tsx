"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function GsapCheck() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".gsap-box", {
        x: 120,
        rotate: 360,
        duration: 1.2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className="h-16">
      <div className="gsap-box size-16 rounded-lg bg-emerald-500" />
    </div>
  );
}
