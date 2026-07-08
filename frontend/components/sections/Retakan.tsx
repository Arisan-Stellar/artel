"use client";

import s from "@/components/scenes/ScenePercikan.module.css";

const FACES = [
  { num: "A", label: "Arisan", cls: s.f1 },
  { num: "R", label: "ROSCA", cls: s.f2 },
  { num: "T", label: "Trust", cls: s.f3 },
  { num: "E", label: "Equity", cls: s.f4 },
  { num: "L", label: "Liquidity", cls: s.f5 },
];

export function Retakan() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden px-5 sm:px-10 min-h-screen"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage:
            "linear-gradient(to right, rgba(212,160,23,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,160,23,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Cube - top right */}
      <div className="absolute top-[28%] right-[3%] z-10">
        <div className={s.cubeContainer}>
          <div className={s.stage}>
            <div className={s.cube}>
              {FACES.map(({ num, label, cls }) => (
                <div key={num} className={`${s.face} ${cls}`}>
                  <p className={s.panelNum}>{num}</p>
                  <span className={s.panelLabel}>{label}</span>
                </div>
              ))}
              <div className={`${s.face} ${s.f6}`}>
                <p className={s.panelNum}>✨</p>
                <span className={s.panelLabel}>Yield</span>
              </div>
            </div>
            <div className={s.shadowFloor} />
          </div>
          <span className={s.word}>ARTEL</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl pr-[300px]">
        <div>
          <span className="inline-block border-[3px] border-[#1a1a1a] bg-[#d4a017] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]" style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
            The Solution
          </span>
          <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3rem)] leading-[1.05] text-[#1a1a1a]">
            ARTEL — <span style={{ color: "#d4a017" }}>Arisan, On-Chain</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#666]">
            ARTEL brings Indonesia&apos;s centuries-old arisan tradition onto the <strong>Stellar blockchain</strong>. Every rule that once relied on social trust is now <strong>enforced by smart contracts</strong> — eliminating these four fundamental problems:
          </p>

          {/* Solution cards */}
          <div className="mt-2 flex flex-col gap-2">
            {[
              { problem: "🏃 Run-away Risk", solution: "125% Collateral", detail: "Every member locks 1.25× their total commitment. Fleeing costs more than staying. Game theory, not trust.", color: "#d4a017" },
              { problem: "💤 Idle Money", solution: "3-Layer Yield", detail: "Funds earn via DEX staking, Blend lending, and vault compounding. 8–15% estimated APY while waiting.", color: "#0a9d6e" },
              { problem: "📋 Manual Records", solution: "Immutable Ledger", detail: "Every contribution, every payout, every winner recorded permanently on Stellar. Zero disputes.", color: "#0b8ce9" },
              { problem: "🔒 Limited Scale", solution: "Global, Permissionless", detail: "Anyone with a Stellar wallet can join. Break free from geography — arisan goes borderless.", color: "#8b5cf6" },
            ].map((s) => (
              <div key={s.problem} className="border-[3px] border-[#1a1a1a] bg-white p-3" style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-black uppercase tracking-wider text-[#999]">{s.problem}</p>
                  <span className="text-[10px] font-black uppercase" style={{ color: s.color }}>{s.solution}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#888]">{s.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-[3px] border-[#1a1a1a] bg-white p-3 inline-block" style={{ boxShadow: "4px 4px 0 #d4a017" }}>
            <p className="text-xs font-bold text-[#1a1a1a]">
              Trustless. Transparent. Borderless. <span style={{ color: "#d4a017" }}>Built on Stellar, rooted in Indonesian tradition.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
