"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, Star, Clock, Award, Wallet } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";

interface MyPool { id: string; name: string; role: string; cycles: string; points: number; tickets: number; status: string }

export default function DashboardPage() {
  const { address } = useWallet();
  const [myPools, setMyPools] = useState<MyPool[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const countRes = await fetch("/api/pools");
      const { count } = await countRes.json();
      const found: MyPool[] = [];
      for (let i = 0; i < (count || 0); i++) {
        const [miRes, adminRes, stateRes, tixRes] = await Promise.all([
          fetch(`/api/contract-state?pool_id=${i}&fn=get_member_info&member=${address}`).then((r) => r.json()).catch(() => null),
          fetch(`/api/contract-state?pool_id=${i}&fn=get_admin`).then((r) => r.json()).catch(() => null),
          fetch(`/api/contract-state?pool_id=${i}`).then((r) => r.json()).catch(() => null),
          fetch(`/api/contract-state?pool_id=${i}&fn=get_tickets&member=${address}`).then((r) => r.json()).catch(() => null),
        ]);
        const mi = miRes?.get_member_info;
        if (!mi) continue;
        const s = stateRes?.state || {};
        const c = stateRes?.config || {};
        const stateTag = Array.isArray(s.state) ? s.state[0] : s.state;
        found.push({
          id: String(i),
          name: c.name || `Pool #${i}`,
          role: adminRes?.get_admin === address ? "Admin" : "Member",
          cycles: `${Number(s.current_round || 0)}/${Number(s.total_rounds || 0)}`,
          points: Number(mi.total_points || 0),
          tickets: Number(tixRes?.get_tickets || 0),
          status: stateTag === "Active" ? "Active" : stateTag === "Completed" ? "Completed" : "Pending",
        });
      }
      setMyPools(found);
    } catch {}
    setLoading(false);
  }, [address]);

  useEffect(() => { load(); }, [load]);

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

  const activePools = myPools.filter((p) => p.status === "Active").length;
  const totalPoints = myPools.reduce((a, p) => a + p.points, 0);
  const totalTickets = myPools.reduce((a, p) => a + p.tickets, 0);
  const stats = [
    { icon: Shield, label: "Active Pools", value: String(activePools), bg: "bg-white" },
    { icon: Star, label: "Total Points", value: String(totalPoints), bg: "bg-[#e0f4ff]" },
    { icon: Clock, label: "My Pools", value: String(myPools.length), bg: "bg-[#ccfbf1]" },
    { icon: Award, label: "Gacha Tickets", value: String(totalTickets), bg: "bg-[#fef9c3]" },
  ];

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl" style={HEADING_FONT}>Dashboard</h1>
        <p className="mt-4 text-lg font-semibold text-[#333333]">Your ARTEL hub — pools, points, yield.</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, bg }) => (
            <div key={label} className={`border-[3px] border-[#0a0a0a] ${bg} p-4 shadow-[8px_8px_0_#0a0a0a] text-center`}>
              <Icon className="size-5 mx-auto mb-1 text-[var(--color-sui)]" />
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#333333]" style={LABEL_MONO}>{label}</p>
              <p className="mt-2 text-2xl font-black" style={HEADING_FONT}>{value}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-12 mb-4 text-2xl font-black" style={HEADING_FONT}>My Pools</h2>
        {loading ? (
          <p className="text-sm font-semibold text-[#333333]">Loading your pools…</p>
        ) : myPools.length === 0 ? (
          <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[6px_6px_0_#0a0a0a] text-center">
            <p className="font-bold text-[#333333]">You haven&apos;t joined any pools yet.</p>
            <Link href="/dapp/pools" className="mt-3 inline-block border-[3px] border-[#0a0a0a] bg-[var(--color-artel)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#0a0a0a]">Browse Pools</Link>
          </div>
        ) : (
          <div className="space-y-3 mb-10">
            {myPools.map((p) => (
              <Link key={p.id} href={`/dapp/pools/${p.id}`} className="border-[3px] border-[#0a0a0a] bg-white p-4 shadow-[6px_6px_0_#0a0a0a] flex flex-wrap items-center justify-between gap-3 hover:-translate-x-1 hover:-translate-y-1 transition">
                <div><h3 className="font-black text-lg" style={HEADING_FONT}>{p.name}</h3><p className="text-xs text-[#333333]">{p.role} · {p.cycles} cycles</p></div>
                <div className="flex gap-4 text-sm">
                  <span className="font-bold"><Star className="inline size-3" /> {p.points} pts</span>
                  <span className="font-bold">{p.tickets} tickets</span>
                  <span className="border-[2px] border-[var(--color-sui)] text-[var(--color-sui)] px-2 py-0.5 text-[9px] font-black uppercase">{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
