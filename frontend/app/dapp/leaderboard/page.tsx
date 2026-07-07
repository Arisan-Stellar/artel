"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, Circle, Calendar, Sparkles, Gift, Info, ChevronDown, Wallet } from "lucide-react";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";

type Tier = "diamond" | "platinum" | "gold" | "silver" | "bronze";

const TIER_CONFIG: Record<Tier, { minPoints: number; icon: typeof Star; color: string; multiplier: number; label: string }> = {
  diamond: { label: "Diamond", minPoints: 400, icon: Star, color: "#e0f4ff", multiplier: 2.0 },
  platinum: { label: "Platinum", minPoints: 300, icon: Trophy, color: "#ede9fe", multiplier: 1.6 },
  gold: { label: "Gold", minPoints: 200, icon: Medal, color: "#fef9c3", multiplier: 1.3 },
  silver: { label: "Silver", minPoints: 100, icon: Medal, color: "#ffffff", multiplier: 1.1 },
  bronze: { label: "Bronze", minPoints: 0, icon: Circle, color: "#f5e0c0", multiplier: 1.0 },
};

const POINTS_RULES = [
  { range: "Pay Day 1–10 (Early Bird)", points: "+3 pts, 3 tickets", color: "#ccfbf1" },
  { range: "Pay Day 10–20 (On Time)", points: "+1 pt, 1 ticket", color: "#e0f4ff" },
  { range: "Pay After Day 20 (Late)", points: "-2 pts, 0 tickets", color: "#fee2e2" },
  { range: "Miss Payment (Slashed)", points: "-2 pts, lose collateral", color: "#f5e0c0" },
];

const GACHA_RULES = [
  { label: "Ticket Formula", desc: "tickets = (early_payments × 3) + (mid_payments × 1). Late = 0." },
  { label: "Streak Bonus", desc: "5 consecutive early payments → 1.5× tickets. 10+ consecutive → 2.0×." },
  { label: "Grand Jackpot", desc: "50% of pool yield. Winner selected via weighted random draw." },
  { label: "Runner-Up", desc: "30% split between 2 winners. Each gets 15%." },
  { label: "Consolation", desc: "20% split equally among remaining participants." },
];

interface LbRow { rank: number; addr: string; fullAddr: string; points: number; tickets: number; onTimeRate: number; totalYield: number; activePools: number; tier: Tier }

