import type { Metadata } from "next";
import { AnimationEditor } from "@/components/editor/AnimationEditor";
import { DEFAULT_CONFIG } from "@/utils/animation/defaults";

export const metadata: Metadata = {
  title: "新規作成 | Animation Maker",
};

export default function CreatePage() {
  return (
    <AnimationEditor
      title="新規作成"
      description="対象・方式・タイミング・動きを設定して、コードをコピーして使えます。"
      initialConfig={DEFAULT_CONFIG}
    />
  );
}
