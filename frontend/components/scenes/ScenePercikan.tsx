"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { Spark } from "@/components/graphics/Motifs";
import { GhostWord } from "@/components/ui/GhostWord";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { ArrowRight } from "lucide-react";

export function ScenePercikan({ active }: { active: boolean }) {
  const dict = useDict();
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center px-6 ${active ? "is-active" : ""}`}
    >
      <SceneDecor accent="var(--color-amber)" />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 60% at 22% 30%, rgba(217,130,0,0.12), transparent 70%)" }}
        aria-hidden
      />
      <GhostWord
        text="LEDGER"
        stroke="rgba(217,130,0,0.13)"
        className="right-[1%] bottom-[8%] text-[19vw]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <ScenePanel accent="var(--color-amber)" className="scene-item rotate-[0.8deg]" style={{ transitionDelay: "60ms" }}>
            <p
              className="brutal-badge mb-5 inline-block px-3 py-1.5 text-xs"
              style={{ background: "var(--color-amber)", color: "var(--color-ink)" }}
            >
              {dict.percikan.kicker}
            </p>
            <h2 className="font-display text-3xl leading-[1.02] sm:text-5xl">
              {dict.percikan.title}
            </h2>
            <p className="mt-5 max-w-xl border-l-[5px] border-[var(--color-amber)] pl-4 text-base leading-relaxed text-[var(--color-muted)]">
              {dict.percikan.body}
            </p>
          </ScenePanel>

          {/* Before → After bridge cards */}
          <div className="scene-item mt-7 flex flex-wrap items-start gap-4 sm:gap-6" style={{ transitionDelay: "320ms" }}>
            {dict.percikan.points.map((p, i) => {
              const [before, after] = p.split(" → ");
              const c = ["var(--color-crack)", "var(--color-artel)", "var(--color-teal)"][i % 3];
              return (
                <div
                  key={p}
                  className="flex items-center gap-2 sm:gap-3"
                  style={{ marginTop: `${[18, 0, 10][i % 3]}px` }}
                >
                  <div className="w-[100px] border-[3px] border-[var(--color-text)] bg-[var(--color-surface)] px-2 py-3 text-center brutal-shadow">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]" style={{ textDecoration: "line-through" }}>{before}</span>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-[var(--color-muted)]" />
                  <div className="w-[100px] border-[3px] border-[var(--color-text)] px-2 py-3 text-center brutal-shadow" style={{ background: c, color: c === "var(--color-crack)" ? "#fff" : "var(--color-ink)" }}>
                    <span className="block text-[10px] font-bold uppercase tracking-wider">{after}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="scene-item relative mx-auto hidden md:block"
          style={{ transitionDelay: "340ms" }}
        >
          <div
            className="spark-glow pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 rounded-full blur-2xl"
            style={{ background: "var(--color-amber)" }}
            aria-hidden
          />
          <Spark className="spark-anim relative w-[clamp(160px,18vw,240px)]" color="var(--color-amber)" />
          <span
            className="float-y absolute right-0 top-3 h-3 w-3 rounded-full border-2 border-[var(--color-text)]"
            style={{ background: "var(--color-artel)" }}
            aria-hidden
          />
          <span
            className="float-y absolute -left-2 bottom-8 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-text)]"
            style={{ background: "var(--color-teal)", animationDelay: "0.9s" }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
