"use client";

import Image from "next/image";
import s from "./SceneAkar.module.css";

const APAC_DESKTOP = [
  {
    flag: "🇮🇳", country: "India", rosca: "Chit Fund / Kuri",
    position: "left-[2%] top-[10%]",
    fact: "Regulated under Chit Fund Act 1982. A multi-billion-dollar industry bridging informal & formal finance.",
    color: "#f59e0b",
  },
  {
    flag: "🇨🇳", country: "China", rosca: "Hui / Biao Hui (标会)",
    position: "right-[2%] top-[10%]",
    fact: "Centuries-old rotating savings clubs. Thriving among rural communities & urban migrant workers nationwide.",
    color: "#e8180a",
  },
  {
    flag: "🇰🇷", country: "South Korea", rosca: "Kye (계)",
    position: "right-[2%] top-[30%]",
    fact: "Built on extreme trust. Many Seoul SMEs launched with Kye capital — no bank, no collateral.",
    color: "#0a9d6e",
  },
  {
    flag: "🇯🇵", country: "Japan", rosca: "Mujin / Tanomoshikō",
    position: "right-[2%] top-[50%]",
    fact: "Evolved into Japan's mutual banking giants. The spiritual ancestor of cooperative insurance.",
    color: "#6366f1",
  },
  {
    flag: "🇹🇼", country: "Taiwan", rosca: "Biao Hui (標會)",
    position: "left-[2%] top-[30%]",
    fact: "Competitive bidding sets payout order. Market-driven mechanism — the most sophisticated ROSCA variant.",
    color: "#0b8ce9",
  },
  {
    flag: "🇵🇭", country: "Philippines", rosca: "Paluwagan",
    position: "left-[2%] top-[50%]",
    fact: "The OFW lifeline. Millions abroad use Paluwagan to build savings and send lump sums home.",
    color: "#8b5cf6",
  },
  {
    flag: "🇻🇳", country: "Vietnam", rosca: "Hụi / Họ",
    position: "left-[2%] top-[70%]",
    fact: "Over 70% of rural households participate. A deeply trusted network of community lending.",
    color: "#ec4899",
  },
  {
    flag: "🇹🇭", country: "Thailand", rosca: "Len Share (เล่นแชร์)",
    position: "right-[2%] top-[70%]",
    fact: "Widespread across all social strata — from village women's groups to Bangkok corporate offices.",
    color: "#14b8a6",
  },
];

const APAC_MORE = [
  { flag: "🇧🇩", country: "Bangladesh", rosca: "Samity", fact: "NGO-driven microfinance ROSCA. Linked to Grameen Bank-style community group lending.", color: "#f97316" },
  { flag: "🇳🇵", country: "Nepal", rosca: "Dhikuti", fact: "Mountain community saving circles. Critical where formal banking infrastructure is absent.", color: "#84cc16" },
  { flag: "🇱🇰", country: "Sri Lanka", rosca: "Seettu", fact: "Centuries-old. Funds weddings, education, small enterprises in tight-knit communities.", color: "#06b6d4" },
  { flag: "🇵🇰", country: "Pakistan", rosca: "Committee", fact: "Neighborhood pooling for major purchases. Urban & rural, across all income levels.", color: "#a855f7" },
  { flag: "🇲🇲", country: "Myanmar", rosca: "Sein Ku", fact: "Vendor & trader savings circles. A resilient tradition through decades of economic upheaval.", color: "#eab308" },
  { flag: "🇲🇾", country: "Malaysia", rosca: "Kutu / Tontine", fact: "Multi-ethnic: Malay, Chinese & Indian communities. Often paired with festive gatherings.", color: "#ef4444" },
  { flag: "🇰🇭", country: "Cambodia", rosca: "Tong Tin / Tontine", fact: "French-colonial name, Khmer heart. Backbone of rural credit for millions of families.", color: "#3b82f6" },
  { flag: "🇱🇦", country: "Laos", rosca: "Houay", fact: "Village-level rotating savings. Essential in one of Asia's least-banked nations.", color: "#22d3ee" },
  { flag: "🇭🇰", country: "Hong Kong", rosca: "Hui (會)", fact: "Ubiquitous among office workers & families. An urban ROSCA powerhouse.", color: "#f43f5e" },
  { flag: "🇸🇬", country: "Singapore", rosca: "Tontine", fact: "Chinese diaspora tradition. Still alive among older generations & clan associations.", color: "#a78bfa" },
  { flag: "🇵🇬", country: "Papua New Guinea", rosca: "Wok Meri / Sande", fact: "Women-led savings & exchange. Combines financial pooling with cultural ceremony.", color: "#fb923c" },
  { flag: "🇫🇯", country: "Fiji", rosca: "Soli", fact: "Community contribution system. Rooted in Pacific Island traditions of collective giving.", color: "#2dd4bf" },
];

