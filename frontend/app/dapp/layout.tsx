"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ArtelFooter from "@/components/dapp/ArtelFooter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletProvider, useWallet } from "@/hooks/WalletContext";

const NAV = [
  { label: "POOLS", href: "/dapp/pools" },
  { label: "SIMULATOR", href: "/dapp/simulator" },
  { label: "LEADERBOARD", href: "/dapp/leaderboard" },
  { label: "PROFILE", href: "/dapp/profile" },
  { label: "FAQ", href: "/dapp/faq" },
  { label: "FAUCET", href: "/dapp/faucet" },
];

function HeaderInner() {
  const { address, walletType, connecting, connect, disconnect } = useWallet();
  const walletLabel = walletType === "freighter" ? "Freighter" : walletType === "albedo" ? "Albedo" : walletType === "xbull" ? "xBull" : walletType === "lobstr" ? "Lobstr" : "Wallet";
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-[999] flex items-center justify-between px-2 py-3 sm:px-4 sm:py-4 bg-[var(--color-artel)]/90 backdrop-blur-sm">
      <Link href="/dapp/pools" className="group flex items-center gap-1.5 sm:gap-2.5 shrink-0 px-2 py-1 -mx-1 hover:bg-[var(--color-crack)] transition">
        <img src="/artel-logo.png" alt="ARTEL" className="size-8 sm:size-10 object-contain" />
        <span className="flex flex-col items-start leading-none">
          <span className="text-lg sm:text-2xl font-black text-[#0a0a0a] tracking-[0.02em] group-hover:text-white transition" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>ARTEL</span>
          <span className="text-[6px] sm:text-[8px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] group-hover:text-white transition">ROSCA PROTOCOL</span>
        </span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}
            className={`px-3 py-2 text-xs sm:text-sm font-black border-[2px] transition tracking-[0.06em] ${
              isActive(item.href) ? "bg-[var(--color-crack)] text-white border-[var(--color-crack)]" : "bg-transparent text-[#0a0a0a] border-transparent hover:bg-[var(--color-crack)] hover:text-white"
            }`}
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >{item.label}</Link>
        ))}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {address ? (
          <button
            type="button"
            onClick={disconnect}
            className="fancy disconnect"
          >
            <span className="top-key" />
            <span className="text">{walletLabel} · DISCONNECT</span>
            <span className="bottom-key-1" />
            <span className="bottom-key-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => connect()}
            disabled={connecting}
            className="fancy"
          >
            <span className="top-key" />
            <span className="text">{connecting ? "..." : "CONNECT"}</span>
            <span className="bottom-key-1" />
            <span className="bottom-key-2" />
          </button>
        )}
      </div>
    </header>
  );
}

function DappInner({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-grid-brutal flex flex-col">
        <HeaderInner />
        <div className="pt-16 flex-1">{children}</div>
        <ArtelFooter />
      </main>
    </QueryClientProvider>
  );
}

export default function DappLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <DappInner>{children}</DappInner>
    </WalletProvider>
  );
}
