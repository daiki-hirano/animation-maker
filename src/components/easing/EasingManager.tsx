"use client";

import { useState } from "react";
import { Button, CodeBlock, CopyButton, TextField } from "@/components/ui";
import { useEasings } from "@/hooks/useEasings";
import {
  customEaseData,
  formatBezier,
  gsapEaseName,
  needsCustomEase,
  parseBezier,
  type Bezier,
  type Easing,
} from "@/utils/animation/easings";
import {
  addCustomEasing,
  deleteCustomEasing,
  updateCustomEasing,
} from "@/utils/settings/custom-easings";
import { BezierEditor } from "./BezierEditor";
import { EasingComparePreview } from "./EasingComparePreview";
import { EasingLibrary } from "./EasingLibrary";

const DEFAULT_ID = "ease";
const DISCARD_MESSAGE = "保存していない変更があります。破棄しますか？";
const BEZIER_ERROR = "cubic-bezier(x1, y1, x2, y2) の形式で入力してください（x は 0〜1）";

type Draft = { id: string; name: string; bezier: Bezier };

const sameBezier = (a: Bezier, b: Bezier) => a.every((v, i) => v === b[i]);

const card = "rounded-xl border border-border bg-surface";

export function EasingManager() {
  const easings = useEasings();
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // cubic-bezier 欄の入力途中の文字列。forBezier が現在値と違えば無視する（派生）
  const [textDraft, setTextDraft] = useState<{
    text: string;
    invalid: boolean;
    forBezier: string;
  } | null>(null);

  // 選択中のイージング（他タブで削除されて見つからなければ ease に戻す）
  const saved =
    easings.find((e) => e.id === selectedId) ??
    easings.find((e) => e.id === DEFAULT_ID)!;
  const isCustom = saved.group === "custom";

  // 実効の下書き: 下書きの id が選択中と一致するときだけ使い、なければ保存値
  const effective: Draft =
    draft?.id === saved.id
      ? draft
      : { id: saved.id, name: saved.name, bezier: saved.bezier };
  const dirty = effective.name !== saved.name || !sameBezier(effective.bezier, saved.bezier);

  const bezierChanged = !sameBezier(effective.bezier, saved.bezier);
  // 下書きを Easing として扱う。形が変わった組み込みは CSS / GSAP のキーワードを引き継がない
  const draftEasing: Easing = bezierChanged
    ? {
        id: isCustom ? saved.id : `${saved.id}-custom`,
        name: effective.name,
        bezier: effective.bezier,
        group: "custom",
      }
    : { ...saved, name: effective.name };

  const confirmDiscard = () => !dirty || window.confirm(DISCARD_MESSAGE);

  const resetUiState = () => {
    setDraft(null);
    setConfirmDeleteId(null);
    setTextDraft(null);
  };

  const select = (id: string) => {
    if (id === saved.id) return;
    if (!confirmDiscard()) return;
    resetUiState();
    setSelectedId(id);
  };

  const create = () => {
    if (!confirmDiscard()) return;
    const n = easings.filter((e) => e.group === "custom").length + 1;
    const created = addCustomEasing({ name: `カスタム ${n}`, bezier: [0.25, 0.1, 0.25, 1] });
    resetUiState();
    setSelectedId(created.id);
  };

  const setBezier = (bezier: Bezier) => {
    setDraft({ ...effective, bezier });
    setTextDraft(null);
  };

  const save = () => {
    updateCustomEasing(saved.id, { name: effective.name.trim(), bezier: effective.bezier });
    resetUiState();
  };

  const saveAsCustom = () => {
    const created = addCustomEasing({
      name: `${effective.name} のコピー`,
      bezier: effective.bezier,
    });
    resetUiState();
    setSelectedId(created.id);
  };

  const remove = () => {
    deleteCustomEasing(saved.id);
    resetUiState();
    setSelectedId(DEFAULT_ID);
  };

  const formatted = formatBezier(effective.bezier);
  const textState = textDraft?.forBezier === formatted ? textDraft : null;
  const textValue = textState?.text ?? formatted;

  const commitText = () => {
    if (!textState) return;
    const parsed = parseBezier(textState.text);
    if (parsed) setBezier(parsed);
    else setTextDraft({ ...textState, invalid: true });
  };

  const gsapCode = needsCustomEase(draftEasing)
    ? [
        `import { CustomEase } from "gsap/CustomEase";`,
        `gsap.registerPlugin(CustomEase);`,
        `CustomEase.create("${draftEasing.id}", "${customEaseData(draftEasing)}");`,
        `// ease: "${draftEasing.id}"`,
      ].join("\n")
    : `ease: "${gsapEaseName(draftEasing)}"`;

  const confirmingDelete = confirmDeleteId === saved.id;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <aside aria-label="イージングライブラリ" className="min-w-0">
        <EasingLibrary
          easings={easings}
          selectedId={saved.id}
          onSelect={select}
          onCreate={create}
        />
      </aside>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6">
        <section aria-label="イージングの編集" className={`${card} flex flex-col gap-5 p-4 sm:p-5`}>
          <header className="flex flex-col gap-2">
            {isCustom ? (
              <TextField
                label="名前"
                value={effective.name}
                onValueChange={(name) => setDraft({ ...effective, name })}
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="min-w-0 truncate text-lg font-semibold">{saved.name}</h2>
                  <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[11px] text-muted">
                    組み込み
                  </span>
                </div>
                <p className="text-xs text-muted">
                  組み込みのイージングは編集できません。変更はカスタムとして保存されます。
                </p>
              </>
            )}
          </header>

          <BezierEditor value={effective.bezier} onChange={setBezier} />

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {isCustom ? (
              <>
                <Button
                  variant="primary"
                  disabled={!dirty || effective.name.trim() === ""}
                  onClick={save}
                >
                  保存
                </Button>
                <Button disabled={!dirty} onClick={resetUiState}>
                  元に戻す
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  {confirmingDelete ? (
                    <>
                      <span className="text-xs text-muted">本当に削除しますか？</span>
                      <Button variant="primary" size="sm" onClick={remove}>
                        削除する
                      </Button>
                      <Button size="sm" onClick={() => setConfirmDeleteId(null)}>
                        キャンセル
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setConfirmDeleteId(saved.id)}>
                      削除
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="primary" onClick={saveAsCustom}>
                  カスタムとして保存
                </Button>
                <Button disabled={!dirty} onClick={resetUiState}>
                  元に戻す
                </Button>
              </>
            )}
            <p
              role="status"
              className="flex items-center gap-1.5 text-xs text-muted"
            >
              {dirty && (
                <>
                  <span aria-hidden className="size-2 rounded-full bg-accent" />
                  未保存の変更があります
                </>
              )}
            </p>
          </div>
        </section>

        <section
          aria-label="プレビューと比較"
          className={`${card} sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col gap-4 self-start overflow-auto p-4 sm:p-5`}
        >
          <h2 className="text-sm font-semibold">プレビューと比較</h2>
          <EasingComparePreview current={draftEasing} easings={easings} />

          <div className="flex min-w-0 flex-col gap-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">コード</h3>
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <TextField
                    label="cubic-bezier"
                    value={textValue}
                    spellCheck={false}
                    className="font-mono"
                    aria-invalid={textState?.invalid || undefined}
                    onValueChange={(text) =>
                      setTextDraft({ text, invalid: false, forBezier: formatted })
                    }
                    onBlur={commitText}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitText();
                    }}
                  />
                </div>
                <CopyButton
                  text={formatted}
                  variant="secondary"
                  className="h-9! shrink-0"
                />
              </div>
              {textState?.invalid && (
                <p role="alert" className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                  {BEZIER_ERROR}
                </p>
              )}
            </div>

            <CodeBlock filename="GSAP" code={gsapCode} />
          </div>
        </section>
      </div>
    </div>
  );
}
