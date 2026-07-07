"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, DollarSign, Zap } from "lucide-react";
import { useWallet, getWalletLabel } from "@/hooks/WalletContext";

export default function WalletCard() {
  const { address, walletType } = useWallet();
  const walletName = getWalletLabel(walletType);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState("—");

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    const fetchBalance = async () => {
      try {
        const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
        if (!res.ok) { if (!cancelled) setTimeout(fetchBalance, 3000); return; }
        const data = await res.json();
        const xlm = data.balances?.find((b: { asset_type: string; balance: string }) => b.asset_type === "native");
        if (xlm && !cancelled) setBalance(Number(xlm.balance).toLocaleString(undefined, { maximumFractionDigits: 0 }));
      } catch {}
    };
    fetchBalance();
    return () => { cancelled = true; };
  }, [address]);

  if (!address) return null;

  const copyAddr = () => {
    navigator.clipboard.writeText(address);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="card-pattern-grid" />
      <div className="card-overlay-dots" />
      <div className="bold-pattern">
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="6" rx="8" />
          <circle cx="28" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="72" cy="40" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="40" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="4" />
          <rect x="60" y="55" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" rx="3" />
        </svg>
      </div>

      <div className="card-title-area">
        <span>CONNECTED WALLET</span>
        <div className="card-tag">{walletName || "Wallet"}</div>
      </div>

      <div className="card-body">
        <p className="card-description">{address}</p>

        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon"><DollarSign className="size-3.5" /></div>
            <span className="feature-text">{balance} <span className="text-xs opacity-60">XLM</span></span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Zap className="size-3.5" /></div>
            <span className="feature-text">~0.00001 <span className="text-xs opacity-60">XLM/tx</span></span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </div>
            <button onClick={copyAddr} className="feature-text hover:underline text-left">
              {copied ? "Copied!" : "Copy address"}
            </button>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><ExternalLink className="size-3.5" /></div>
            <a href={`https://stellar.expert/explorer/testnet/account/${address}`} target="_blank" rel="noopener noreferrer" className="feature-text hover:underline">View on Explorer</a>
          </div>
        </div>

        <div className="card-actions">
          <div className="price">
            {balance} <span className="price-currency">XLM</span>
            <span className="price-period">TESTNET</span>
          </div>
        </div>
      </div>

      <div className="dots-pattern">
        <svg viewBox="0 0 200 100" style={{ width: "100%", height: "100%" }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={i * 7} cy={Math.sin(i) * 30 + 50} r="1" fill="currentColor" opacity="0.5" />
          ))}
        </svg>
      </div>
      <div className="accent-shape" />
      <div className="stamp">
        <div className="stamp-inner">
          <span className="stamp-text">STELLAR</span>
        </div>
      </div>
      <div className="corner-slice" />
    </div>
  );
}
