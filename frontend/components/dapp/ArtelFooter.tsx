import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function ArtelFooter() {
  return (
    <footer className="border-t-[4px] border-[#0a0a0a] bg-[var(--color-artel)] text-[#0a0a0a] mt-20">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="grid gap-8 md:grid-cols-3 text-sm">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-3 hover:opacity-80 transition">
              <Image src="/artel-logo.png" alt="ARTEL" width={64} height={64} className="size-16 object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-3xl font-black" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>ARTEL</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">ROSCA Protocol</span>
              </div>
            </Link>
            <p className="text-sm leading-6 text-[#333] max-w-xs">
              A trustless ROSCA protocol on Stellar Soroban. 125% collateral, triple yield, gacha jackpot. No treasurer needed.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a0a0a] mb-3">Product</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Pools", href: "/dapp/pools" },
                { label: "Simulator", href: "/dapp/simulator" },
                { label: "Leaderboard", href: "/dapp/leaderboard" },
                { label: "Yield", href: "/dapp/yield" },
                { label: "Profile", href: "/dapp/profile" },
                { label: "FAQ", href: "/dapp/faq" },
                { label: "Faucet", href: "/dapp/faucet" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="text-[#333] hover:text-black transition text-sm font-semibold">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a0a0a] mb-3">Ecosystem</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Stellar", href: "https://stellar.org" },
                { label: "Soroban", href: "https://soroban.stellar.org" },
                { label: "Stellar Expert", href: "https://stellar.expert/explorer/testnet" },
                { label: "GitHub", href: "#" },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#333] hover:text-black transition text-sm font-semibold">
                  {label} <ArrowUpRight className="size-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t border-[rgba(0,0,0,0.2)] flex flex-col gap-2 md:flex-row md:justify-between text-xs text-[#333]">
          <span>© 2026 ARTEL. ROSCA Protocol on Stellar.</span>
          <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-black transition">
            APAC Stellar Hackathon 2026 <ArrowUpRight className="size-2.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
