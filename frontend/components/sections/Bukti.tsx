"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotBukti } from "@/components/graphics/PackArt";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { revealItem } from "@/lib/reveal";

export function Bukti() {
  const dict = useDict();
  const { ref, progress } = usePinned<HTMLElement>({ endVh: 170 });

  const items = dict.bukti.items;

  return (
    <section ref={ref} id="bukti" className="relative min-h-screen overflow-hidden">
      <SceneDecor accent="var(--color-teal)" />
      <GhostWord
        text="PROOF"
        stroke="rgba(10,157,110,0.13)"
        className="left-[2%] bottom-[6%] text-[20vw]"
      />
      <ReactiveArt className="pointer-events-none absolute right-[4%] top-[14%] hidden w-[clamp(200px,22vw,320px)] md:block">
        <SpotBukti />
      </ReactiveArt>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1000px] flex-col justify-center px-6 py-28">
        <ScenePanel accent="var(--color-teal)" className="max-w-2xl" style={revealItem(progress, 0.02, 0.22, 0, 40)}>
          <p
            className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(progress, 0, 0.12, 0, 16) }}
          >
            {dict.bukti.kicker}
          </p>
          <h2
            className="font-display text-4xl leading-[1.02] sm:text-6xl"
            style={revealItem(progress, 0.05, 0.25)}
          >
            {dict.bukti.title}
          </h2>
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]"
            style={revealItem(progress, 0.12, 0.3)}
          >
            {dict.bukti.body}
          </p>
        </ScenePanel>

        {/* Comparison Table */}
        <div className="mt-12" style={revealItem(progress, 0.2, 0.38, 0, 36)}>
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[1.4fr_1fr_1fr] border-b-[3px] border-[var(--color-text)] pb-3 mb-2">
            <span className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-muted)]">Metric</span>
            <span className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-teal)]">{dict.bukti.vsLabel}</span>
            <span className="text-xs font-black uppercase tracking-[0.15em] text-[var(--color-crack)]">{dict.bukti.vsLabel2}</span>
          </div>

          {items.map((item, i) => {
            const a = 0.22 + i * 0.08;
            return (
              <div
                key={item.metric}
                className="grid grid-cols-1 gap-2 border-b-[2px] border-[var(--color-text)] border-opacity-15 py-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-4"
                style={revealItem(progress, a, a + 0.12, 0, 24)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="text-sm font-bold text-[var(--color-text)]">{item.metric}</span>
                </div>
                <div className="flex items-center gap-2 pl-9 sm:pl-0">
                  <span className="text-sm font-semibold text-[var(--color-teal)] leading-snug">{item.artel}</span>
                </div>
                <div className="flex items-center gap-2 pl-9 sm:pl-0">
                  <span className="text-sm text-[var(--color-muted)] leading-snug">{item.legacy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
