"use client";

import { useDict } from "@/lib/i18n/LocaleProvider";
import { usePinned } from "@/components/motion/usePinned";
import { ReactiveArt } from "@/components/graphics/ReactiveArt";
import { SpotSistem } from "@/components/graphics/PackArt";
import { SceneDecor } from "@/components/ui/SceneDecor";
import { ScenePanel } from "@/components/ui/ScenePanel";
import { ramp, revealItem } from "@/lib/reveal";

const RULE_ICONS = ["👥", "⭐", "⚡", "🎯", "💰"];

export function Sistem() {
  const dict = useDict();

  const { ref: stageRef, progress: p1 } = usePinned<HTMLDivElement>({ endVh: 150 });
  const { ref: rulesRef, progress: p2 } = usePinned<HTMLDivElement>({ endVh: 200 });

  const steps = dict.sistem.timeline;
  const ringP = ramp(p1, 0.2, 1);
  const active = Math.min(steps.length - 1, Math.floor(ringP * steps.length));

  return (
    <section id="sistem" className="relative overflow-hidden">
      <SceneDecor accent="var(--color-artel)" />
      <span
        className="font-display pointer-events-none absolute -right-10 top-10 select-none text-[24vw] leading-none"
        style={{ color: "transparent", WebkitTextStroke: "2px rgba(12,140,233,0.14)" }}
        aria-hidden
      >
        RULES
      </span>

      {/* Stage 1 — Timeline stepper */}
      <div
        ref={stageRef}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <ReactiveArt
          parallax={0}
          className="pointer-events-none absolute left-[4%] top-1/2 hidden w-[clamp(180px,18vw,280px)] -translate-y-1/2 opacity-80 lg:block"
        >
          <SpotSistem />
        </ReactiveArt>
        <ScenePanel accent="var(--color-artel)" className="mx-auto max-w-2xl text-center" style={revealItem(p1, 0.02, 0.18, 0, 36)}>
          <p
            className="brutal-badge mb-4 inline-block px-3 py-1.5 text-xs"
            style={{ background: "var(--color-amber)", color: "var(--color-ink)", ...revealItem(p1, 0, 0.12, 0, 16) }}
          >
            {dict.sistem.kicker}
          </p>
          <h2
            className="font-display mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={revealItem(p1, 0.05, 0.2)}
          >
            {dict.sistem.title}
          </h2>
        </ScenePanel>

        <div className="my-8 w-full max-w-md" style={revealItem(p1, 0.1, 0.24, 0, 0)}>
          <div className="border-[4px] border-[var(--color-text)] bg-[var(--color-surface)] px-6 py-7 text-center brutal-shadow">
            <span className="tabular font-num text-6xl font-bold leading-none" style={{ color: "var(--color-artel)" }}>
              {steps[active].day}
            </span>
            <span className="mt-2 block text-sm uppercase tracking-wider text-[var(--color-muted)]">
              {steps[active].label}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            {steps.map((s, i) => (
              <div
                key={s.day}
                className="h-4 flex-1 border-[3px] border-[var(--color-text)]"
                style={{ background: i <= active ? "var(--color-artel)" : "var(--color-surface)" }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-3"
          style={revealItem(p1, 0.15, 0.3)}
        >
          {steps.map((t, i) => (
            <div
              key={t.day}
              data-testid="timeline-step"
              className="rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300"
              style={{
                borderColor: i === active ? "var(--color-artel)" : "rgba(10,10,10,0.2)",
                color: i === active ? "var(--color-text)" : "var(--color-muted)",
                opacity: i <= active ? 1 : 0.5,
              }}
            >
              <span className="tabular">{t.day}</span> · <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stage 2 — 5 Rule Cards + Yield Split */}
      <div
        ref={rulesRef}
        className="relative z-10 flex min-h-screen flex-col justify-center px-6 py-24"
      >
        <div className="mx-auto w-full max-w-[1000px]">
          <p
            className="mb-10 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]"
            style={revealItem(p2, 0, 0.08)}
          >
            {dict.sistem.body}
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {dict.sistem.rules.slice(0, 3).map((rule, i) => {
              const a = 0.06 + i * 0.1;
              return (
                <div
                  key={i}
                  data-testid="rule"
                  className="brutal-card flex gap-4 p-5 text-sm leading-relaxed"
                  style={revealItem(p2, a, a + 0.18, i % 2 === 0 ? -30 : 30, 20)}
                >
                  <span className="text-2xl shrink-0">{RULE_ICONS[i]}</span>
                  <div>
                    <span className="tabular font-num text-lg font-bold" style={{ color: "var(--color-artel)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1 text-[var(--color-muted)]">{rule}</p>
                  </div>
                </div>
              );
            })}

            {/* Rule 4 — Winner Draw (full width section start) */}
            <div
              data-testid="rule"
              className="brutal-card flex gap-4 p-5 text-sm leading-relaxed sm:col-span-2"
              style={revealItem(p2, 0.36, 0.54, 0, 20)}
            >
              <span className="text-2xl shrink-0">{RULE_ICONS[3]}</span>
              <div className="flex-1">
                <span className="tabular font-num text-lg font-bold" style={{ color: "var(--color-artel)" }}>04</span>
                <p className="mt-1 text-[var(--color-muted)]">{dict.sistem.rules[3]}</p>
              </div>
            </div>

            {/* Rule 5 — Yield Split + Visual Bar */}
            <div
              data-testid="rule"
              className="brutal-card flex flex-col gap-4 p-5 text-sm leading-relaxed sm:col-span-2"
              style={revealItem(p2, 0.46, 0.64, 0, 20)}
            >
              <div className="flex gap-4">
                <span className="text-2xl shrink-0">{RULE_ICONS[4]}</span>
                <div className="flex-1">
                  <span className="tabular font-num text-lg font-bold" style={{ color: "var(--color-artel)" }}>05</span>
                  <p className="mt-1 text-[var(--color-muted)]">{dict.sistem.rules[4]}</p>
                </div>
              </div>

              {/* Yield Split Bar */}
              <div className="mt-2">
                <div className="flex h-10 w-full overflow-hidden border-[3px] border-[var(--color-text)]">
                  <div className="flex items-center justify-center text-xs font-bold text-white" style={{ width: "10%", background: "var(--color-crack)" }}>
                    10%
                  </div>
                  <div className="flex items-center justify-center text-xs font-bold" style={{ width: "50%", background: "var(--color-artel)", color: "var(--color-ink)" }}>
                    50%
                  </div>
                  <div className="flex items-center justify-center text-xs font-bold text-white" style={{ width: "40%", background: "var(--color-teal)" }}>
                    40%
                  </div>
                </div>
                <div className="mt-2 flex text-[10px] font-bold uppercase tracking-wide">
                  <span className="text-[var(--color-crack)]" style={{ width: "10%" }}>{dict.sistem.yieldOps}</span>
                  <span style={{ width: "50%", color: "var(--color-text)" }}>{dict.sistem.yieldShare}</span>
                  <span className="text-right" style={{ width: "40%", color: "var(--color-teal)" }}>{dict.sistem.yieldVault}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
