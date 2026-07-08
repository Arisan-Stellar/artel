"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Star, Clock, Award, Gift, Sparkles, Trophy, Wallet } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";
import { artelClient, CONTRACT_IDS } from "@/lib/artel-sdk";
import { scValToNative } from "@stellar/stellar-sdk";

const MY_POOLS = [
  { id: "POOL_01", name: "Arisan RT 05", role: "Member", cycles: "3/10", yield: "+3.2 XLM", points: 24, tickets: 52, status: "Active" },
  { id: "POOL_02", name: "Keluarga Harmoni", role: "Admin", cycles: "1/8", yield: "+0.5 XLM", points: 6, tickets: 13, status: "Active" },
];

export default function DashboardPage() {
  const { address } = useWallet();
  const [blendStats, setBlendStats] = useState({ staked: "0.0", yield: "0.00", gacha: "0.00" });

  useEffect(() => {
    if (!address) return;
    const fetchBlend = async () => {
      try {
        const scval = await artelClient.getArisanState(CONTRACT_IDS.pool);
        if (scval) {
          const native = scValToNative(scval);
          const totalStaked = Number(native.blend_btoken_balance) / 10000000;
          const gacha = Number(native.yield_balance) / 10000000;
          const totalYield = gacha * 4; // Since Gacha Pot is 25% of total collateral yield
          
          setBlendStats({
            staked: totalStaked.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            yield: totalYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            gacha: gacha.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          });
        }
      } catch (e) {
        console.error("Failed to fetch blend stats", e);
      }
    };
    fetchBlend();
    const iv = setInterval(fetchBlend, 5000); // Realtime polling every 5s
    return () => clearInterval(iv);
  }, [address]);

  if (!address) {
    return (
      <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-lg text-center">
          <Wallet className="size-16 mx-auto text-[var(--color-artel)] mb-4" />
          <h1 className="text-4xl font-black" style={HEADING_FONT}>Connect Your Wallet</h1>
          <p className="mt-4 text-lg font-semibold text-[#333333]">Click <strong>CONNECT</strong> in the top-right to see your dashboard.</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Your pools, points, yield earnings, and gacha tickets will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl" style={HEADING_FONT}>Dashboard</h1>
        <p className="mt-4 text-lg font-semibold text-[#333333]">Your ARTEL hub — pools, points, yield.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Shield, label: "Active Pools", value: "2", bg: "bg-white" },
            { icon: Star, label: "Total Points", value: "248", bg: "bg-[#e0f4ff]" },
            { icon: Clock, label: "Best Streak", value: "12x", bg: "bg-[#ccfbf1]" },
            { icon: Award, label: "Gacha Tickets", value: "82", bg: "bg-[#fef9c3]" },
          ].map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className={`border-[3px] border-[#0a0a0a] ${bg} p-4 shadow-[8px_8px_0_#0a0a0a] text-center`}>
              <Icon className="size-5 mx-auto mb-1 text-[var(--color-sui)]" />
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#333333]" style={LABEL_MONO}>{label}</p>
              <p className="mt-2 text-2xl font-black" style={HEADING_FONT}>{value}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-12 mb-4 text-2xl font-black" style={HEADING_FONT}>Blend Protocol Vault</h2>
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-[3px] border-[#0a0a0a] bg-[#fdfdfa] p-5 shadow-[8px_8px_0_#0a0a0a]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-full bg-[#38bdf8] border-[2px] border-[#0a0a0a] flex items-center justify-center"><Sparkles className="size-4 text-white" /></div>
              <h3 className="font-black" style={HEADING_FONT}>Total Staked</h3>
            </div>
            <p className="text-3xl font-black">{blendStats.staked} <span className="text-lg">XLM</span></p>
            <p className="text-xs font-semibold text-[#333] mt-1">Generating yield in Blend</p>
          </div>
          <div className="border-[3px] border-[#0a0a0a] bg-[#fdfdfa] p-5 shadow-[8px_8px_0_#0a0a0a]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-full bg-[#f59e0b] border-[2px] border-[#0a0a0a] flex items-center justify-center"><Gift className="size-4 text-white" /></div>
              <h3 className="font-black" style={HEADING_FONT}>Yield Generated</h3>
            </div>
            <p className="text-3xl font-black text-[#14b8a6]">+ {blendStats.yield} <span className="text-lg">XLM</span></p>
            <p className="text-xs font-semibold text-[#333] mt-1">From collateral & dues</p>
          </div>
          <div className="border-[3px] border-[#0a0a0a] bg-[#fdfdfa] p-5 shadow-[8px_8px_0_#0a0a0a]">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-8 rounded-full bg-[#ec4899] border-[2px] border-[#0a0a0a] flex items-center justify-center"><Trophy className="size-4 text-white" /></div>
              <h3 className="font-black" style={HEADING_FONT}>Gacha Pot (25%)</h3>
            </div>
            <p className="text-3xl font-black text-[#8b5cf6]">{blendStats.gacha} <span className="text-lg">XLM</span></p>
            <p className="text-xs font-semibold text-[#333] mt-1">End of period reward</p>
          </div>
        </div>

        <h2 className="mt-12 mb-4 text-2xl font-black" style={HEADING_FONT}>My Pools</h2>
        <div className="space-y-3 mb-10">
          {MY_POOLS.map((p) => (
            <Link key={p.id} href={`/dapp/pools/${p.id}`} className="border-[3px] border-[#0a0a0a] bg-white p-4 shadow-[6px_6px_0_#0a0a0a] flex flex-wrap items-center justify-between gap-3 hover:-translate-x-1 hover:-translate-y-1 transition">
              <div><h3 className="font-black text-lg" style={HEADING_FONT}>{p.name}</h3><p className="text-xs text-[#333333]">{p.role} · {p.cycles} cycles</p></div>
              <div className="flex gap-4 text-sm">
                <span className="font-bold"><Star className="inline size-3" /> {p.points} pts</span>
                <span className="font-bold">{p.tickets} tickets</span>
                <span className="text-[var(--color-teal)] font-bold">{p.yield}</span>
                <span className="border-[2px] border-[var(--color-sui)] text-[var(--color-sui)] px-2 py-0.5 text-[9px] font-black uppercase">{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
