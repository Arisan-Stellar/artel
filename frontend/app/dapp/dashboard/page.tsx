"use client";

import Link from "next/link";
import { Shield, Star, Clock, Award, Gift, Sparkles, Trophy, Wallet } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";

const MY_POOLS = [
  { id: "POOL_01", name: "Arisan RT 05", role: "Member", cycles: "3/10", yield: "+3.2 XLM", points: 24, tickets: 52, status: "Active" },
  { id: "POOL_02", name: "Keluarga Harmoni", role: "Admin", cycles: "1/8", yield: "+0.5 XLM", points: 6, tickets: 13, status: "Active" },
];

export default function DashboardPage() {
  const { address } = useWallet();

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
