"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Shield, Trophy, Gift, Users, Clock, DollarSign, Layers, BarChart3, Share2, Check, Zap } from "lucide-react";
import { CARD_CLASS, BTN_PRIMARY, BTN_ORANGE, BTN_SUCCESS, LABEL_MONO, HEADING_FONT, BarcodeStrip } from "@/components/dapp/ArtelHeader";
import { getRequiredCollateralAmount, DEFAULT_COLLATERAL_MULTIPLIER } from "@/lib/poolMath";
import { useFreighterTx, scvAddress } from "@/hooks/useFreighterTx";

interface Participant { addr: string; collateral: number; paid: boolean; streak: number; tickets: number; won: boolean }
type LifecycleState = "open" | "ready" | "active" | "completed";

const MOCK: Record<string, any> = {
  "CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5": {
    id: "CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5", name: "Arisan E2E Test", state: "active",
    deposit: 100, max: 3, members: 3, cycle: 2, totalCycles: 3, cycleDays: 30, apy: 3.2, deadline: "4d 12h",
    yieldCumulative: 0.8, yieldCollateral: 2.5, yieldVault: 45,
    participants: [
      { addr: "G...B0B", collateral: 250, paid: true, streak: 2, tickets: 6, won: true },
      { addr: "G...CAR", collateral: 250, paid: true, streak: 1, tickets: 3, won: false },
      { addr: "G...DAV", collateral: 250, paid: false, streak: 0, tickets: 0, won: false },
    ], cycleWinners: [{ cycle: 1, addr: "G...B0B" }],
  },
};

function GrainOverlay() { return <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: "radial-gradient(#0a0a0a 1px, transparent 1px)", backgroundSize: "4px 4px", opacity: 0.05 }} />; }
function StatBox({ label, value, sub, bg = "bg-[#ccfbf1]", Icon }: { label: string; value: string; sub?: string; bg?: string; Icon?: React.ComponentType<{ className?: string }> }) {
  return <div className={`border-[3px] border-[#0a0a0a] ${bg} p-4 shadow-[3px_3px_0_#0a0a0a]`}><div className="flex items-center justify-between mb-2"><BarcodeStrip className="w-6 h-2" />{Icon && <Icon className="size-4 text-[#0a0a0a]" />}</div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#333333]" style={LABEL_MONO}>{label}</p><p className="mt-2 text-2xl font-black leading-none" style={HEADING_FONT}>{value}</p>{sub && <p className="mt-0.5 text-xs font-semibold text-[#333333]">{sub}</p>}</div>;
}

