"use client";

import { useId } from "react";
import { Field, PanelSection, SegmentedControl, TextField } from "@/components/ui";
import type { TargetType, TextTag } from "@/utils/animation/types";
import type { SectionProps } from "./types";

type Props = SectionProps & {
  /** プレビュー用にローカル画像を選択したとき */
  onImageFile: (file: File) => void;
};

export function TargetSection({ config, update, onImageFile }: Props) {
  const { target } = config;
  const fileId = useId();

  return (
    <PanelSection title="アニメーション対象">
      <SegmentedControl<TargetType>
        aria-label="対象の種類"
        value={target.type}
        onValueChange={(type) => update("target", { type })}
        options={[
          { value: "text", label: "テキスト" },
          { value: "image", label: "画像" },
        ]}
      />

      {target.type === "text" ? (
        <>
          <TextField
            label="テキスト"
            value={target.text}
            placeholder="表示するテキスト"
            onValueChange={(text) => update("target", { text })}
          />
          <Field label="タグ">
            <SegmentedControl<TextTag>
              aria-label="テキストを囲むタグ"
              value={target.tag}
              onValueChange={(tag) => update("target", { tag })}
              options={[
                { value: "span", label: "<span>" },
                { value: "p", label: "<p>" },
              ]}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="プレビュー画像" htmlFor={fileId}>
            <input
              id={fileId}
              type="file"
              accept="image/*"
              className="text-xs text-muted file:mr-3 file:h-8 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:text-xs file:font-medium file:text-foreground hover:file:bg-surface-muted"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageFile(file);
              }}
            />
          </Field>
          <TextField
            label="画像パス（コード出力用）"
            value={target.image.src}
            onValueChange={(src) => update("target", { image: { ...target.image, src } })}
          />
          <TextField
            label="alt"
            value={target.image.alt}
            onValueChange={(alt) => update("target", { image: { ...target.image, alt } })}
          />
        </>
      )}
    </PanelSection>
  );
}
