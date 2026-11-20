# エージェント用メモ

AI エージェント（Claude Code など）向けの、このプロジェクトのルールとメモ。
`CLAUDE.md` から読み込まれるため、セッションをまたいで参照される。ルールが増えたらここに追記する。

## プロジェクト概要

- アニメーションのまとめ・調整サイト。UI で動きを確認・調整し、CSS / JS / GSAP のコードを生成して、コピーするだけで使えるようにする。
- ページ
  - `/create`: アニメーションの新規作成
  - `/easings`: カスタムイージングの管理
  - プリセット型は今後追加予定。`AnimationEditor` を `initialConfig` と `sections` で使い回す。
- スタック: Next.js 16（App Router）/ React 19 / Tailwind CSS v4 / TypeScript / pnpm / GSAP / lucide-react
- ホスティングは Vercel の無料プラン。静的生成を中心にし、サーバー処理や DB は使わない。ユーザーの設定は localStorage に保存する。
- 対象は PC のみ。スマホ表示の対応や確認は不要。

## ディレクトリ構成

| ディレクトリ | 置くもの |
|---|---|
| `src/app/` | ページ |
| `src/components/ui/` | 汎用 UI 部品（`index.ts` から export） |
| `src/components/layout/` | ヘッダーやページレイアウト |
| `src/components/editor/` / `src/components/easing/` | 機能ごとのコンポーネント |
| `src/hooks/` | カスタムフック。1 フック 1 ファイルで `@/hooks/useXxx` から import する |
| `src/utils/` | 自作のロジック（アニメーションのモデル、コード生成、設定ストア、`cn` など） |
| `src/lib/` | サードパーティ製コード専用。自作コードは置かない |
| `doc/` | エージェント用メモ（このファイル） |

## 画面の役割

- コントロールパネル: アニメーションのプロパティを設定する場所だけ。実装方式や発火タイミングは置かない。
- プレビュー: アニメーションの動きを確認するだけ。設定の切り替えボタンは置かない。
- コードセクション: 実装方式（transition / @keyframes / GSAP）と発火タイミング（読み込み時 / クラス付与時 など）を選ぶ場所。

## 作業の進め方

- ユーザーの指示に対して、計画は親エージェントが立て、実装などの実行は Sonnet のサブエージェント（`model: "sonnet"`）に任せる。親は結果を自分で確認してからユーザーに報告する。
- ユーザーへの報告は日本語で行う。
- コミットや push はユーザーに頼まれたときだけ行う。
- ポート 3000 で動いているユーザーの `pnpm dev` は止めない・再起動しない。
- 確認コマンド: `pnpm exec tsc --noEmit` / `pnpm lint` / `pnpm build`。画面は PC 幅（1440px）で確認する。

## 実装上の注意

- `src/app/globals.css`（`@theme` のトークンなど）を変更すると、起動中の dev サーバーに反映されないことがある。その場合はユーザーに `pnpm dev` の再起動を案内する。
- Lint は React Compiler のフックルールが厳しい。effect の中で同期的に setState しない。レンダー中に `ref.current` を読まない。
- localStorage を使う状態は `src/utils/settings/local-store.ts` の `createLocalStore`（`useSyncExternalStore` ベース、サーバー側は初期値）で作る。
- `cn()` はクラス名を単純に結合するだけ（tailwind-merge なし）。クラスを上書きしたいときは `!` 修飾子を使う。
- UI のテキストとコードのコメントは日本語で書く。
- クリックできる要素には `cursor-pointer` を付ける。アイコンは lucide-react を使う。
- 生成コードでアニメーション対象に付けるクラスは `.anim`、CSS の発火用クラスの既定は `is-show`（GSAP は発火用クラスを使わず、tween.play() / show プロパティで再生する）。プレビューは生成コードと同じ CSS / GSAP の値で動かし、見た目とコードを一致させる。
- `next.config.ts` で `cacheComponents` が有効。`dynamicParams` などの旧 route segment config は使えない。データ取得がないのに `params` を読む動的ルートで Instant Navigation の検証エラーが出る場合は、Suspense ではなく `export const instant = false` で外す。
