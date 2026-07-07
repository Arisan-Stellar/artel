"use client";

import { useState, useEffect } from "react";
import { Droplets, Check, Clock } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";
import { useWallet } from "@/hooks/WalletContext";
import WalletCard from "@/components/dapp/WalletCard";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";

const COOLDOWN_HOURS = 24;

export default function FaucetPage() {
  const { address } = useWallet();
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState("");

  useEffect(() => {
    const last = localStorage.getItem("artel-faucet-last");
    if (last) {
      const tick = () => {
        const remaining = COOLDOWN_HOURS * 3600000 - (Date.now() - Number(last));
        if (remaining <= 0) { setCooldown(false); return false; }
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        setCooldownRemaining(`${h}h ${m}m ${s}s`);
        setCooldown(true);
        return true;
      };
      if (tick()) {
        const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, []);

  const handleClaimXLM = async () => {
    if (!address || cooldown) return;
    setError(null);
    try {
      const res = await fetch("/api/faucet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.success) {
        setClaimed(true);
        localStorage.setItem("artel-faucet-last", String(Date.now()));
        setCooldown(true);
        setCooldownRemaining("24h 0m 0s");
      } else {
        setError(data.error || "Claim failed");
      }
    } catch (e: any) { setError(e.message); }
  };

  return (
    <div className="px-5 pb-20 pt-24 md:px-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <AnimatedBadge icon={<Droplets className="size-4" />} text=">FAUCET" />
        <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
          <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
            Claim Your<br />
            <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>Starter XLM</span>
          </h1>
          <div className="flex items-start gap-3 max-w-lg">
            <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
            <p className="text-lg font-semibold leading-7 text-[#333333]">
              Zero friction. One click. Instant delivery. No trustline required. Just connect and claim 10,000 XLM via Stellar Friendbot. Use XLM to join pools, pay contributions, and earn yield.
            </p>
          </div>
        </div>

        <div className="mt-12" />
        <WalletCard />

        {!address ? (
          <div className="mt-8 border-[3px] border-[#0a0a0a] bg-[var(--color-artel)] bg-opacity-10 p-6 text-center shadow-[6px_6px_0_#0a0a0a]">
            <p className="text-lg font-black" style={HEADING_FONT}>Connect your wallet</p>
            <p className="text-sm text-[#333333] mt-2">Hover <strong>CONNECT</strong> in the top-right → pick your wallet.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {claimed ? (
              <div className="brutal-subscribe__container group">
                <div className="brutal-subscribe__header">
                  <span className="brutal-subscribe__title" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>Claimed!</span>
                  <span className="brutal-subscribe__subtitle">10,000 XLM sent to your wallet</span>
                </div>
                <div className="brutal-subscribe__form text-center">
                  <Check className="size-12 mx-auto text-[var(--color-teal)] mb-2" />
                  <p className="text-xl font-black" style={HEADING_FONT}>Check your wallet</p>
                  <p className="text-sm font-semibold text-[#333333] mt-1">XLM should appear within seconds.</p>
                </div>
                <div className="brutal-subscribe__decor">✓</div>
              </div>
            ) : cooldown ? (
              <div className="brutal-subscribe__container cooldown group">
                <div className="brutal-subscribe__header">
                  <span className="brutal-subscribe__title" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>Cooldown</span>
                  <span className="brutal-subscribe__subtitle">Wait before claiming again</span>
                </div>
                <div className="brutal-subscribe__form text-center">
                  <Clock className="size-12 mx-auto text-[var(--color-artel)] mb-2" />
                  <p className="text-4xl font-black" style={HEADING_FONT}>{cooldownRemaining}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">Limited to 1 claim per 24 hours</p>
                </div>
                <div className="brutal-subscribe__decor">⏳</div>
              </div>
            ) : (
              <div className="brutal-subscribe__container group">
                <div className="brutal-subscribe__header">
                  <span className="brutal-subscribe__title" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>FREE XLM</span>
                  <span className="brutal-subscribe__subtitle">No trustline · Instant delivery</span>
                </div>
                <div className="brutal-subscribe__form">
                  <button onClick={handleClaimXLM} className="brutal-subscribe__button" style={{ width: "100%", fontSize: "20px", fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    Claim 10,000 XLM
                  </button>
                </div>
                <div className="brutal-subscribe__decor">⚡</div>
              </div>
            )}
            {error && <div className="border-[3px] border-[#0a0a0a] bg-[var(--color-crack)] px-4 py-2 text-xs font-bold text-white">❌ {error}</div>}
            <div className="info-card mt-6">
              <div className="info-head">How it works</div>
              <div className="info-content">
                <p>XLM sent via Stellar Friendbot — no trustline needed. 10,000 XLM per claim. Use XLM as collateral and contributions in ARTEL pools.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
