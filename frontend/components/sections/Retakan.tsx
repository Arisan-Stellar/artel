"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotRetakan } from "@/components/graphics/PackArt";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { revealItem } from "@/lib/reveal";

export function Retakan() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLElement>({ endVh: 160 });

  return (
    <section ref={ref} id="retakan" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-crack)" />
      <span
        className="font-display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[30vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(232,24,10,0.18)" }}
        aria-hidden
      >
        TRUST
      </span>
      <ReactiveArt className="pointer-events-none absolute right-[4%] top-1/2 hidden w-[clamp(220px,26vw,360px)] -translate-y-1/2 md:block">
        <SpotRetakan />
      </ReactiveArt>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-28">
        <ScenePanel accent="var(--color-crack)" style={revealItem(progress, 0.02, 0.2, 0, 40)}>
          <p
            className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(progress, 0, 0.12, 0, 16) }}
          >
            {dict.retakan.kicker}
          </p>
          <h2
            className="font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl"
            style={revealItem(progress, 0.05, 0.28)}
          >
            {dict.retakan.title}
          </h2>
          <p
            className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]"
            style={revealItem(progress, 0.15, 0.32)}
          >
            {dict.retakan.body}
          </p>
        </ScenePanel>

        {/* 4 Problem Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {dict.retakan.problems.map((problem, i) => {
            const a = 0.22 + i * 0.1;
            return (
              <div
                key={problem.label}
                className="brutal-card flex gap-4 p-4"
                style={revealItem(progress, a, a + 0.18, i % 2 === 0 ? -30 : 30, 16)}
              >
                <span className="text-3xl shrink-0">{problem.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[var(--color-text)]">{problem.label}</p>
                  <p className="mt-1 text-sm leading-snug text-[var(--color-muted)]">{problem.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bridge line */}
        <p
          className="mt-8 text-center text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--color-teal)", ...revealItem(progress, 0.6, 0.78, 0, 12) }}
        >
          {dict.retakan.bridge}
        </p>
      </div>
    </section>
  );
}
