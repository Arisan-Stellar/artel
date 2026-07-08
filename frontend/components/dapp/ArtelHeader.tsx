"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "POOLS", href: "/dapp/pools" },
  { label: "SIMULATOR", href: "/dapp/simulator" },
  { label: "LEADERBOARD", href: "/dapp/leaderboard" },
  { label: "YIELD", href: "/dapp/yield" },
  { label: "PROFILE", href: "/dapp/profile" },
  { label: "FAQ", href: "/dapp/faq" },
  { label: "FAUCET", href: "/dapp/faucet" },
];

export default function ArtelHeader({
  walletBtn,
}: {
  walletBtn?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const linkClass = (active: boolean) =>
    `px-3 py-2 text-[11px] font-black border-[2px] transition-colors ${
      active
        ? "bg-[#0a0a0a] text-[var(--color-artel)] border-[#0a0a0a]"
        : "bg-transparent text-[#0a0a0a] border-transparent hover:bg-[#0a0a0a] hover:text-[var(--color-artel)]"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-[999] flex items-center justify-between px-2 py-3 sm:px-4 sm:py-4 backdrop-blur-sm" data-lenis-prevent>
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <img src="/artel-logo.png" alt="ARTEL" className="size-8 sm:size-10 object-contain" />
        <span className="flex flex-col items-start leading-none">
          <span className="text-lg sm:text-2xl font-black text-[#0a0a0a]" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", letterSpacing: "0.02em" }}>
            ARTEL
          </span>
          <span className="text-[6px] sm:text-[8px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[var(--color-artel)]">
            ROSCA PROTOCOL
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-1 lg:flex">
        {NAV.map((item) => (
          <Link className={linkClass(isActive(item.href))} href={item.href} key={item.href}
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", letterSpacing: "0.08em" }}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        {walletBtn}
        <button
          aria-label="Toggle navigation"
          className="grid size-9 sm:size-11 place-items-center border-[2px] sm:border-[3px] border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[3px_3px_0_#0a0a0a] sm:shadow-[4px_4px_0_#0a0a0a] transition hover:bg-[var(--color-artel)] lg:hidden touch-manipulation"
          onClick={() => setMenuOpen((v) => !v)}
          type="button"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="absolute inset-x-4 top-full mt-2 border-[4px] border-[#0a0a0a] bg-[#f5f7fa] p-3 shadow-[8px_8px_0_#0a0a0a]">
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link className={linkClass(isActive(item.href)).replace("px-3 py-2 text-[11px]", "px-4 py-3 text-sm")}
                href={item.href} key={item.href} onClick={() => setMenuOpen(false)}
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", letterSpacing: "0.06em" }}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export const CARD_CLASS = "relative border-[3px] border-[#0a0a0a] bg-[#fdfdfa] shadow-[12px_12px_0_#0a0a0a] overflow-hidden";
export const BTN_PRIMARY = "border-[3px] border-[#0a0a0a] bg-[var(--color-sui)] py-3 font-black text-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 touch-manipulation";
export const BTN_ORANGE = "border-[3px] border-[#0a0a0a] bg-[#f8672d] py-3 font-black text-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 touch-manipulation";
export const BTN_SUCCESS = "border-[3px] border-[#0a0a0a] bg-[#14b8a6] py-3 font-black text-[#0a0a0a] shadow-[5px_5px_0_#0a0a0a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 touch-manipulation";
export const LABEL_MONO: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
export const HEADING_FONT: React.CSSProperties = { fontFamily: "'Bebas Neue', system-ui, sans-serif" };

export function BarcodeStrip({ className = "" }: { className?: string }) {
  return <div className={className || "w-10 h-3"} style={{ background: "repeating-linear-gradient(to right, #0a0a0a 0, #0a0a0a 2px, transparent 2px, transparent 4px)" }} />;
}
