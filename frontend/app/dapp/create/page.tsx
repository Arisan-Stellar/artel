"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";
import { getRequiredCollateralAmount } from "@/lib/poolMath";

export default function CreateArisanPage() {
  const { address } = useWallet();
  const [name, setName] = useState("");
  const [deposit, setDeposit] = useState(25);
  const [max, setMax] = useState(8);
  const coll = Math.ceil(deposit * (max - 1) * 125 / 100);

  if (!address) {
    return (
      <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-lg text-center">
          <Wallet className="size-16 mx-auto text-[var(--color-artel)] mb-4" />
          <h1 className="text-4xl font-black" style={HEADING_FONT}>Create Arisan Pool</h1>
          <p className="mt-4 text-lg font-semibold text-[#333333]">Connect your wallet to deploy a new ROSCA pool on Stellar Testnet.</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Click <strong>CONNECT</strong> in the top-right corner.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl mb-6" style={HEADING_FONT}>Create Arisan</h1>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em]" style={LABEL_MONO}>Pool Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-[3px] border-[#0a0a0a] bg-white px-3 py-2 text-sm font-semibold" placeholder="e.g. RT 05 Savings Circle" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em]" style={LABEL_MONO}>Deposit (XLM)</label>
              <input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} className="w-full border-[3px] border-[#0a0a0a] bg-white px-3 py-2 text-sm font-semibold" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.15em]" style={LABEL_MONO}>Max Members</label>
              <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} className="w-full border-[3px] border-[#0a0a0a] bg-white px-3 py-2 text-sm font-semibold" />
            </div>
          </div>
          <div className="border-[3px] border-[#0a0a0a] bg-[#ccfbf1] p-4">
            <div className="flex justify-between text-xs font-semibold"><span>Per Member</span><span className="font-black">{coll} XLM</span></div>
            <div className="mt-1 flex justify-between text-xs font-semibold"><span>Upfront (coll + 1st cycle)</span><span className="font-black">{coll + deposit} XLM</span></div>
            <div className="mt-2 border-t-[2px] border-[#0a0a0a] pt-2 flex justify-between text-sm font-black"><span>Total Pool</span><span>{deposit * max} XLM</span></div>
          </div>
          <button disabled className="w-full border-[3px] border-[#0a0a0a] bg-[#f8672d] px-6 py-3 font-display text-lg tracking-tight hover:-translate-y-0.5 disabled:opacity-50" style={HEADING_FONT}>
            Deploy Arisan Contract
          </button>
        </div>
      </div>
    </div>
  );
}
