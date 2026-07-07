"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Users, DollarSign, Shield, Sparkles, Droplets } from "lucide-react";
import { LABEL_MONO, HEADING_FONT, BarcodeStrip } from "@/components/dapp/ArtelHeader";
import { getRequiredCollateralFromConfig } from "@/lib/poolMath";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";
import { useWallet } from "@/hooks/WalletContext";
import WalletCard from "@/components/dapp/WalletCard";

interface PoolEntry { id: string; name: string; deposit: number; max: number; members: number; status: "open" | "active" | "completed"; cycle: number; totalCycles: number; cycleDays: number; apy: number; totalFunds: number; yieldAccrued: number; collateralBps: number; }


const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  open: { bg: "#f59e0b", label: "OPEN" },
  active: { bg: "#f59e0b", label: "LIVE" },
  completed: { bg: "#f59e0b", label: "DONE" },
};

const STATUS_HEADER: Record<string, string> = {
  open: "#fda4af",
  active: "#c084fc",
  completed: "#2dd4bf",
};

type PoolStatus = "open" | "active" | "completed";

export default function PoolsPage() {
  const { address, connecting } = useWallet();
  const [pools, setPools] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | PoolStatus>("all");

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const countRes = await fetch("/api/pools");
        const countData = await countRes.json();
        const count = countData.count || 0;

        if (count > 0) {
          const entries = await Promise.all(
            Array.from({ length: count }, (_, i) => i).map(async (poolId: number) => {
              try {
                const res = await fetch(`/api/contract-state?pool_id=${poolId}`);
                const data = await res.json();
                if (data.success) return parsePoolState(String(poolId), data.state, data.config);
              } catch {}
              return null;
            })
          );
          const valid = entries.filter((e): e is PoolEntry => e !== null);
          setPools(valid);
          setLoading(false);
          return;
        }
      } catch {}
      setPools([]);
      setLoading(false);
    };
    fetchPools();
  }, []);

  function parsePoolState(id: string, state: any, config: any): PoolEntry {
    const c = config || {};
    const stateTag = Array.isArray(state.state) ? state.state[0] : state.state;
    return {
      id,
      name: c.name || `Pool ${id.slice(0, 6)}...${id.slice(-4)}`,
      deposit: Number(c.contribution_amount || 0) / 10_000_000,
      max: Number(c.max_members || state.total_rounds || 0),
      members: Number(state.member_count || 0),
      status: (stateTag === "Active" ? "active" : stateTag === "Completed" ? "completed" : "open") as PoolStatus,
      cycle: Number(state.current_round || 0),
      totalCycles: Number(state.total_rounds || 0),
      cycleDays: 30,
      apy: 0,
      totalFunds: Number(state.pool_funds_balance || 0) / 10_000_000,
      yieldAccrued: Number(state.yield_balance || 0) / 10_000_000,
      collateralBps: Number(c.collateral_ratio_bps || 12500),
    };
  }

  const filtered = filter === "all" ? pools : pools.filter((p) => p.status === filter);

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-20 md:px-10 lg:px-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <AnimatedBadge icon={<Layers className="size-4" />} text=">POOLS" />
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
              Explore &amp; Join<br />
              <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>ROSCA Pools</span>
            </h1>
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
              <p className="text-lg font-semibold leading-7 text-[#333333]">
                Discover community savings circles on Stellar. Stake collateral, contribute monthly, earn triple yield. Every rule enforced by smart contracts. Zero trust required.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "TOTAL POOLS", value: loading ? "..." : pools.length, color: "#f59e0b", sub: "live" },
              { label: "OPEN", value: loading ? "..." : pools.filter((p) => p.status === "open").length, color: "#fda4af", sub: "ready" },
              { label: "RUNNING", value: loading ? "..." : pools.filter((p) => p.status === "active").length, color: "#c084fc", sub: "active" },
              { label: "COMPLETED", value: loading ? "..." : pools.filter((p) => p.status === "completed").length, color: "#2dd4bf", sub: "done" },
            ].map(({ label, value, color }) => (
              <div key={label} className="brutal-subscribe__container group">
                <div className="brutal-subscribe__header" style={{ backgroundColor: color }}>
                  <span className="brutal-subscribe__title" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: "28px", textShadow: "2px 2px 0 rgba(0,0,0,0.3)" }}>{value}</span>
                  <span className="brutal-subscribe__subtitle">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Wallet Card */}
          <WalletCard />

          {/* Faucet + Create Row */}
          <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a href="/dapp/faucet" className="game-btn">
              <span className="game-btn-inner">
                <span className="game-btn-slide" />
                <span className="game-btn-text flex items-center gap-1.5">
                  <Droplets className="size-3.5" /> Claim 10,000 XLM
                </span>
              </span>
            </a>
            {address ? (
              <Link href="/dapp/create" className="game-btn">
                <span className="game-btn-inner">
                  <span className="game-btn-slide" />
                  <span className="game-btn-text">+ Create Pool</span>
                </span>
              </Link>
            ) : (
              <div className="border-[3px] border-[#0a0a0a] bg-[var(--color-artel)] bg-opacity-10 px-4 py-2 text-xs font-bold text-[#333333]">
                Connect wallet to create a pool
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 tabs" role="radiogroup">
            <input type="radio" id="f-all" name="filter" className="input sr-only" checked={filter === "all"} onChange={() => setFilter("all")} />
            <label htmlFor="f-all" className="label">ALL</label>
            <input type="radio" id="f-open" name="filter" className="input sr-only" checked={filter === "open"} onChange={() => setFilter("open")} />
            <label htmlFor="f-open" className="label">OPEN</label>
            <input type="radio" id="f-active" name="filter" className="input sr-only" checked={filter === "active"} onChange={() => setFilter("active")} />
            <label htmlFor="f-active" className="label">ACTIVE</label>
            <input type="radio" id="f-completed" name="filter" className="input sr-only" checked={filter === "completed"} onChange={() => setFilter("completed")} />
            <label htmlFor="f-completed" className="label">COMPLETED</label>
          </div>

          {/* Not connected prompt */}
          {!address && filtered.length > 0 && (
            <div className="mb-6 border-[3px] border-[#0a0a0a] bg-[var(--color-artel)] bg-opacity-10 p-4 text-center shadow-[4px_4px_0_#0a0a0a]">
              <p className="text-sm font-black" style={HEADING_FONT}>Connect your wallet to join pools</p>
              <p className="text-xs text-[#333333] mt-1">Click CONNECT in the top-right to start earning triple yield.</p>
            </div>
          )}

          {/* Pool Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pool, idx) => {
              const init = (pool.name || "?")[0].toUpperCase();
              const status = STATUS_BADGE[pool.status];
              const headerColor = STATUS_HEADER[pool.status] || "#fda4af";
              const memberRatio = pool.members / pool.max;
              const coll = getRequiredCollateralFromConfig({ contribution_amount: pool.deposit * 10_000_000, max_members: pool.max, collateral_ratio_bps: pool.collateralBps });

              return (
                <div key={pool.id} className="group">
                  <div className="w-full relative overflow-hidden transition-transform duration-150" style={{ background: "#f5f5f0", border: "5px solid #0a0a0a", boxShadow: "8px 8px 0 #0a0a0a" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-2px, -2px)"; e.currentTarget.style.boxShadow = "10px 10px 0 #0a0a0a"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "8px 8px 0 #0a0a0a"; }}>
                    <div className="relative h-[140px] border-b-[5px] border-[#0a0a0a] flex items-end overflow-hidden" style={{ background: headerColor }}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(45deg, transparent 0px, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 10px)" }} />
                      <span className="absolute right-[-8px] bottom-[-10px] text-[6rem] leading-[0.85] tracking-[-0.02em] pointer-events-none select-none" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "rgba(0,0,0,0.08)" }}>{Math.floor(pool.apy * 10)}</span>
                      <div className="relative z-10 ml-[18px] mb-[-1px] w-16 h-16 bg-[#0a0a0a] border-[5px] border-[#0a0a0a] border-b-0 border-l-0 flex items-center justify-center text-2xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: headerColor }}>{init}</div>
                      <div className="absolute top-3 right-3 z-10" style={{ background: status.bg, border: "3px solid #0a0a0a", boxShadow: "3px 3px 0 #0a0a0a", padding: "4px 10px", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0a0a0a" }}>{status.label}</div>
                    </div>
                    <div className="p-4">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#333333] mb-0.5" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>{pool.id.slice(0, 6)}...{pool.id.slice(-4)}</p>
                      <h3 className="text-3xl leading-[0.85] tracking-[-0.01em] text-[#0a0a0a] mb-2" style={HEADING_FONT}>{pool.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#0a0a0a] mb-2">
                        <span className="flex items-center gap-1"><DollarSign className="size-3" />{pool.deposit} XLM</span>
                        {coll > 0 && <span className="flex items-center gap-1"><Shield className="size-3" />{coll} XLM collateral</span>}
                      </div>
                      <div className="text-[0.75rem] font-medium text-[#0a0a0a] border-l-[4px] border-[var(--color-crack)] pl-2 leading-relaxed">
                        {pool.deposit} XLM deposit · {pool.cycleDays}d cycles · {pool.apy}% APY
                        {pool.yieldAccrued > 0 && <span className="ml-2 inline-flex items-center gap-1 text-[var(--color-teal)] font-bold"><Sparkles className="size-2.5" />+{pool.yieldAccrued} XLM</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 border-t-[3px] border-[#0a0a0a]">
                      {[
                        { value: pool.deposit, label: "Deposit", sub: "XLM" },
                        { value: `${pool.members}/${pool.max}`, label: "Members", sub: `${Math.round(memberRatio * 100)}%` },
                        { value: `${pool.cycleDays}d`, label: "Cycle", sub: `${pool.totalFunds} XLM` },
                      ].map((stat, si) => (
                        <div key={stat.label} className="p-2.5 text-center" style={{ borderRight: si < 2 ? "3px solid #0a0a0a" : "none" }}>
                          <span className="block text-xl leading-none text-[#0a0a0a]" style={HEADING_FONT}>{stat.value}</span>
                          <span className="block text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[#333333] mt-0.5" style={LABEL_MONO}>{stat.label}</span>
                          <span className="block text-[0.5rem] text-[#333333]">{stat.sub}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 border-t-[3px] border-[#0a0a0a]">
                      {address ? (
                        <Link href={`/dapp/pools/${pool.id}`}
                          className="flex items-center justify-center py-2.5 text-xs font-black uppercase tracking-[0.08em] text-[#0a0a0a] hover:bg-[#e8e1d9] transition border-r-[3px] border-[#0a0a0a]"
                          style={LABEL_MONO}>Join Now</Link>
                      ) : (
                        <div className="py-2.5 text-xs font-black uppercase tracking-[0.08em] text-[#a8a49a] text-center border-r-[3px] border-[#0a0a0a]" style={LABEL_MONO}>Connect to Join</div>
                      )}
                      <Link href={`/dapp/pools/${pool.id}`} className="flex items-center justify-center py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white bg-[#0a0a0a] hover:bg-[#333] transition gap-1" style={LABEL_MONO}>View Details →</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="border-[3px] border-[#0a0a0a] bg-white p-10 text-center shadow-[8px_8px_0_#0a0a0a]">
              <p className="text-lg font-black text-[#333333]" style={HEADING_FONT}>No pools found</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">Try a different filter or create a new pool.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
