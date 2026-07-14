"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import ArtelFooter from "@/components/dapp/ArtelFooter";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { WalletProvider, useWallet } from "@/hooks/WalletContext";
import { Menu, X, Globe } from "lucide-react";
import { LocaleProvider, useLocale } from "@/lib/i18n/LocaleProvider";

const NAV_KEYS = ["pools", "simulator", "leaderboard", "yield_", "profile", "faq", "faucet"] as const;
const NAV_HREFS: Record<string, string> = {
  pools: "/dapp/pools",
  simulator: "/dapp/simulator",
  leaderboard: "/dapp/leaderboard",
  yield_: "/dapp/yield",
  profile: "/dapp/profile",
  faq: "/dapp/faq",
  faucet: "/dapp/faucet",
};

function HeaderInner() {
  const { address, walletType, connecting, connect, disconnect } = useWallet();
  const { locale, toggle: toggleLocale } = useLocale();
  const walletLabel = walletType === "freighter" ? "Freighter" : walletType === "albedo" ? "Albedo" : walletType === "xbull" ? "xBull" : walletType === "lobstr" ? "Lobstr" : "Wallet";
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const [menuOpen, setMenuOpen] = useState(false);

  const t = useLocale(); // we need dict via locale context in HeaderInner

  return (
    <header className="fixed inset-x-0 top-0 z-[999] flex items-center justify-between px-2 py-3 sm:px-4 sm:py-4 bg-[var(--color-artel)]/90 backdrop-blur-sm">
      <Link href="/dapp/pools" className="group flex items-center gap-1.5 sm:gap-2.5 shrink-0 px-2 py-1 -mx-1 hover:bg-[var(--color-crack)] transition">
        <Image src="/artel-logo.png" alt="ARTEL" width={40} height={40} className="size-8 sm:size-10 object-contain" />
        <span className="flex flex-col items-start leading-none">
          <span className="text-lg sm:text-2xl font-black text-[#0a0a0a] tracking-[0.02em] group-hover:text-white transition" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>ARTEL</span>
          <span className="text-[6px] sm:text-[8px] font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] group-hover:text-white transition">{t.dict.dapp.shared.roscoProtocol}</span>
        </span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        {NAV_KEYS.map((key) => {
          const href = NAV_HREFS[key];
          const label = t.dict.dapp.nav[key];
          return (
            <Link key={href} href={href}
              className={`px-3 py-2 text-xs sm:text-sm font-black border-[2px] transition tracking-[0.06em] ${
                isActive(href) ? "bg-[var(--color-crack)] text-white border-[var(--color-crack)]" : "bg-transparent text-[#0a0a0a] border-transparent hover:bg-[var(--color-crack)] hover:text-white"
              }`}
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >{label}</Link>
          );
        })}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={toggleLocale}
          className="hidden sm:flex items-center gap-1 border-[2px] border-[#0a0a0a] bg-white px-2 py-2 text-[10px] font-black uppercase shadow-[2px_2px_0_#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition"
          aria-label="Toggle language"
        >
          <Globe className="size-3.5" />
          {locale === "en" ? "ID" : "EN"}
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden border-[2px] border-[#0a0a0a] bg-white p-2 shadow-[3px_3px_0_#0a0a0a]"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        {address ? (
          <button
            type="button"
            onClick={disconnect}
            className="fancy disconnect"
          >
            <span className="top-key" />
            <span className="text">{walletLabel} · {t.dict.dapp.shared.disconnect}</span>
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
            <span className="text">{connecting ? t.dict.dapp.shared.connecting : t.dict.dapp.shared.connect}</span>
            <span className="bottom-key-1" />
            <span className="bottom-key-2" />
          </button>
        )}
      </div>
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-full left-0 right-0 border-b-[3px] border-[#0a0a0a] bg-[var(--color-artel)] p-4 shadow-[0_6px_0_#0a0a0a] lg:hidden z-50">
          <div className="flex flex-col gap-1">
            {NAV_KEYS.map((key) => {
              const href = NAV_HREFS[key];
              const label = t.dict.dapp.nav[key];
              return (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-black border-[2px] transition tracking-[0.06em] ${
                    isActive(href) ? "bg-[var(--color-crack)] text-white border-[var(--color-crack)]" : "bg-white text-[#0a0a0a] border-[#0a0a0a] hover:bg-[var(--color-crack)] hover:text-white"
                  }`}
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >{label}</Link>
              );
            })}
            <button
              type="button"
              onClick={() => { toggleLocale(); setMenuOpen(false); }}
              className="mt-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-black border-[2px] border-[#0a0a0a] bg-[var(--color-sui)] text-[#0a0a0a] transition tracking-[0.06em]"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              <Globe className="size-4" />
              {locale === "en" ? "BAHASA INDONESIA" : "ENGLISH"}
            </button>
          </div>
          </div>
          </>
      )}
    </header>
  );
}

function DappInner({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <main className="min-h-screen bg-grid-brutal flex flex-col">
          <HeaderInner />
          <div className="pt-16 flex-1">{children}</div>
          <ArtelFooter />
        </main>
      </LocaleProvider>
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
