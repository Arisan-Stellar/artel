"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Shield, Trophy, Gift, Users, Clock, DollarSign, Layers, BarChart3, Share2, Check, Zap } from "lucide-react";
import { CARD_CLASS, BTN_PRIMARY, BTN_ORANGE, BTN_SUCCESS, LABEL_MONO, HEADING_FONT, BarcodeStrip } from "@/components/dapp/ArtelHeader";
import { getRequiredCollateralFromConfig, getContributionFromConfig, getJoinCostFromConfig, DEFAULT_COLLATERAL_MULTIPLIER } from "@/lib/poolMath";
import { useFreighterTx, scvAddress, scvU32 } from "@/hooks/useFreighterTx";
import { CONTRACT_IDS } from "@/lib/artel-sdk";
import { useWallet } from "@/hooks/WalletContext";

interface Participant { addr: string; collateral: number; paid: boolean; streak: number; tickets: number; won: boolean }
type LifecycleState = "open" | "ready" | "active" | "completed";

const FALLBACK_POOL: any = {
  id: "", name: "Pool Not Found", state: "open",
  deposit: 0, max: 0, members: 0, cycle: 0, totalCycles: 0, cycleDays: 30, apy: 0,
  yieldCumulative: 0, yieldCollateral: 0, yieldVault: 0,
  participants: [], cycleWinners: [],
};

function GrainOverlay() { return <div className="absolute inset-0 pointer-events-none z-10" style={{ backgroundImage: "radial-gradient(#0a0a0a 1px, transparent 1px)", backgroundSize: "4px 4px", opacity: 0.05 }} />; }
function StatBox({ label, value, sub, bg = "bg-[#ccfbf1]", Icon }: { label: string; value: string; sub?: string; bg?: string; Icon?: React.ComponentType<{ className?: string }> }) {
  return <div className={`border-[3px] border-[#0a0a0a] ${bg} p-4 shadow-[3px_3px_0_#0a0a0a]`}><div className="flex items-center justify-between mb-2"><BarcodeStrip className="w-6 h-2" />{Icon && <Icon className="size-4 text-[#0a0a0a]" />}</div><p className="text-xs font-black uppercase tracking-[0.15em] text-[#333333]" style={LABEL_MONO}>{label}</p><p className="mt-2 text-2xl font-black leading-none" style={HEADING_FONT}>{value}</p>{sub && <p className="mt-0.5 text-xs font-semibold text-[#333333]">{sub}</p>}</div>;
}

