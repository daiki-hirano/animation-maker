"use client";

import { useEffect, useRef, useState } from "react";
import { Undo2 } from "lucide-react";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { Button } from "@/components/ui";
import { resolveEasing } from "@/utils/animation/easings";
import { useEasings } from "@/hooks/useEasings";
import type { AnimationConfig, PanelSectionId } from "@/utils/animation/types";
import { AnimationPreview } from "./AnimationPreview";
import { CodeOutput } from "./CodeOutput";
import { ControlPanel } from "./ControlPanel";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

type Props = {
  title: string;
  description?: string;
  /** 初期値。新規作成ではデフォルト、プリセットではプリセットの config を渡す */
  initialConfig: AnimationConfig;
  /** パネルに表示するセクション。未指定なら全て */
  sections?: PanelSectionId[];
};

/**
 * プレビュー / コントロールパネル / コード表示をまとめたエディタ本体。
 * 新規作成とプリセットの両方で使い回す。
 */
export function AnimationEditor({ title, description, initialConfig, sections }: Props) {
  const { config, update, reset } = useAnimationConfig(initialConfig);
  const easings = useEasings();
  const { easing } = resolveEasing(config.timing.easing, easings);
  const [localImage, setLocalImage] = useState<string>();
  const objectUrl = useRef<string>(undefined);
  // 初期値から変更されている、またはローカル画像を選択している場合に「初期値に戻す」を有効にする
  const isDirty =
    JSON.stringify(config) !== JSON.stringify(initialConfig) ||
    localImage !== undefined;

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  const onImageFile = (file: File) => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setLocalImage(objectUrl.current);
    update("target", { image: { ...config.target.image, src: `./images/${file.name}` } });
  };

  return (
    <EditorLayout
      title={title}
      description={description}
      preview={
        <AnimationPreview
          config={config}
          easing={easing}
          imageSrc={localImage}
        />
      }
      panelHeader={
        <div className="flex items-center justify-between px-4 py-2.5">
          <h2 className="text-sm font-semibold">プロパティ</h2>
          <Button
            size="sm"
            variant={isDirty ? "primary" : "secondary"}
            disabled={!isDirty}
            onClick={() => {
              reset();
              setLocalImage(undefined);
            }}
          >
            <Undo2 aria-hidden className="size-3.5" />
            初期値に戻す
          </Button>
        </div>
      }
      panel={
        <ControlPanel
          config={config}
          update={update}
          sections={sections}
          onImageFile={onImageFile}
          imageSrc={localImage}
        />
      }
      code={<CodeOutput config={config} update={update} easing={easing} />}
    />
  );
}
