"use client";

import { useState } from "react";
import { User, Wallet, Users, Trophy, PiggyBank, Zap, Copy, Award } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";
import WalletCard from "@/components/dapp/WalletCard";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";

const STATS = [
  { label: "ACTIVE POOLS", value: "3", icon: Users, color: "#f9a8d4", decor: "🌸" },
  { label: "ROUNDS WON", value: "2", icon: Trophy, color: "#e879f9", decor: "🏆" },
  { label: "TOTAL SAVED", value: "300 XLM", icon: PiggyBank, color: "#5eead4", decor: "💰" },
  { label: "YIELD EARNED", value: "12.5 XLM", icon: Zap, color: "#fb923c", decor: "⚡" },
];

const ACTIVITY = [
  { type: "create" as const, label: "Created pool", pool: "Arisan RT 05", time: "3 months ago" },
  { type: "win" as const, label: "Won cycle #1", pool: "Keluarga Harmoni", time: "2 months ago" },
  { type: "join" as const, label: "Joined pool", pool: "Komunitas DeFi", time: "1 month ago" },
  { type: "win" as const, label: "Won cycle #3", pool: "Arisan RT 05", time: "2 weeks ago" },
];

const BADGES = [
  { icon: "✨" as const, label: "Early Bird", desc: "10 early payments", color: "#fde68a" },
  { icon: "🛡️" as const, label: "Streak Master", desc: "5x streak", color: "#93c5fd" },
  { icon: "🏆" as const, label: "Winner", desc: "2 rounds won", color: "#fcd34d" },
];

