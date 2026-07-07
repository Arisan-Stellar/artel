"use client";

import { useState } from "react";
import { Gift, Trophy, Sparkles } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";

export default function GachaPage() {
  const { address } = useWallet();
  const [tab, setTab] = useState<"annual" | "pool">("annual");

  if (!address) {
    return (
      <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-lg text-center">
          <Gift className="size-16 mx-auto text-[var(--color-artel)] mb-4" />
          <h1 className="text-4xl font-black" style={HEADING_FONT}>Gacha Jackpot</h1>
          <p className="mt-4 text-lg font-semibold text-[#333333]">Connect your wallet to see your tickets and prize odds.</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Click <strong>CONNECT</strong> in the top-right corner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex items-center gap-2 border-[3px] border-[#0a0a0a] bg-[#f8672d] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_#0a0a0a]" style={LABEL_MONO}><Gift className="size-4" /> GACHA JACKPOT</p>
        <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl" style={HEADING_FONT}>Win Big</h1>
        <p className="mt-4 text-lg font-semibold text-[#333333]">Weighted random draws. More tickets = higher chance.</p>
        <div className="mt-8 flex gap-2">
          {(["annual", "pool"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`border-[3px] border-[#0a0a0a] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#0a0a0a] transition ${tab === t ? "bg-[#0a0a0a] text-[var(--color-artel)]" : "bg-white text-[#0a0a0a]"}`}>{t === "annual" ? "Annual · Jun 30" : "Pool · End"}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3 mb-8">
          {[
            { tier: "Grand Jackpot", prize: "~945 XLM", winners: "1 winner", icon: Trophy },
            { tier: "Runner-Up", prize: "~283 XLM", winners: "2 winners", icon: Sparkles },
            { tier: "Consolation", prize: "~27 XLM", winners: "Split equally", icon: Gift },
          ].map(({ tier, prize, winners, icon: Icon }) => (
            <div key={tier} className="border-[3px] border-[#0a0a0a] bg-white p-5 text-center shadow-[8px_8px_0_#0a0a0a]">
              <Icon className="size-8 mx-auto mb-2 text-[var(--color-artel)]" />
              <p className="text-xs font-black uppercase tracking-[0.1em]" style={LABEL_MONO}>{tier}</p>
              <p className="mt-2 text-3xl font-black" style={HEADING_FONT}>{prize}</p>
              <p className="text-xs text-[#333333]">{winners}</p>
            </div>
          ))}
        </div>
        <div className="border-[3px] border-[#0a0a0a] bg-white p-6 shadow-[8px_8px_0_#0a0a0a]">
          <p className="text-[10px] font-black uppercase tracking-[0.1em]" style={LABEL_MONO}>Your Tickets</p>
          <p className="text-3xl font-black text-[var(--color-artel)]" style={HEADING_FONT}>82</p>
        </div>
      </div>
    </div>
  );
}