export default function PoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pool, setPool] = useState<any>(FALLBACK_POOL);
  const [config, setConfig] = useState<any>(null);
  const [adminAddr, setAdminAddr] = useState<string>("");
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const { address } = useWallet();
  const { loading, error, txHash, invokeContract } = useFreighterTx();
  const coll = config ? getRequiredCollateralFromConfig(config) : 0;
  const joinCost = config ? getJoinCostFromConfig(config) : 0;
  const progressPct = pool.totalCycles > 0 ? Math.round((pool.cycle / pool.totalCycles) * 100) : 0;

  const loadPool = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/contract-state?pool_id=${id}`);
      const data = await res.json();
      if (data.success && data.state) {
        const s = data.state;
        const c = data.config || {};
        setConfig(c);
        const stateTag = Array.isArray(s.state) ? s.state[0] : s.state;
        const mapped = stateTag === "Active" ? "active"
          : stateTag === "Completed" ? "completed"
          : s.is_full ? "ready" : "open";

        let participants: any[] = [];
        try {
          const lbRes = await fetch(`/api/contract-state?pool_id=${id}&fn=get_leaderboard`);
          const lbData = await lbRes.json();
          if (lbData.success && Array.isArray(lbData.get_leaderboard)) {
            participants = lbData.get_leaderboard.map(([addr, tickets]: [string, number]) => ({
              addr, tickets: Number(tickets), paid: false, collateral: 0, streak: 0, won: false,
            }));
          }
        } catch {}

        const cur = Number(s.current_round || 0);
        const cycleWinners: any[] = [];
        for (let r = 1; r < cur; r++) {
          try {
            const wRes = await fetch(`/api/contract-state?pool_id=${id}&fn=get_round_winner&round=${r}`);
            const wData = await wRes.json();
            if (wData.success && wData.get_round_winner) {
              cycleWinners.push({ cycle: r, addr: wData.get_round_winner });
            }
          } catch {}
        }

        setPool({
          id,
          name: c.name || `Pool #${id}`,
          state: mapped,
          deposit: Number(c.contribution_amount || 0) / 10_000_000,
          max: Number(c.max_members || s.total_rounds || 0),
          members: Number(s.member_count || 0),
          cycle: cur,
          totalCycles: Number(s.total_rounds || 0),
          cycleDays: 30,
          apy: 0,
          yieldCumulative: Number(s.yield_balance || 0) / 10_000_000,
          yieldCollateral: Number(s.collateral_yield_balance || 0) / 10_000_000,
          yieldVault: 0,
          participants,
          cycleWinners,
        });
      }
    } catch {}
    setFetching(false);
  }, [id]);

  const loadAdmin = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/contract-state?pool_id=${id}&fn=get_admin`);
      const data = await res.json();
      if (data.success && data.get_admin) setAdminAddr(data.get_admin);
    } catch {}
  }, [id]);

  const loadMembership = useCallback(async () => {
    if (!id || !address) { setMemberInfo(null); return; }
    try {
      const res = await fetch(`/api/contract-state?pool_id=${id}&fn=get_member_info&member=${address}`);
      const data = await res.json();
      setMemberInfo(data.success ? data.get_member_info : null);
    } catch { setMemberInfo(null); }
  }, [id, address]);

  useEffect(() => { loadPool(); loadAdmin(); }, [loadPool, loadAdmin]);
  useEffect(() => { loadMembership(); }, [loadMembership]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPool(), loadMembership()]);
  }, [loadPool, loadMembership]);

  const isAdmin = !!address && !!adminAddr && address === adminAddr;
  const isParticipant = !!memberInfo;
  const hasPaid = !!memberInfo?.deposited_this_round;

  const runTx = async (method: string, args: any[]) => {
    const result = await invokeContract(CONTRACT_IDS.pool, method, args);
    if (result?.success) await refreshAll();
    return result;
  };
  const handleJoin = () => runTx("join", [scvU32(Number(id)), scvAddress(address!)]);
  const handleDeposit = () => runTx("contribute", [scvU32(Number(id)), scvAddress(address!)]);
  const handleSelect = () => runTx("select_winner", [scvU32(Number(id))]);
  const handleStart = () => runTx("start_pool", [scvU32(Number(id))]);

  const canJoin = pool.state === "open" && !isParticipant && pool.members < pool.max && !!address;
  const canStart = pool.state === "ready" && isAdmin;
  const canDeposit = pool.state === "active" && isParticipant && !hasPaid;
  const canSelect = pool.state === "active" && isAdmin;

  const statusLabel = pool.state === "active" ? "ACTIVE" : pool.state === "ready" ? "READY" : pool.state === "open" ? "OPEN" : "COMPLETED";
  const statusColor = pool.state === "active" ? "bg-[#e0f4ff] text-[#0284c7]" : pool.state === "completed" ? "bg-[#e8e1d9] text-[#a8a49a]" : "bg-[#ccfbf1] text-[#0d9488]";

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
                {canJoin && <button onClick={handleJoin} disabled={loading} className={BTN_ORANGE + " px-8 disabled:opacity-50"}>{loading ? "..." : `Join · ${joinCost} XLM (${coll} collateral + ${pool.deposit} iuran)`}</button>}
                {canDeposit && <button onClick={handleDeposit} disabled={loading} className={BTN_PRIMARY + " px-8 disabled:opacity-50"}>{loading ? "..." : `Deposit ${pool.deposit} XLM`}</button>}
                {canStart && <button onClick={handleStart} disabled={loading} className={BTN_SUCCESS + " px-6 disabled:opacity-50"}>{loading ? "..." : "Start Pool"}</button>}
                {canSelect && <button onClick={handleSelect} disabled={loading} className={BTN_ORANGE + " px-6 disabled:opacity-50"}>{loading ? "..." : "Select Winner"}</button>}
              </div>

              <div className={CARD_CLASS}><GrainOverlay /><div className="relative z-20 p-6">
                <div className="flex items-center justify-between mb-5"><BarcodeStrip className="w-12 h-4" /><span className="text-xs font-black uppercase tracking-[0.2em] text-[#333333]" style={LABEL_MONO}>yield</span></div>
                <h2 className="mb-5 text-2xl font-black tracking-[-0.04em]" style={HEADING_FONT}>Yield</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatBox label="Pool Gacha" value={`${pool.yieldCumulative} XLM`} bg="bg-[#ede9fe]" sub="Cumulative" Icon={Gift} />
                  <StatBox label="Collateral" value={`${pool.yieldCollateral} XLM`} bg="bg-[#e0f4ff]" sub="Monthly split" />
                  <StatBox label="Est. APY" value={`${pool.apy}%`} bg="bg-[#ccfbf1]" />
                  <StatBox label="Collat/Member" value={`${coll} XLM`} bg="bg-[#fef9c3]" sub={`${config ? Number(config.collateral_ratio_bps) / 100 : DEFAULT_COLLATERAL_MULTIPLIER}%`} />
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
