"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { ArisanCircle } from "@/components/graphics/Motifs";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";

export function SceneAkar({ active }: { active: boolean }) {
  const dict = useDict();
  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 sm:px-6 ${active ? "is-active" : ""}`}
    >
      <SceneDecor accent="var(--color-amber)" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 60% at 82% 28%, rgba(255,208,0,0.08), transparent 60%)" }}
        aria-hidden
      />
      <GhostWord
        text="WORLD"
        stroke="rgba(217,130,0,0.10)"
        className="right-[-4%] bottom-[-2%] text-[16vw]"
      />

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-6 pt-8">
        {/* Header: kicker + compact title + stat */}
        <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:text-left sm:gap-6">
          <ScenePanel accent="var(--color-amber)" className="scene-item inline-flex max-w-md rotate-[-0.5deg]" style={{ transitionDelay: "60ms" }}>
            <p
              className="brutal-badge mb-2 inline-block px-3 py-1.5 text-xs"
              style={{ background: "var(--color-amber)", color: "var(--color-ink)" }}
            >
              {dict.akar.kicker}
            </p>
            <h2 className="font-display text-2xl leading-[1.02] sm:text-3xl">
              {dict.akar.title}
            </h2>
          </ScenePanel>

          <div className="scene-item flex items-center gap-3" style={{ transitionDelay: "240ms" }}>
            <ArisanCircle className="spin-slow hidden w-[clamp(60px,8vw,90px)] lg:block" color="var(--color-text)" />
            <div className="brutal-card inline-flex w-fit rotate-[2deg] items-end gap-3 px-5 py-3">
              <span className="tabular font-num text-4xl font-bold sm:text-5xl" style={{ color: "var(--color-amber)" }}>
                {dict.akar.statValue}
              </span>
              <span className="mb-1 max-w-[14ch] text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
                {dict.akar.statLabel}
              </span>
            </div>
          </div>
        </div>

        {/* 24 country cards — 4 columns on desktop, 2 on mobile */}
        <div className="scene-item grid w-full grid-cols-3 gap-1 sm:grid-cols-4 lg:grid-cols-6" style={{ transitionDelay: "180ms" }}>
          {dict.akar.countries.map((c, i) => (
            <div
              key={c.name}
              className="brutal-card group relative flex cursor-pointer flex-col items-center gap-0.5 px-1.5 py-1.5 text-center transition hover:-translate-y-1"
            >
              <span className="text-2xl leading-none">{c.flag}</span>
              <p className="font-display text-[11px] leading-tight" style={{ color: "var(--color-amber)" }}>{c.local}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">{c.name}</p>
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 border-[3px] border-[var(--color-text)] bg-[var(--color-artel)] p-2.5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.2)] group-hover:block">
                <p className="text-[10px] font-semibold leading-snug text-[var(--color-ink)]">{c.fact}</p>
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-[6px] border-transparent border-t-[var(--color-artel)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom fact badges */}
        <div className="scene-item flex flex-wrap justify-center gap-2 pb-4" style={{ transitionDelay: "600ms" }}>
          {dict.akar.facts.map((f, i) => (
            <span
              key={f}
              className="brutal-badge bg-[var(--color-surface)] px-3 py-1 text-[10px] text-[var(--color-text)]"
              style={{ transform: `rotate(${[-2, 1.5, -1.5][i % 3]}deg)` }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
