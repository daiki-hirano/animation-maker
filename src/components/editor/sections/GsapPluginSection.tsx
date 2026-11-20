"use client";

import { Field, PanelSection, RangeField, SegmentedControl, Select } from "@/components/ui";
import {
  GSAP_PLUGINS,
  isPluginAvailable,
  type GsapPluginId,
} from "@/utils/animation/gsap-plugins";
import type { GsapConfig } from "@/utils/animation/types";
import type { SectionProps } from "./types";

type SplitType = GsapConfig["splitText"]["type"];

export function GsapPluginSection({ config, update }: SectionProps) {
  const { gsap, target } = config;
  const available = isPluginAvailable(gsap.plugin, target.type);

  return (
    <PanelSection title="GSAP プラグイン">
      <Select<GsapPluginId>
        label="プラグイン"
        value={gsap.plugin}
        onValueChange={(plugin) => update("gsap", { plugin })}
        options={GSAP_PLUGINS.map((p) => ({
          value: p.id,
          label: p.label,
          disabled: !isPluginAvailable(p.id, target.type),
        }))}
        hint={
          !available
            ? "選択中のプラグインはこの対象では使えないため、無効として扱います。"
            : undefined
        }
      />

      {gsap.plugin === "splitText" && available && (
        <>
          <Field label="分割単位">
            <SegmentedControl<SplitType>
              aria-label="分割単位"
              value={gsap.splitText.type}
              onValueChange={(type) => update("gsap", { splitText: { ...gsap.splitText, type } })}
              options={[
                { value: "chars", label: "文字" },
                { value: "words", label: "単語" },
                { value: "lines", label: "行" },
              ]}
            />
          </Field>
          <RangeField
            label="stagger"
            unit="s"
            min={0}
            max={0.5}
            step={0.01}
            value={gsap.splitText.stagger}
            onValueChange={(stagger) =>
              update("gsap", { splitText: { ...gsap.splitText, stagger } })
            }
          />
        </>
      )}
    </PanelSection>
  );
}
