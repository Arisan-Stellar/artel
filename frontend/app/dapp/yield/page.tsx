"use client";

import { useEffect, useState, useCallback } from "react";
import { Zap, Coins, Trophy, Sparkles, PieChart, Activity, RefreshCcw, Landmark, Search, PlayCircle, AlertCircle } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { artelClient, CONTRACT_IDS } from "@/lib/artel-sdk";
import { scValToNative } from "@stellar/stellar-sdk";
import { useWallet } from "@/hooks/WalletContext";

export default function YieldPage() {
  const [blendStats, setBlendStats] = useState({ staked: "0.0", yield: "0.00", gacha: "0.00", monthly: "0.00" });
  const [memberYields, setMemberYields] = useState<{ address: string, poolId: number, vault: number, gacha: number, merata: number, contributed: number, collateral: number, isMock: boolean }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [adminPools, setAdminPools] = useState<number[]>([]);
  const [loadingSim, setLoadingSim] = useState(false);
  const { address } = useWallet();

  const fetchBlend = useCallback(async () => {
    try {
      const countRes = await fetch("/api/pools");
      const { count } = await countRes.json();
      const poolCount = count || 0;

      let aggStaked = 0;
      let aggGacha = 0;
      let aggMonthly = 0;
      let memberAgg = new Map<string, any>();
      let myAdminPools: number[] = [];

      for (let i = 0; i < poolCount; i++) {
        try {
          const adminRes = await fetch(`/api/contract-state?pool_id=${i}&fn=get_admin`);
          if (adminRes.ok) {
            const { get_admin } = await adminRes.json();
            if (get_admin === address) {
              myAdminPools.push(i);
            }
          }

          const scval = await artelClient.getArisanState(CONTRACT_IDS.pool, i);
          if (scval) {
            const native = scValToNative(scval);
            aggStaked += Number(native.blend_btoken_balance) / 10000000;
            aggGacha += Number(native.yield_balance) / 10000000;
            aggMonthly += Number(native.pool_funds_balance) / 10000000; 
          }
          
          const lbRes = await fetch(`/api/contract-state?pool_id=${i}&fn=get_leaderboard`);
          if (lbRes.ok) {
            const lbData = await lbRes.json();
            if (lbData.get_leaderboard && Array.isArray(lbData.get_leaderboard)) {
              await Promise.all(
                lbData.get_leaderboard.map(async (entry: any) => {
                  const addr = entry[0];
                  try {
                    const mRes = await fetch(`/api/contract-state?pool_id=${i}&fn=get_member_info&member=${addr}`);
                    const mData = await mRes.json();
                    const info = mData.get_member_info;
                    const earned = info ? Number(info.yield_earned) / 10000000 : 0;
                    const contributed = info ? Number(info.total_contributed) / 10000000 : 0;
                    const collateral = info ? Number(info.collateral_amount) / 10000000 : 0;
                    
                    const key = `${addr}-${i}`;
                    if (!memberAgg.has(key)) {
                      memberAgg.set(key, { address: addr, poolId: i, vault: 0, gacha: 0, merata: 0, contributed: 0, collateral: 0, isMock: false });
                    }
                    const cur = memberAgg.get(key);
                    cur.contributed += contributed;
                    cur.collateral += collateral;
                    cur.gacha += (earned * 0.25);
                    cur.merata += (earned * 0.75);
                    cur.vault += (contributed * 0.005);
                  } catch (e) {}
                })
              );
            }
          }
        } catch (e) {
          console.error(`Error fetching pool ${i}`, e);
        }
      }

      setAdminPools(myAdminPools);

      const totalYield = aggGacha * 4; 
      setBlendStats({
        staked: aggStaked.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        yield: totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        gacha: aggGacha.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        monthly: aggMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      });

      let yields = Array.from(memberAgg.values());
      
      // Sort members: Put the connected user at the top, others below
      if (address) {
        yields.sort((a, b) => {
          if (a.address === address && b.address !== address) return -1;
          if (b.address === address && a.address !== address) return 1;
          return a.poolId - b.poolId;
        });
      }
      
      setMemberYields(yields);
    } catch (e) {
      console.error(e);
    }
  }, [address]);

  useEffect(() => {
    fetchBlend();
    const iv = setInterval(fetchBlend, 5000);
    return () => clearInterval(iv);
  }, [fetchBlend]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredYields = memberYields.filter(member => member.address.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredYields.length / itemsPerPage));
  const paginatedYields = filteredYields.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen px-5 pb-20 pt-24 md:px-10 lg:px-12 bg-[#f0ead2]">
      <div className="mx-auto max-w-5xl">
        {/* Hero Section */}
        <div className="border-[4px] border-[#0a0a0a] bg-[var(--color-sui)] p-8 md:p-12 shadow-[12px_12px_0_#0a0a0a] relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 border-[2px] border-[#0a0a0a] bg-white px-3 py-1 mb-6">
                <Zap className="size-4 text-[#f59e0b]" />
                <span className="text-xs font-black tracking-wider uppercase" style={LABEL_MONO}>Powered by Blend Protocol</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-[0.95] text-[#0a0a0a]" style={HEADING_FONT}>
                Triple Yield Engine.
              </h1>
              <p className="max-w-2xl text-lg font-semibold leading-7 text-[#333333]">
                The money you save in ARTEL never sits idle. We rotate your funds in the Stellar DeFi ecosystem to generate sustainable yield through three distribution pillars.
              </p>
            </div>
            
            {/* Realtime Stats Box */}
            <div className="shrink-0 w-full md:w-72 border-[3px] border-[#0a0a0a] bg-white p-5 shadow-[6px_6px_0_#0a0a0a]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-sm uppercase tracking-widest" style={LABEL_MONO}>Live On-Chain Data</h3>
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#555]">Total TVL di Blend</p>
                  <p className="text-2xl font-black text-[#38bdf8]">{blendStats.staked} XLM</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#555]">Total Yield Dihasilkan</p>
                  <p className="text-2xl font-black text-[#14b8a6]">+{blendStats.yield} XLM</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative background shapes */}
          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-1/3 size-32 bg-[#f59e0b] opacity-20 rotate-45 blur-2xl pointer-events-none" />
        </div>

        {/* The 3 Pillars of Yield */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#38bdf8] flex items-center justify-center mb-6">
              <PieChart className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>1. Merata (Collateral)</h3>
            <p className="text-[#444] font-semibold text-sm flex-1 leading-relaxed">
              75% of the yield generated by the collateral is distributed evenly to all contributing members proportionally.
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#38bdf8]" style={LABEL_MONO}>Allocation: 75% OF COLLATERAL YIELD</span>
            </div>
          </div>

          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#f59e0b] flex items-center justify-center mb-6">
              <RefreshCcw className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>2. Monthly Contribution Yield</h3>
            <p className="mt-4 text-xs font-semibold leading-relaxed text-[#333]">
              Participants' deposits in the pool do not sit idle before the draw. These funds are staked to Blend, and the yield (Cumulative Yield) is dynamic. The withdrawal process is done at the end of the Pool period, which can be 1 month, 6 months, etc. depending on the Pool's duration.
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#f59e0b]" style={LABEL_MONO}>Live Vault: {blendStats.monthly} XLM</span>
            </div>
          </div>

          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a] flex flex-col hover:-translate-y-1 hover:shadow-[12px_12px_0_#0a0a0a] transition-all">
            <div className="size-12 border-[2px] border-[#0a0a0a] bg-[#ec4899] flex items-center justify-center mb-6">
              <Trophy className="size-6 text-[#0a0a0a]" />
            </div>
            <h3 className="text-2xl font-black mb-3" style={HEADING_FONT}>3. End of Period Gacha</h3>
            <p className="text-[#444] font-semibold text-sm flex-1 leading-relaxed">
              25% of the collateral yield is collected into a special Gacha pot. At the end of the Pool cycle, this pot is drawn using a Point/Ticket system for participants with the best reputation!
            </p>
            <div className="mt-6 pt-4 border-t-2 border-dashed border-[#0a0a0a]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#ec4899]" style={LABEL_MONO}>Allocation: 25% EVERY CYCLE END</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          {alertMsg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-md border-[4px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-8 bg-[#f59e0b] border-[2px] border-[#0a0a0a] flex items-center justify-center">
                    <AlertCircle className="size-5 text-[#0a0a0a]" />
                  </div>
                  <h3 className="text-xl font-black" style={HEADING_FONT}>Notice</h3>
                </div>
                <p className="text-sm font-bold text-[#333] mb-6">{alertMsg}</p>
                <button
                  onClick={() => setAlertMsg(null)}
                  className="w-full border-[3px] border-[#0a0a0a] bg-[var(--color-sui)] px-4 py-3 text-sm font-black uppercase text-[#0a0a0a] shadow-[4px_4px_0_#0a0a0a] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-black" style={HEADING_FONT}>Member Yields (Live)</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#888]" />
              <input 
                type="text" 
                placeholder="Search Member Address..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 border-[3px] border-[#0a0a0a] bg-white py-2 pl-9 pr-3 text-sm font-bold shadow-[4px_4px_0_#0a0a0a] outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all"
              />
            </div>
          </div>
          
          <div className="border-[3px] border-[#0a0a0a] bg-[#fef9c3] p-4 shadow-[4px_4px_0_#0a0a0a] mb-6">
            <p className="font-black text-sm uppercase text-[#0a0a0a]" style={LABEL_MONO}>Blend Integration & Simulation Info</p>
            <ul className="mt-2 list-inside list-disc text-xs font-semibold leading-relaxed text-[#333]">
              <li>Collateral is automatically deposited into <b>Blend Protocol</b> upon joining (*Join*). Yield runs on the network.</li>
              <li>Only <b>Pool Admins</b> can harvest real yield (On-Chain) via the <b>Harvest</b> buttons below. If you are not an Admin, clicking the button will only trigger <b>Bypass Mode</b> (a visual simulation on your screen without modifying real data).</li>
            </ul>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* ACCUMULATED CARD */}
            {address && memberYields.filter(m => m.address === address).length > 0 && (
              <div className="col-span-1 md:col-span-2 border-[3px] border-[#0a0a0a] bg-[#0a0a0a] p-5 shadow-[6px_6px_0_#f59e0b] flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between border-b-2 border-dashed border-[#555] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full border-[2px] border-white bg-[#f59e0b] flex items-center justify-center font-black">🌟</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#ccc]" style={LABEL_MONO}>My Accumulated Yields</p>
                      <p className="text-sm font-bold truncate max-w-[120px] text-white" title={address}>{address}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if(!address) { setAlertMsg("Please connect your wallet first!"); return; }
                      if(adminPools.length === 0) {
                        setAlertMsg("Bypass Mode Active: Frontend Simulation...");
                        setBlendStats(s => ({ ...s, yield: (Number(s.yield) + 0.5 * memberYields.filter(m => m.address === address).length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }));
                        setMemberYields(prev => prev.map(m => m.address === address ? { ...m, gacha: m.gacha + (0.5 * 0.25), merata: m.merata + (0.5 * 0.75) } : m));
                        return;
                      }
                      setLoadingSim(true);
                      try {
                        const { Client } = await import("@/bindings/arisan-pool/src/index");
                        const { NETWORK_PASSPHRASE } = await import("@/lib/artel-sdk");
                        const poolClient = new Client({ rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org:443", networkPassphrase: NETWORK_PASSPHRASE, contractId: CONTRACT_IDS.pool });
                        
                        let successCount = 0;
                        for (const pid of adminPools) {
                          try {
                            const tx = await poolClient.harvest_yield({ pool_id: pid, amount: BigInt(5000000) });
                            const txResult = await tx.signAndSend();
                            if (txResult) successCount++;
                          } catch (e) {
                            console.error(`Failed yield simul on pool ${pid}`, e);
                          }
                        }
                        if(successCount > 0) { 
                          setAlertMsg(`Harvest successful (0.5 XLM) from ${successCount} testnet pools!`); 
                          fetchBlend(); 
                        } else {
                          throw new Error("All simul failed");
                        }
                      } catch (e) {
                        setAlertMsg("Transaction failed. Ensure you have enough testnet balance and you are the Admin.");
                      }
                      setLoadingSim(false);
                    }}
                    disabled={loadingSim}
                    className="flex items-center justify-center gap-2 border-[3px] border-[#0a0a0a] bg-white px-4 py-2 text-xs font-black uppercase text-[#0a0a0a] shadow-[4px_4px_0_#f59e0b] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    <PlayCircle className="size-4" />
                    Harvest All
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-dashed border-[#555] pb-2">
                    <p className="text-[10px] font-black text-[#ccc]" style={LABEL_MONO}>TOTAL GACHA</p>
                    <p className="text-sm font-black text-white">{memberYields.filter(m => m.address === address).reduce((acc, curr) => acc + curr.gacha, 0).toFixed(6)} XLM</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-[#555] pb-2">
                    <p className="text-[10px] font-black text-[#ccc]" style={LABEL_MONO}>TOTAL MERATA</p>
                    <p className="text-sm font-black text-white">{memberYields.filter(m => m.address === address).reduce((acc, curr) => acc + curr.merata, 0).toFixed(6)} XLM</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#ccc]" style={LABEL_MONO}>TOTAL VAULT</p>
                    <p className="text-sm font-black text-white">{memberYields.filter(m => m.address === address).reduce((acc, curr) => acc + curr.vault, 0).toFixed(6)} XLM</p>
                  </div>
                </div>
              </div>
            )}

            {/* INDIVIDUAL POOL CARDS */}
            {address && memberYields.filter(m => m.address === address).map((myCard, idx) => (
              <div key={`my-${idx}`} className="col-span-1 border-[3px] border-[#0a0a0a] bg-[#ccfbf1] p-5 shadow-[6px_6px_0_#0a0a0a] flex flex-col gap-4">
                <div className="flex items-center justify-between border-b-2 border-dashed border-[#0a0a0a] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full border-[2px] border-[#0a0a0a] bg-[#f59e0b] flex items-center justify-center font-black">⭐</div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-[#555]" style={LABEL_MONO}>Pool {myCard.poolId}</p>
                      <p className="text-sm font-bold truncate max-w-[120px]" title={address}>{address}</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!adminPools.includes(myCard.poolId)) {
                        setAlertMsg("It's not time to harvest yield yet! Yield hasn't accumulated or the claim period hasn't arrived. (Or you are not an Admin)");
                        return;
                      }
                      try {
                        const { Client } = await import("@/bindings/arisan-pool/src/index");
                        const { NETWORK_PASSPHRASE } = await import("@/lib/artel-sdk");
                        const poolClient = new Client({ rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://soroban-testnet.stellar.org:443", networkPassphrase: NETWORK_PASSPHRASE, contractId: CONTRACT_IDS.pool });
                        
                        const tx = await poolClient.harvest_yield({ pool_id: myCard.poolId, amount: BigInt(5000000) });
                        const txResult = await tx.signAndSend();
                        if(txResult) { 
                          setAlertMsg(`Harvest successful (0.5 XLM) from Pool ${myCard.poolId}! Real distribution to members has been completed.`); 
                          fetchBlend(); 
                        }
                      } catch (e) {
                        setAlertMsg(`Transaction failed. Ensure you have enough XLM balance and you are the Admin of Pool ${myCard.poolId}.`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 border-[3px] border-[#0a0a0a] bg-[var(--color-sui)] px-3 py-2 text-[10px] font-black uppercase text-[#0a0a0a] shadow-[4px_4px_0_#0a0a0a] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Harvest
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-dashed border-[#0a0a0a] pb-2">
                    <p className="text-[10px] font-black text-[#ec4899]" style={LABEL_MONO}>GACHA</p>
                    <p className="text-sm font-black text-[#0a0a0a]">{Number(myCard.gacha).toFixed(6)} XLM</p>
                  </div>
                  <div className="flex items-center justify-between border-b border-dashed border-[#0a0a0a] pb-2">
                    <p className="text-[10px] font-black text-[#0284c7]" style={LABEL_MONO}>MERATA (COLLATERAL)</p>
                    <p className="text-sm font-black text-[#0a0a0a]">{Number(myCard.merata).toFixed(6)} XLM</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#d97706]" style={LABEL_MONO}>VAULT</p>
                    <p className="text-sm font-black text-[#0a0a0a]">{Number(myCard.vault).toFixed(6)} XLM</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[3px] flex-1 bg-[#0a0a0a]"></div>
            <p className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]" style={LABEL_MONO}>Other Members</p>
            <div className="h-[3px] flex-1 bg-[#0a0a0a]"></div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {paginatedYields.length > 0 ? (
              paginatedYields.filter(m => m.address !== address).map((member, idx) => {
                return (
                  <div key={idx} className="border-[3px] border-[#0a0a0a] bg-white p-5 shadow-[6px_6px_0_#0a0a0a] flex flex-col gap-4 hover:-translate-y-1 transition-all">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-[#0a0a0a] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full border-[2px] border-[#0a0a0a] bg-[#fef9c3] flex items-center justify-center font-black">{(currentPage - 1) * itemsPerPage + idx + 1}</div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#555]" style={LABEL_MONO}>Member Address (Pool {member.poolId})</p>
                          <p className="text-sm font-bold truncate max-w-[120px]" title={member.address}>{member.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-dashed border-[#e5e7eb] pb-2">
                        <p className="text-[10px] font-black text-[#ec4899]" style={LABEL_MONO}>GACHA</p>
                        <p className="text-sm font-black text-[#0a0a0a]">{Number(member.gacha).toFixed(6)} XLM</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-[#e5e7eb] pb-2">
                        <p className="text-[10px] font-black text-[#0284c7]" style={LABEL_MONO}>MERATA (COLLATERAL)</p>
                        <p className="text-sm font-black text-[#0a0a0a]">{Number(member.merata).toFixed(6)} XLM</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-[#d97706]" style={LABEL_MONO}>VAULT</p>
                        <p className="text-sm font-black text-[#0a0a0a]">{Number(member.vault).toFixed(6)} XLM</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!adminPools.includes(member.poolId)) {
                          setAlertMsg(`You cannot simulate yield for ${member.address.slice(0, 6)}... because you are not the Admin of Pool ${member.poolId}.`);
                          return;
                        }
                      }}
                      className="mt-4 w-full border-[3px] border-[#0a0a0a] bg-[var(--color-purple)] px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0_#0a0a0a] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#0a0a0a] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    >
                      Simulate
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-12 border-[3px] border-dashed border-[#0a0a0a] bg-white">
                <p className="text-lg font-bold">No member data or not found.</p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-[3px] border-[#0a0a0a] bg-white font-black text-sm uppercase shadow-[3px_3px_0_#0a0a0a] disabled:opacity-50 disabled:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`size-10 border-[3px] border-[#0a0a0a] flex items-center justify-center font-black text-sm transition-all ${
                      currentPage === num 
                        ? "bg-[var(--color-sui)] shadow-[3px_3px_0_#0a0a0a] -translate-y-1" 
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border-[3px] border-[#0a0a0a] bg-white font-black text-sm uppercase shadow-[3px_3px_0_#0a0a0a] disabled:opacity-50 disabled:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="mt-16 border-[3px] border-[#0a0a0a] bg-[#fef9c3] p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="size-16 shrink-0 border-[2px] border-[#0a0a0a] bg-white rounded-full flex items-center justify-center">
            <Landmark className="size-8 text-[#0a0a0a]" />
          </div>
          <div>
            <h4 className="font-black text-xl mb-1" style={HEADING_FONT}>Full Transparency (Blockchain-verified)</h4>
            <p className="text-sm font-medium leading-relaxed text-[#333333]">
              The entire process of withdrawal, supply, and yield distribution is executed automatically by smart contracts on the Stellar network. There is no data centralization; all assets and numbers can be verified via Stellar Explorer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
