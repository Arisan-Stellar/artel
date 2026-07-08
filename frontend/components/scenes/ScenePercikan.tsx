"use client";

import s from "./ScenePercikan.module.css";

export function ScenePercikan({ active }: { active: boolean }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden px-5 sm:px-10 ${active ? "is-active" : ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage:
            "linear-gradient(to right, rgba(232,24,10,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,24,10,0.12) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Abstergo loader — top right */}
      <div className="absolute top-[24%] right-[20%] pointer-events-none z-10">
        <div className="border-[3px] border-[#1a1a1a] bg-white px-10 py-8" style={{ boxShadow: "5px 5px 0 #1a1a1a" }}>
        <div className={s["ui-abstergo"]}>
          <div className={s["abstergo-loader"]}>
            <div />
            <div />
            <div />
          </div>
          <div className={s["ui-text"]}>
            <span>ARISAN</span>
            <span className={s["ui-dot"]} />
            <span className={s["ui-dot"]} />
            <span className={s["ui-dot"]} />
          </div>
        </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-end pr-[3%] pointer-events-none opacity-30">
        <h1
          className="font-display text-[clamp(5rem,18vw,14rem)] leading-none tracking-[-0.04em]"
          style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(212,160,23,0.2)" }}
        >
          ARISAN
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 gap-8 pt-10">
        <div>
          <span className="inline-block border-[3px] border-[#1a1a1a] bg-[#d4a017] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#1a1a1a]" style={{ boxShadow: "4px 4px 0 #1a1a1a" }}>
            Indonesia
          </span>
          <h2 className="font-display mt-4 text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.05] text-[#1a1a1a]">
            Arisan, <span style={{ color: "#e8180a" }}>The Original ROSCA</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#666]">
            Arisan is Indonesia&apos;s centuries-old rotating savings circle — a trusted, community-driven financial practice woven into the fabric of daily life.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#666]">
            Unlike formal banking, arisan runs on <strong>pure social trust</strong>. No contracts, no collateral, no interest. Members contribute a fixed amount each cycle, and one member takes the entire pool — rotating until everyone has won.
          </p>

          <div className="mt-8 border-[3px] border-[#1a1a1a] bg-white p-4" style={{ boxShadow: "4px 4px 0 #d4a017" }}>
            <p className="text-xs font-bold text-[#1a1a1a]">
              Arisan is more than finance — it&apos;s <span style={{ color: "#e8180a" }}>social glue</span>, predominantly <span style={{ color: "#e8180a" }}>women-led</span>, scales across <span style={{ color: "#e8180a" }}>all income levels</span>, and has survived <span style={{ color: "#e8180a" }}>centuries of change</span>.
            </p>
          </div>

          <div className="mt-4 border-[3px] border-[#1a1a1a] bg-white p-4" style={{ boxShadow: "4px 4px 0 #e8180a" }}>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#e8180a] mb-3">ROSCA works beautifully — but it still has these 4 problems</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">🏃 Run-away Risk</p>
                <p className="text-[10px] leading-relaxed text-[#999] mt-0.5">Treasurer or winner disappears with pooled money. Zero recourse — trust alone is the only enforcement.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">💤 Idle Money</p>
                <p className="text-[10px] leading-relaxed text-[#999] mt-0.5">Cash sits idle between cycles. Zero interest earned while members wait their turn.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">📋 Manual Records</p>
                <p className="text-[10px] leading-relaxed text-[#999] mt-0.5">Paper notebooks & WhatsApp groups. Errors, forgotten payments, and disputes are inevitable.</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">🔒 Limited Scale</p>
                <p className="text-[10px] leading-relaxed text-[#999] mt-0.5">Bound by geography and social circles. Can&apos;t grow beyond people you know personally.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