export default function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pool = MOCK[id as string] || Object.values(MOCK)[0];
  const coll = getRequiredCollateralAmount(pool.deposit, pool.max, DEFAULT_COLLATERAL_MULTIPLIER);
  const progressPct = pool.totalCycles > 0 ? Math.round((pool.cycle / pool.totalCycles) * 100) : 0;
  const { loading, error, txHash, invokeContract } = useFreighterTx();
  const isAdmin = true;
  const isParticipant = true;
  const hasPaid = false;

  const handleJoin = () => invokeContract(pool.id, "join", [scvAddress("")]);
  const handleDeposit = () => invokeContract(pool.id, "contribute", [scvAddress("")]);
  const handleSelect = () => invokeContract(pool.id, "select_winner", []);
  const handleStart = () => invokeContract(pool.id, "start_pool", []);

  const statusLabel = pool.state === "active" ? "ACTIVE" : pool.state === "open" ? "OPEN" : "COMPLETED";
  const statusColor = pool.state === "active" ? "bg-[#e0f4ff] text-[#0284c7]" : pool.state === "open" ? "bg-[#ccfbf1] text-[#0d9488]" : "bg-[#e8e1d9] text-[#a8a49a]";

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-2 md:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <Link href="/dapp/pools" className="inline-flex items-center gap-2 border-[3px] border-[#0a0a0a] bg-[var(--color-sui)] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] transition hover:-translate-y-0.5"><ArrowLeft className="size-4" /> Back to Pools</Link>
          <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl" style={HEADING_FONT}>{pool.name}</h1>
                <span className={`inline-flex items-center border-[3px] border-[#0a0a0a] px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em] ${statusColor}`} style={LABEL_MONO}>{statusLabel}</span>
              </div>
              <div className="inline-flex max-w-full items-center gap-1.5 overflow-hidden border-[3px] border-[#0a0a0a] bg-[#fdfdfa] px-4 py-2 text-xs font-black text-[#333333] shadow-[5px_5px_0_#0a0a0a]"><span className="max-w-[200px] truncate md:max-w-none" style={LABEL_MONO}>{pool.id}</span><Sparkles className="size-3.5 text-[#0a0a0a]" /></div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-1.5 border-[2px] border-[#0a0a0a] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] shadow-[2px_2px_0_#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition" style={LABEL_MONO}><Share2 className="size-3" /> Share</button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          {txHash && <div className="mb-4 border-[3px] border-[#0a0a0a] bg-[var(--color-teal)] px-4 py-2 text-xs font-bold text-white">✅ {txHash.slice(0, 10)}...{txHash.slice(-4)}</div>}
          {error && <div className="mb-4 border-[3px] border-[#0a0a0a] bg-[var(--color-crack)] px-4 py-2 text-xs font-bold text-white">❌ {error}</div>}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>stats</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Pool Stats</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatBox label="DEPOSIT" value={`${pool.deposit} XLM`} bg="bg-[#e0f4ff]" />
                  <StatBox label="MEMBERS" value={`${pool.members}/${pool.max}`} bg="bg-[#ccfbf1]" Icon={Users} />
                  <StatBox label="CYCLE" value={`${pool.cycle}/${pool.totalCycles}`} bg="bg-[#fef9c3]" Icon={Clock} />
                  <StatBox label="FUNDS" value={`${pool.deposit * pool.members} XLM`} bg="bg-[#e0f4ff]" Icon={DollarSign} />
                </div>
                {pool.state === "active" && <div className="mt-6"><div className="flex items-center justify-between mb-2"><span className="text-xs font-black uppercase tracking-[0.15em] text-[#333333]" style={LABEL_MONO}>Progress</span><span className="text-sm font-black" style={HEADING_FONT}>{progressPct}%</span></div><div className="h-4 w-full overflow-hidden border-[3px] border-[#0a0a0a] bg-[#e8e1d9]"><div className="h-full bg-[var(--color-sui)]" style={{ width: `${progressPct}%` }} /></div></div>}
              </div></div>

              <div className="flex flex-wrap gap-3">
                {pool.state === "open" && <button onClick={handleJoin} disabled={loading} className={BTN_ORANGE + " px-8 disabled:opacity-50"}>{loading ? "..." : `Join · ${coll} XLM`}</button>}
                {pool.state === "active" && !hasPaid && <button onClick={handleDeposit} disabled={loading} className={BTN_PRIMARY + " px-8 disabled:opacity-50"}>{loading ? "..." : `Deposit ${pool.deposit} XLM`}</button>}
                {pool.state === "ready" && isAdmin && <button onClick={handleStart} disabled={loading} className={BTN_SUCCESS + " px-6 disabled:opacity-50"}>{loading ? "..." : "Start Pool"}</button>}
                {pool.state === "active" && isAdmin && <button onClick={handleSelect} disabled={loading} className={BTN_ORANGE + " px-6 disabled:opacity-50"}>{loading ? "..." : "Select Winner"}</button>}
              </div>

              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>yield</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Yield</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatBox label="Pool Gacha" value={`${pool.yieldCumulative} XLM`} bg="bg-[#ede9fe]" sub="Cumulative" Icon={Gift} />
                  <StatBox label="Collateral" value={`${pool.yieldCollateral} XLM`} bg="bg-[#e0f4ff]" sub="Monthly split" />
                  <StatBox label="Est. APY" value={`${pool.apy}%`} bg="bg-[#ccfbf1]" />
                  <StatBox label="Collat/Member" value={`${coll} XLM`} bg="bg-[#fef9c3]" sub={`${DEFAULT_COLLATERAL_MULTIPLIER}%`} />
                </div>
              </div></div>

              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>members</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Participants ({pool.members})</h2>
                <div className="space-y-2">
                  {pool.participants.map((p: Participant, i: number) => (
                    <div key={i} className={`flex items-center justify-between border-[3px] p-3 ${p.paid ? "border-[#0a0a0a] bg-[#ccfbf1]" : "border-[#0a0a0a] bg-[#f5f7fa]"}`}>
                      <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center border-[3px] border-[#0a0a0a] bg-[var(--color-sui)] text-[#0a0a0a] font-black text-sm" style={HEADING_FONT}>{i + 1}</div><div><p className="text-sm font-bold" style={LABEL_MONO}>{p.addr}</p><div className="flex items-center gap-2 mt-0.5">{p.paid && <span className="text-xs font-black text-[var(--color-teal)]" style={LABEL_MONO}><Check className="inline size-3" /> Paid</span>}{p.won && <span className="text-xs font-black text-[#f8672d]" style={LABEL_MONO}><Trophy className="inline size-3" /> Winner</span>}</div></div></div>
                      <div className="text-right text-xs"><span className="font-bold">{p.tickets}</span> <span className="text-[#333333]">tickets</span></div>
                    </div>
                  ))}
                </div>
              </div></div>

              {pool.cycleWinners?.length > 0 && <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>winners</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Cycle Winners</h2>
                <div className="space-y-2">{pool.cycleWinners.map((w: any) => <div key={w.cycle} className="flex items-center justify-between border-[3px] border-[#0a0a0a] bg-[#fef9c3] p-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center border-[3px] border-[#0a0a0a] bg-[#f8672d] text-[#0a0a0a] font-black text-sm" style={HEADING_FONT}>{w.cycle}</div><div><p className="text-sm font-bold" style={LABEL_MONO}>Cycle {w.cycle}</p><p className="text-xs font-semibold text-[#333333]">{w.addr}</p></div></div><Trophy className="size-4 text-[#f8672d]" /></div>)}</div>
              </div></div>}
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-1 space-y-8">
              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>status</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Your Status</h2>
                {isParticipant ? <div className="space-y-4">
                  <div className="border-[3px] border-[#0a0a0a] bg-[#ccfbf1] p-4"><div className="flex items-center gap-2 mb-2"><Check className="w-5 h-5 text-[var(--color-teal)]" /><span className="font-black">Active Participant</span></div><p className="text-sm font-semibold text-[#333333]">You are in this pool</p></div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-xs font-black uppercase tracking-[0.1em] text-[#333333]" style={LABEL_MONO}>Collateral</span><span className="font-black">{coll} XLM</span></div>
                    <div className="flex justify-between"><span className="text-xs font-black uppercase tracking-[0.1em] text-[#333333]" style={LABEL_MONO}>Paid?</span><span className={`font-black ${hasPaid ? "text-[var(--color-teal)]" : "text-[var(--color-crack)]"}`}>{hasPaid ? "YES" : "NO"}</span></div>
                    <div className="flex justify-between"><span className="text-xs font-black uppercase tracking-[0.1em] text-[#333333]" style={LABEL_MONO}>Tickets</span><span className="font-black">6</span></div>
                  </div>
                </div> : <div className="text-center py-4"><Users className="size-8 mx-auto text-[#a8a49a] mb-2" /><p className="text-sm font-semibold text-[#333333]">Not a participant yet.</p></div>}
              </div></div>

              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>actions</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Quick Actions</h2>
                <div className="space-y-2 text-sm font-semibold">
                  <div className="flex justify-between"><span>Deposit</span><span className="font-black">{pool.deposit} XLM</span></div>
                  <div className="flex justify-between"><span>Collateral</span><span className="font-black">{coll} XLM</span></div>
                  <div className="flex justify-between"><span>Cycle</span><span className="font-black">{pool.cycleDays}d</span></div>
                  <div className="flex justify-between"><span>APY</span><span className="font-black">{pool.apy}%</span></div>
                </div>
              </div></div>

              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>admin</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Contract</h2>
                <p className="font-mono text-[10px] text-[#333333] break-all">{pool.id}</p>
              </div></div>

              <div className="border-[3px] border-[#0a0a0a] bg-[var(--color-artel)] bg-opacity-10 p-5 shadow-[5px_5px_0_#0a0a0a]">
                <div className="flex items-center gap-2 mb-2"><Zap className="size-4 text-[var(--color-artel)]" /><span className="text-xs font-black uppercase tracking-[0.15em]" style={LABEL_MONO}>Triple Yield</span></div>
                <p className="text-xs font-semibold text-[#333333]">40% vault → annual gacha June 30.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
