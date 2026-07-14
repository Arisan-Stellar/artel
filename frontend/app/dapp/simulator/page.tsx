"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useDict } from "@/lib/i18n/LocaleProvider";

export default function SimulatorPage() {
  const { dapp } = useDict();
  const [deposit, setDeposit] = useState(25);
  const [participants, setParticipants] = useState(10);
  const [cycleDays, setCycleDays] = useState(30);

  const collateral = useMemo(() => Math.ceil(deposit * (participants - 1) * 1.25), [deposit, participants]);
  const totalUpfront = deposit + collateral;
  const totalPool = deposit * participants;
  const poolDurationDays = cycleDays * participants;
  const poolDurationMonths = Math.round(poolDurationDays / 30);
  const xlmGasPerTx = 0.00001;
  const xlmTotalGas = xlmGasPerTx * (participants + 1);
  const presets = [10, 25, 50, 100];

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-24 md:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <AnimatedBadge icon={<Calculator className="size-4" />} text=">SIMULATOR" />
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
              Math That<br />
              <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>Never Lies</span>
            </h1>
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
              <p className="text-lg font-semibold leading-7 text-[#333333]">
                See exactly how much collateral protects your pool. Adjust the sliders. The 125% ratio makes running away unprofitable every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-6">
              {/* Config Card */}
              <div className="card" style={{ "--primary": "#f8672d", "--secondary": "#38bdf8", "--accent": "#14b8a6" } as React.CSSProperties}>
                <div className="card-pattern-grid" />
                <div className="card-overlay-dots" />
                <div className="bold-pattern">
                  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                    <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
                    <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                    <circle cx="72" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>
                <div className="card-title-area">
                  <span>Pool Setup</span>
                  <div className="card-tag">v1.0</div>
                </div>
                <div className="card-body">
                  {[
                    { label: "Contribution / Cycle", value: deposit, unit: "XLM", set: setDeposit, min: 5, max: 500, step: 5, presets },
                    { label: "Group Size", value: participants, unit: "", set: setParticipants, min: 2, max: 50, step: 1 },
                    { label: "Cycle Length", value: cycleDays, unit: "d", set: setCycleDays, min: 7, max: 90, step: 1 },
                  ].map(({ label, value, unit, set, min, max, step, presets: p }) => (
                    <div className="mb-5" key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase tracking-[0.08em] text-[#0a0a0a]">{label}</label>
                        <span className="text-xl font-black text-[#0a0a0a]" style={HEADING_FONT}>{value} {unit && <span className="text-sm">{unit}</span>}</span>
                      </div>
                      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}
                        className="w-full h-2 appearance-none cursor-pointer bg-[#e8e1d9] accent-[#0a0a0a] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:bg-[#f8672d] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-[#0a0a0a] [&::-webkit-slider-thumb]:shadow-[2px_2px_0_#0a0a0a]" />
                      {p && (
                        <div className="mt-2 flex gap-1.5">
                          {p.map((n) => (
                            <button key={n} onClick={() => set(n)}
                              className={`text-xs font-black uppercase tracking-[0.12em] border-[2px] border-[#0a0a0a] px-2.5 py-1 transition ${value === n ? "bg-[#f8672d] text-[#0a0a0a] shadow-[3px_3px_0_#0a0a0a]" : "bg-white text-[#333333] hover:bg-[#e8e1d9]"}`} style={LABEL_MONO}>{n}</button>
                          ))}
                        </div>
                      )}
                      <div className="mt-1 flex justify-between text-xs font-semibold text-[#333333]"><span>{min} {unit}</span><span>{max} {unit}</span></div>
                    </div>
                  ))}
                  <div className="card-actions">
                    <div className="price">{totalPool}<span className="price-currency">XLM</span><span className="price-period">TOTAL POOL</span></div>
                  </div>
                </div>
                <div className="dots-pattern">
                  <svg viewBox="0 0 200 100" style={{ width: "100%", height: "100%" }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <circle key={i} cx={i * 7} cy={Math.sin(i) * 30 + 50} r="1" fill="currentColor" opacity="0.5" />
                    ))}
                  </svg>
                </div>
                <div className="accent-shape" />
                <div className="stamp">
                  <div className="stamp-inner"><span className="stamp-text">CONFIG</span></div>
                </div>
                <div className="corner-slice" />
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {/* Total Upfront Card */}
              <div className="card" style={{ "--primary": "#3b82f6", "--secondary": "#93c5fd", "--accent": "#f59e0b" } as React.CSSProperties}>
                <div className="card-pattern-grid" />
                <div className="card-overlay-dots" />
                <div className="bold-pattern">
                  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                    <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
                    <circle cx="50" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
                  </svg>
                </div>
                <div className="card-title-area">
                  <span>Total Upfront</span>
                  <div className="card-tag">vol.01</div>
                </div>
                <div className="card-body">
                  <div className="feature-grid">
                    <div className="feature-item">
                      <div className="feature-icon"><span className="text-xs font-black">D</span></div>
                      <span className="feature-text">Deposit: {deposit} XLM</span>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon" style={{ background: "#fde68a" }}><span className="text-xs font-black">C</span></div>
                      <span className="feature-text">Collateral: {collateral} XLM</span>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon" style={{ background: "#5eead4" }}><span className="text-xs font-black">G</span></div>
                      <span className="feature-text">Gas: ~{xlmTotalGas.toFixed(5)} XLM</span>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon" style={{ background: "#fbcfe8" }}><span className="text-xs font-black">%</span></div>
                      <span className="feature-text">Collateral: 125%</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-[#333] mb-2">Anti-run protection: if someone wins {deposit} XLM and leaves, they lose {collateral} XLM — a net loss of {collateral - deposit} XLM.</p>
                  <div className="card-actions">
                    <div className="price">{totalUpfront.toLocaleString()}<span className="price-currency">XLM</span><span className="price-period">TOTAL UPFRONT</span></div>
                  </div>
                </div>
                <div className="dots-pattern">
                  <svg viewBox="0 0 200 100" style={{ width: "100%", height: "100%" }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <circle key={i} cx={i * 7} cy={Math.sin(i) * 30 + 50} r="1" fill="currentColor" opacity="0.5" />
                    ))}
                  </svg>
                </div>
                <div className="accent-shape" />
                <div className="stamp">
                  <div className="stamp-inner"><span className="stamp-text">125%</span></div>
                </div>
                <div className="corner-slice" />
              </div>

              {/* Summary Card */}
              <div className="card" style={{ "--primary": "#14b8a6", "--secondary": "#5eead4", "--accent": "#f8672d" } as React.CSSProperties}>
                <div className="card-pattern-grid" />
                <div className="card-overlay-dots" />
                <div className="card-title-area">
                  <span>Pool Summary</span>
                  <div className="card-tag">summary</div>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4" style={{ marginBottom: "0.8em" }}>
                    {[
                      { label: "TOTAL POOL", value: `${totalPool.toLocaleString()} XLM` },
                      { label: "CYCLES", value: String(participants) },
                      { label: "DURATION", value: `${poolDurationDays}d (${poolDurationMonths}mo)` },
                      { label: "COLL/PERSON", value: `${collateral} XLM` },
                    ].map(({ label, value }) => (
                      <div key={label} className="border-[2px] border-[#0a0a0a] bg-white p-2 rounded-sm text-center">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0a0a0a]" style={LABEL_MONO}>{label}</p>
                        <p className="text-xl font-black text-[#0a0a0a]" style={HEADING_FONT}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-[#0a0a0a]">
                    <strong>Anti-run math:</strong> The 125% ratio ensures running away is always unprofitable. Net loss for quitter: {collateral - deposit} XLM.
                  </p>
                  <div className="card-actions">
                    <div className="price">{totalUpfront}<span className="price-currency">XLM</span><span className="price-period">UPFRONT</span></div>
                  </div>
                </div>
                <div className="dots-pattern">
                  <svg viewBox="0 0 200 100" style={{ width: "100%", height: "100%" }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <circle key={i} cx={i * 7} cy={Math.sin(i) * 30 + 50} r="1" fill="currentColor" opacity="0.5" />
                    ))}
                  </svg>
                </div>
                <div className="accent-shape" />
                <div className="stamp">
                  <div className="stamp-inner"><span className="stamp-text">MATH</span></div>
                </div>
                <div className="corner-slice" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
