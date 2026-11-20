import { GsapCheck } from "@/components/GsapCheck";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-16">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Animation Maker</h1>
        <p className="text-foreground/70">
          環境構築の動作確認ページです。CSS と GSAP の両方が動いていればOK。
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">CSS (Tailwind)</h2>
        <div className="size-16 animate-bounce rounded-lg bg-sky-500" />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">GSAP</h2>
        <GsapCheck />
      </section>
    </main>
  );
}