export default function ProfilePage() {
  const { address } = useWallet();
  const [copied, setCopied] = useState(false);
  const displayAddr = address ? `${address.slice(0,6)}...${address.slice(-4)}` : "";

  if (!address) {
    return (
      <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-md border-[4px] border-[#0a0a0a] bg-grid-brutal p-10 text-center shadow-[14px_14px_0_#0a0a0a]">
          <div className="mx-auto mb-6 grid size-16 place-items-center border-[3px] border-[#0a0a0a] bg-[var(--color-sui)]"><Wallet className="size-7 text-[#0a0a0a]" /></div>
          <h2 className="text-5xl font-black" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>Connect Your Wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-24 md:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <AnimatedBadge icon={<User className="size-4" />} text=">PROFILE" />
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
              Your Journey.<br />
              <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>On-Chain.</span>
            </h1>
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
              <p className="text-lg font-semibold leading-7 text-[#333333]">
                Every contribution, every win, every yield earned — permanently recorded on the Stellar blockchain. Your reputation grows with every cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <WalletCard />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="brutal-subscribe__container group" style={{ maxWidth: "none" }}>
                  <div className="brutal-subscribe__header" style={{ backgroundColor: stat.color }}>
                    <span className="brutal-subscribe__title text-3xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", textShadow: "3px 3px 0 rgba(0,0,0,0.2)" }}>{stat.value}</span>
                    <span className="brutal-subscribe__subtitle text-xs font-black tracking-[0.15em]" style={LABEL_MONO}>{stat.label}</span>
                  </div>
                  <div className="brutal-subscribe__form flex items-center justify-between">
                    <Icon className="size-6 text-[#0a0a0a]" />
                    <span className="text-xs font-black text-[#333333]" style={LABEL_MONO}>{String(idx+1).padStart(2,"0")}</span>
                  </div>
                  <div className="brutal-subscribe__decor" style={{ backgroundColor: stat.color, borderColor: stat.color }}>{stat.decor}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Account Info Card */}
            <div className="card" style={{ "--primary": "#f8672d", "--secondary": "#38bdf8", "--accent": "#14b8a6" } as React.CSSProperties}>
              <div className="card-pattern-grid" />
              <div className="card-overlay-dots" />
              <div className="bold-pattern">
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                  <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
                  <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="72" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="40" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="60" y="55" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" rx="3" />
                </svg>
              </div>
              <div className="card-title-area">
                <span>Account Info</span>
                <div className="card-tag">info</div>
              </div>
              <div className="card-body">
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon"><Copy className="size-3.5" /></div>
                    <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(()=>setCopied(false),2000); }} className="feature-text hover:underline text-left">
                      {copied ? "Copied!" : displayAddr}
                    </button>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon" style={{ background: "#14b8a6" }}><span className="size-1.5 rounded-full bg-white" style={{ display:"inline-block" }} /></div>
                    <span className="feature-text">Stellar Testnet</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><Award className="size-3.5" /></div>
                    <span className="feature-text">June 2026</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><Trophy className="size-3.5" /></div>
                    <span className="feature-text">248 pts · Silver</span>
                  </div>
                </div>
                <div className="card-actions">
                  <div className="price">248<span className="price-currency">pts</span><span className="price-period">REPUTATION</span></div>
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
                <div className="stamp-inner"><span className="stamp-text">STELLAR</span></div>
              </div>
              <div className="corner-slice" />
            </div>

            {/* Activity Card */}
            <div className="card" style={{ "--primary": "#8b5cf6", "--secondary": "#f59e0b", "--accent": "#ec4899" } as React.CSSProperties}>
              <div className="card-pattern-grid" />
              <div className="card-overlay-dots" />
              <div className="bold-pattern">
                <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                  <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
                  <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="72" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="40" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="60" y="55" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" rx="3" />
                </svg>
              </div>
              <div className="card-title-area">
                <span>Recent Activity</span>
                <div className="card-tag">activity</div>
              </div>
              <div className="card-body" style={{ padding: "0.8em 1em" }}>
                <div className="space-y-2" style={{ marginBottom: "0.8em" }}>
                  {ACTIVITY.map((item, i) => {
                    const Icon = item.type==="win"?Trophy:item.type==="create"?Users:Award;
                    const bg = item.type==="win"?"#fef9c3":"#ccfbf1";
                    return (
                      <div key={i} className="flex items-center gap-3 border-[2px] border-[#0a0a0a] bg-[#fbf7ed] p-2.5 rounded-sm">
                        <div className="grid size-8 shrink-0 place-items-center border-[2px] border-[#0a0a0a]" style={{background:bg}}><Icon className="size-3.5 text-[#0a0a0a]" /></div>
                        <div className="min-w-0"><p className="text-xs font-bold truncate">{item.label} <span className="text-[#333]">{item.pool}</span></p><p className="text-[11px] font-semibold text-[#555]">{item.time}</p></div>
                      </div>
                    );
                  })}
                </div>
                <div className="card-actions">
                  <div className="price">4<span className="price-currency">txs</span><span className="price-period">3 MONTHS</span></div>
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
                <div className="stamp-inner"><span className="stamp-text">ACTIVE</span></div>
              </div>
              <div className="corner-slice" />
            </div>
          </div>
          <div className="mt-8 mb-4 flex items-center gap-3">
            <div className="w-10 h-3" style={{background:"repeating-linear-gradient(to right, #0a0a0a 0, #0a0a0a 2px, transparent 2px, transparent 4px)"}} />
            <span className="border-[3px] border-[#0a0a0a] bg-[#a78bfa] px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] text-white" style={LABEL_MONO}>BADGES</span>
            <div className="flex-1 h-[3px] bg-[#0a0a0a]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {BADGES.map((b) => (
              <div key={b.label} className="brutal-subscribe__container group" style={{ maxWidth: "none" }}>
                <div className="brutal-subscribe__header" style={{ backgroundColor: b.color }}>
                  <span className="brutal-subscribe__title text-2xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", textShadow: "3px 3px 0 rgba(0,0,0,0.2)", color: "#0a0a0a" }}>{b.label}</span>
                  <span className="brutal-subscribe__subtitle text-xs font-semibold" style={{ color: "#333" }}>{b.desc}</span>
                </div>
                <div className="brutal-subscribe__form flex items-center justify-center">
                  <span className="text-4xl">{b.icon}</span>
                </div>
                <div className="brutal-subscribe__decor" style={{ backgroundColor: b.color, borderColor: b.color, color: "#0a0a0a" }}>{b.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