export function SceneAkar({ active }: { active: boolean }) {
  return (
    <div
      id="akar"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden px-4 sm:px-8 ${active ? "is-active" : ""}`}
      style={{ background: "#fafafa" }}
    >
      {/* Grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      {/* ── Center: APAC Map ── */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: "20vh" }}>
        <div className="relative w-[clamp(360px,70vmin,800px)] aspect-[1.05/1] opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.12)_0%,transparent_70%)]" />
          <Image
            src="/APACimage.png"
            alt="APAC Map"
            fill
            sizes="(max-width: 768px) 300px, 700px"
            className="object-contain opacity-85"
            style={{ filter: "hue-rotate(190deg) saturate(1.8) brightness(0.9) drop-shadow(0 0 6px rgba(212,160,23,0.25))" }}
            priority
          />
        </div>
      </div>

      {/* ── Headline ── */}
      <div className="absolute left-1/2 top-[5%] -translate-x-1/2 text-center z-10 sm:top-[6%]">
        <span
          className="inline-block border-[2px] border-[#d4a017] bg-white px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#d4a017]"
        >
          Asia Pacific
        </span>
        <h2 className="mt-3 font-display text-[clamp(1.4rem,4vw,2.4rem)] leading-[1.05] text-[#1a1a1a]">
          ROSCA <span style={{ color: "#d4a017" }}>Across APAC</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[480px] text-[11px] leading-relaxed text-[#888] sm:text-xs">
          From Indonesia&apos;s Arisan to Japan&apos;s Mujin — ROSCA is the invisible financial backbone of the world&apos;s fastest-growing region.
        </p>
      </div>

      {/* ── Country Cards (Desktop: positioned) ── */}
      {APAC_DESKTOP.map((c) => (
        <div
          key={c.country}
          className={`absolute z-10 hidden md:block ${c.position} scene-item`}
          style={{ transitionDelay: "180ms" }}
        >
          <div className={s.card}>
            <div className={s.cardHeader}>
              <span className={s.flag}>{c.flag}</span>
              <p className={s.heading}>{c.country}</p>
            </div>
            <p className={s.roscaName} style={{ color: c.color }}>
              {c.rosca}
            </p>
            <p>{c.fact}</p>
          </div>
        </div>
      ))}

      {/* ── Mobile: all countries grid ── */}
      <div className="absolute bottom-[5%] left-2 right-2 z-10 md:hidden">
        <div className="flex flex-wrap justify-center gap-1">
          {[...APAC_DESKTOP, ...APAC_MORE].map((c) => (
            <div
              key={c.country}
              className="flex items-center gap-1.5 border border-[#1a1a1a] bg-[#1a1a1a] px-2.5 py-1.5 text-white"
            >
              <span className="text-base">{c.flag}</span>
              <span className="text-[11px] font-bold" style={{ color: c.color }}>{c.rosca}</span>
              <span className="text-[10px] text-white/60">{c.country}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom marquee: stat + all 20 APAC countries ── */}
      <div className="absolute bottom-[-2%] left-0 right-0 z-10 overflow-hidden bg-[#d4a017] py-1.5">
        <style>{`@keyframes marqueeAPAC { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        <div
          className="flex w-max gap-8 whitespace-nowrap"
          style={{ animation: "marqueeAPAC 50s linear infinite" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 text-sm font-bold text-[#d4a017]">
              <span className="tracking-[0.15em] uppercase text-[#4a3000] text-xs font-black">
                20 countries in APAC · $1T+ annual volume · 500M+ participants · Zero banks required
              </span>
              <span className="text-[#6b4500]">|</span>
              {[...APAC_DESKTOP, ...APAC_MORE].map((c) => (
                <span key={c.country} className="flex items-center gap-1.5">
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-[#1a1a1a] font-bold text-sm">{c.country}</span>
                  <span className="text-[#4a3000] font-semibold text-sm">· {c.rosca}</span>
                </span>
              ))}
              <span className="text-[#6b4500]">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