function tierFromPoints(points: number): Tier {
  if (points >= 400) return "diamond";
  if (points >= 300) return "platinum";
  if (points >= 200) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

export default function LeaderboardPage() {
  const { address } = useWallet();
  const [showRules, setShowRules] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const tiers = (Object.keys(TIER_CONFIG) as Tier[]).map((k) => ({ key: k, ...TIER_CONFIG[k] })).sort((a, b) => b.minPoints - a.minPoints);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { count } = await (await fetch("/api/pools")).json();
        const agg: Record<string, { points: number; tickets: number; early: number; mid: number; late: number; yield: number; pools: number }> = {};
        for (let i = 0; i < (count || 0); i++) {
          const lb = await (await fetch(`/api/contract-state?pool_id=${i}&fn=get_leaderboard`)).json();
          const rows: [string, number][] = Array.isArray(lb.get_leaderboard) ? lb.get_leaderboard : [];
          await Promise.all(rows.map(async ([addr, tickets]) => {
            const mi = (await (await fetch(`/api/contract-state?pool_id=${i}&fn=get_member_info&member=${addr}`)).json()).get_member_info;
            if (!agg[addr]) agg[addr] = { points: 0, tickets: 0, early: 0, mid: 0, late: 0, yield: 0, pools: 0 };
            const a = agg[addr];
            a.tickets += Number(tickets || 0);
            a.pools += 1;
            if (mi) {
              a.points += Number(mi.total_points || 0);
              a.early += Number(mi.early_payments || 0);
              a.mid += Number(mi.mid_payments || 0);
              a.late += Number(mi.late_payments || 0);
              a.yield += Number(mi.yield_earned || 0) / 10_000_000;
            }
          }));
        }
        const rows: LbRow[] = Object.entries(agg).map(([addr, a]) => {
          const totalPay = a.early + a.mid + a.late;
          return {
            rank: 0, addr: `${addr.slice(0, 4)}…${addr.slice(-4)}`, fullAddr: addr,
            points: a.points, tickets: a.tickets,
            onTimeRate: totalPay > 0 ? Math.round((a.early + a.mid) / totalPay * 100) : 0,
            totalYield: Math.round(a.yield * 100) / 100, activePools: a.pools,
            tier: tierFromPoints(a.points),
          };
        }).sort((x, y) => y.points - x.points).map((r, i) => ({ ...r, rank: i + 1 }));
        setLeaderboard(rows);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const silverPlus = leaderboard.filter(p => p.points >= 100).length;
  const userRank = address ? leaderboard.find(p => p.fullAddr === address) ?? null : null;

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-24 md:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <AnimatedBadge icon={<Trophy className="size-4" />} text=">LEADERBOARD" />
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
              Earn Points.<br />
              <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>Win Bigger.</span>
            </h1>
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
              <p className="text-lg font-semibold leading-7 text-[#333333]">
                Pay on time, earn points, climb tiers. Higher tier = bigger gacha multiplier. Diamond members get 2.0× tickets on the annual jackpot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            {/* Cycle Card */}
            <div className="card" style={{ "--primary": "#f59e0b", "--secondary": "#fcd34d", "--accent": "#14b8a6" } as React.CSSProperties}>
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
                <span>Monthly Cycle</span>
                <div className="card-tag">cycle</div>
              </div>
              <div className="card-body">
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon"><Calendar className="size-3.5" /></div>
                    <span className="feature-text">Deadline: Day 20</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><Sparkles className="size-3.5" /></div>
                    <span className="feature-text">Draw: Day 25</span>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon"><Gift className="size-3.5" /></div>
                    <span className="feature-text">Pot: 300 XLM</span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#333] mt-2">Pay early (Day 1-10) for +3 pts & 3 tickets. Pay late = -2 pts & slash.</p>
                <div className="card-actions">
                  <div className="price">300<span className="price-currency">XLM</span><span className="price-period">CURRENT POT</span></div>
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
                <div className="stamp-inner"><span className="stamp-text">CYCLE</span></div>
              </div>
              <div className="corner-slice" />
            </div>

            {/* Tiers Card */}
            <div className="card" style={{ "--primary": "#8b5cf6", "--secondary": "#c4b5fd", "--accent": "#ec4899" } as React.CSSProperties}>
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
                <span>Tiers & Multipliers</span>
                <div className="card-tag">tiers</div>
              </div>
              <div className="card-body" style={{ padding: "0.8em 1em" }}>
                <div className="grid gap-1.5 sm:grid-cols-5" style={{ marginBottom: "0.8em" }}>
                  {tiers.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <div key={tier.key} className="border-[2px] border-[#0a0a0a] p-2 text-center rounded-sm" style={{ background: tier.color }}>
                        <Icon className="mx-auto size-5 text-[#0a0a0a]" />
                        <p className="text-sm font-black text-[#0a0a0a] mt-0.5" style={HEADING_FONT}>{tier.label}</p>
                        <p className="text-xs font-bold text-[#0a0a0a]">{tier.minPoints}+ pts</p>
                        <p className="text-xs font-bold text-[#0a0a0a]">{tier.multiplier}x tickets</p>
                      </div>
                    );
                  })}
                </div>
                <div className="card-actions">
                  <div className="price">5<span className="price-currency">tiers</span><span className="price-period">DIAMOND TO BRONZE</span></div>
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
                <div className="stamp-inner"><span className="stamp-text">ELITE</span></div>
              </div>
              <div className="corner-slice" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { label: "TOTAL SAVERS", value: String(leaderboard.length), color: "#5eead4", decor: "👥" },
              { label: "YIELD EARNED", value: "1,245 XLM", color: "#7dd3fc", decor: "💎" },
              { label: "SILVER+ TIER", value: `${leaderboard.length ? Math.round(silverPlus / leaderboard.length * 100) : 0}%`, color: "#fde68a", decor: "🥈" },
            ].map(({ label, value, color, decor }) => (
              <div key={label} className="brutal-subscribe__container group" style={{ maxWidth: "none" }}>
                <div className="brutal-subscribe__header" style={{ backgroundColor: color }}>
                  <span className="brutal-subscribe__title text-3xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", textShadow: "3px 3px 0 rgba(0,0,0,0.2)", color: "#0a0a0a" }}>{value}</span>
                  <span className="brutal-subscribe__subtitle text-xs font-black tracking-[0.15em] text-[#333]" style={LABEL_MONO}>{label}</span>
                </div>
                <div className="brutal-subscribe__form flex items-center justify-center" />
                <div className="brutal-subscribe__decor" style={{ backgroundColor: color, borderColor: color, color: "#0a0a0a" }}>{decor}</div>
              </div>
            ))}
          </div>

          {address && userRank && (
            <div className="mt-8 border-[3px] border-[#0a0a0a] bg-[#fdfdfa] p-6 shadow-[12px_12px_0_#0a0a0a]">
              <div className="mb-4 flex items-center gap-2"><Wallet className="size-5 text-[#0a0a0a]" /><h2 className="text-sm font-black uppercase tracking-[0.18em]" style={LABEL_MONO}>Your Rank</h2></div>
              <div className="grid gap-4 sm:grid-cols-5">
                {[
                  { label: "RANK", value: `#${userRank.rank}` },
                  { label: "TIER", value: TIER_CONFIG[userRank.tier].label, icon: TIER_CONFIG[userRank.tier].icon, bg: TIER_CONFIG[userRank.tier].color },
                  { label: "POINTS", value: String(userRank.points) },
                  { label: "ON-TIME", value: `${userRank.onTimeRate}%` },
                  { label: "TICKETS", value: String(userRank.tickets) },
                ].map(({ label, value, icon: Icon, bg }) => (
                  <div key={label} className="flex items-center gap-3 border-[3px] border-[#0a0a0a] p-3" style={bg ? { background: bg } : {}}>
                    {Icon && <Icon className="size-5 text-[#0a0a0a]" />}
                    <div><span className="text-xs font-black uppercase tracking-[0.15em] text-[#333333]" style={LABEL_MONO}>{label}</span>
                    <span className="block text-xl font-black" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>{value}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 border-[3px] border-[#0a0a0a] shadow-[8px_8px_0_#000] overflow-hidden bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f59e0b] text-white">
                  {["#", "ADDRESS", "TIER", "POINTS", "ON-TIME", "YIELD", "POOLS"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-sm font-semibold text-[#333]">{loading ? "Loading leaderboard…" : "No savers yet — join a pool and contribute to rank up."}</td></tr>
                )}
                {leaderboard.map((p) => {
                  const TierIcon = TIER_CONFIG[p.tier].icon;
                  return (
                    <tr key={p.rank} className="border-b-2 border-[#f59e0b] bg-white hover:bg-[#fef3c7] transition-all cursor-pointer">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-[#f59e0b] text-white text-xs font-bold">{p.rank}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm text-[#0a0a0a]">{p.addr}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 border-2 border-[#f59e0b] px-2 py-0.5 text-xs font-bold" style={{ background: TIER_CONFIG[p.tier].color }}>
                          <TierIcon className="size-3 text-[#0a0a0a]" />
                          {TIER_CONFIG[p.tier].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm text-[#0a0a0a]">{p.points}</td>
                      <td className="px-4 py-3">
                        <span className={`border-2 border-[#f59e0b] px-2 py-0.5 text-xs font-bold ${p.onTimeRate >= 90 ? "bg-[#5eead4]" : p.onTimeRate >= 70 ? "bg-[#fde68a]" : "bg-[#fbcfe8]"}`}>{p.onTimeRate}%</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm text-[#14b8a6]">{p.totalYield} XLM</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#0a0a0a]">{p.activePools}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="bg-[#f59e0b] text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 text-right">
              Updated: June 2026 — Stellar Testnet
            </div>
          </div>

          <div className="mt-8">
            <button onClick={() => setShowRules(!showRules)}
              className="inline-flex w-full items-center justify-between border-[3px] border-[#0a0a0a] bg-[#fdfdfa] px-6 py-4 text-xs font-black uppercase tracking-[0.18em] shadow-[12px_12px_0_#0a0a0a] transition hover:bg-[#f8672d]" style={LABEL_MONO}>
              <span className="flex items-center gap-2"><Info className="size-4" />How Points & Gacha Tickets Work</span>
              <ChevronDown className={`size-4 transition ${showRules ? "rotate-180" : ""}`} />
            </button>
            {showRules && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {/* Point System Card */}
                <div className="card" style={{ "--primary": "#14b8a6", "--secondary": "#5eead4", "--accent": "#f59e0b" } as React.CSSProperties}>
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
                    <span>Point System</span>
                    <div className="card-tag">scoring</div>
                  </div>
                  <div className="card-body" style={{ padding: "0.8em 1em" }}>
                    <div className="space-y-1.5" style={{ marginBottom: "0.8em" }}>
                      {POINTS_RULES.map(({ range, points, color }) => (
                        <div key={range} className="flex items-center justify-between border-[2px] border-[#0a0a0a] px-3 py-1.5 rounded-sm" style={{ background: color }}>
                          <span className="text-xs font-bold text-[#0a0a0a]">{range}</span>
                          <span className="text-xs font-black text-[#0a0a0a]" style={LABEL_MONO}>{points}</span>
                        </div>
                      ))}
                    </div>
                    <div className="card-actions">
                      <div className="price">4<span className="price-currency">rules</span><span className="price-period">EARLY TO SLASHED</span></div>
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
                    <div className="stamp-inner"><span className="stamp-text">PTS</span></div>
                  </div>
                  <div className="corner-slice" />
                </div>

                {/* Gacha Rules Card */}
                <div className="card" style={{ "--primary": "#f59e0b", "--secondary": "#fcd34d", "--accent": "#ec4899" } as React.CSSProperties}>
                  <div className="card-pattern-grid" />
                  <div className="card-overlay-dots" />
                  <div className="bold-pattern">
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
                      <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
                      <circle cx="72" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                      <rect x="30" y="55" width="40" height="25" fill="none" stroke="currentColor" strokeWidth="4" rx="3" />
                    </svg>
                  </div>
                  <div className="card-title-area">
                    <span>Gacha Rules</span>
                    <div className="card-tag">jackpot</div>
                  </div>
                  <div className="card-body" style={{ padding: "0.8em 1em" }}>
                    <div className="space-y-1.5" style={{ marginBottom: "0.8em" }}>
                      {GACHA_RULES.map(({ label, desc }) => (
                        <div key={label} className="border-[2px] border-[#0a0a0a] bg-[#fef9c3] px-3 py-1.5 rounded-sm">
                          <span className="text-xs font-black text-[#0a0a0a]" style={LABEL_MONO}>{label}</span>
                          <p className="text-[11px] font-semibold text-[#333] mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="card-actions">
                      <div className="price">50<span className="price-currency">%</span><span className="price-period">GRAND JACKPOT</span></div>
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
                    <div className="stamp-inner"><span className="stamp-text">GACHA</span></div>
                  </div>
                  <div className="corner-slice" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
