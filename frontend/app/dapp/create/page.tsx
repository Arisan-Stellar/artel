"use client";

import { useState } from "react";
import { getRequiredCollateralFromConfig, getRemainingCommitmentCycles } from "@/lib/poolMath";
import { Wallet, Loader } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";
import { Client, networks } from "@/bindings/arisan-pool/src/index";
import { CONTRACT_IDS, RPC_URL, XLM_CONTRACT, NETWORK_PASSPHRASE } from "@/lib/artel-sdk";

export default function CreateArisanPage() {
  const { address } = useWallet();
  const [name, setName] = useState("");
  const [deposit, setDeposit] = useState(25);
  const [max, setMax] = useState(8);
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const coll = getRequiredCollateralFromConfig({ contribution_amount: deposit * 10_000_000, max_members: max, collateral_ratio_bps: 12500 });

  if (!address) {
    return (
      <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-lg text-center">
          <Wallet className="size-16 mx-auto text-[var(--color-artel)] mb-4" />
          <h1 className="text-4xl font-black" style={HEADING_FONT}>Create Arisan Pool</h1>
          <p className="mt-4 text-lg font-semibold text-[#333333]">Connect your wallet to create a new ROSCA pool on Stellar Testnet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl mb-6" style={HEADING_FONT}>Create Pool</h1>
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

          {status && (
            <div className="border-[3px] border-[#0a0a0a] bg-[#1a1a2e] p-4 text-xs font-mono text-green-400 flex items-center gap-2">
              <Loader className="size-3 animate-spin" /> {status}
            </div>
          )}
          {error && (
            <div className="border-[3px] border-[#0a0a0a] bg-[var(--color-crack)] px-4 py-2 text-xs font-bold text-white">❌ {error}</div>
          )}
          {result && (
            <div className="border-[3px] border-[#0a0a0a] bg-[var(--color-teal)] bg-opacity-10 p-4 text-center">
              <p className="text-lg font-black text-[var(--color-teal)]" style={HEADING_FONT}>Pool Created! ✅</p>
              <p className="mt-2 text-xs font-mono break-all text-[#333]">{result}</p>
              <a href={`/dapp/pools/${result}`} className="inline-block mt-3 border-[3px] border-[#0a0a0a] bg-[var(--color-teal)] px-6 py-2 text-sm font-black text-white hover:translate-y-[-2px] transition">View Pool →</a>
            </div>
          )}

          <button
            onClick={async () => {
              if (!address) return;
              setDeploying(true);
              setError(""); setStatus("");

              try {
                setStatus("Connecting to Freighter...");
                const freighter = await import("@stellar/freighter-api");
                const pubKey = await freighter.getAddress();
                if (!pubKey.address) throw new Error("Wallet not connected");

                const contributionAmount = BigInt(deposit * 10_000_000);

                setStatus("Building create pool transaction...");
                const poolClient = new Client({
                  rpcUrl: RPC_URL,
                  networkPassphrase: networks.testnet.networkPassphrase,
                  contractId: CONTRACT_IDS.pool,
                  publicKey: pubKey.address,
                });

                const assembled = await poolClient.create_pool({
                  admin: pubKey.address,
                  yield_vault: CONTRACT_IDS.vault,
                  config: {
                    name: name || "My Pool",
                    contribution_amount: contributionAmount,
                    collateral_ratio_bps: 12500,
                    token: XLM_CONTRACT,
                    max_members: max,
                    round_duration: BigInt(2592000),
                    slash_grace_period: BigInt(1728000),
                    min_reputation: 0,
                    admin_fee_bps: 50,
                    early_points: 3,
                    mid_points: 1,
                    late_penalty: -2,
                  },
                });

                setStatus("Sign via Freighter...");
                const sentTx = await assembled.signAndSend({
                  signTransaction: async (txXdr: string) => {
                    const r = await freighter.signTransaction(txXdr, {
                      networkPassphrase: NETWORK_PASSPHRASE,
                    });
                    if (r.error) throw new Error(r.error);
                    return { signedTxXdr: r.signedTxXdr };
                  },
                });

                const poolId = Number(sentTx.result);
                try {
                  const saved = JSON.parse(localStorage.getItem("artel-pools") || "[]");
                  if (!saved.includes(poolId)) {
                    saved.unshift(poolId);
                    localStorage.setItem("artel-pools", JSON.stringify(saved));
                  }
                } catch {}

                setResult(String(poolId));
                setStatus("Pool created! ✅");
              } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Create failed");
              }
              setDeploying(false);
            }}
            disabled={deploying || !!result}
            className="w-full border-[3px] border-[#0a0a0a] bg-[#f8672d] px-6 py-3 font-display text-lg tracking-tight hover:-translate-y-0.5 disabled:opacity-50 transition-all"
            style={HEADING_FONT}
          >
            {deploying ? "Creating Pool..." : "Create Pool"}
          </button>
        </div>
      </div>
    </div>
  );
}
