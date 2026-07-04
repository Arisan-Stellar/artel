"use client";

import { useState } from "react";
import AnimatedBadge from "@/components/dapp/AnimatedBadge";
import { HelpCircle } from "lucide-react";
import { HEADING_FONT, LABEL_MONO } from "@/components/dapp/ArtelHeader";

const FAQS = [
  {
    q: "What is ARTEL?",
    a: "ARTEL is a trustless ROSCA (arisan) protocol built on Stellar. Members contribute a fixed amount each cycle, and one winner receives the full pool each round. All rules are enforced by a Soroban smart contract — no treasurer needed, no trust required.",
  },
  {
    q: "How do I get started?",
    a: "1. Install a Stellar wallet (Freighter, Albedo, xBull, or Lobstr). 2. Go to our Faucet to claim 10,000 testnet XLM (1-click, instant). 3. Browse pools and join one with the required collateral (125% of your commitment). 4. Contribute monthly and earn triple yield.",
  },
  {
    q: "What is the collateral? Why 125%?",
    a: "Collateral is a security deposit each member locks upfront, equal to 125% × deposit × (members - 1). The math is simple: if someone wins and runs, they lose more in collateral than they took — making fleeing financially irrational. At 100% it's break-even; at 125% it's a guaranteed loss.",
  },
  {
    q: "How does the triple yield work?",
    a: "Lapis 1 (Collateral Yield): All collateral is staked on Stellar DEX. Yield is split 10% ops / 50% equally to members / 40% to annual vault. Distributed monthly. Lapis 2 (Pool Yield): Monthly contributions earn yield while pooled. At the end of the arisan, this is distributed via weighted gacha (your tickets = your chance). Lapis 3 (Annual Vault): The 40% saved across all pools is pooled into a yearly jackpot, distributed June 30 via verifiable random draw.",
  },
  {
    q: "How do points and tickets work?",
    a: "Pay within days 1-10: +3 points (3 tickets). Days 10-20: +1 point (1 ticket). After day 20: auto-slash -2 points (0 tickets). Streak bonus: 5+ consecutive early payments = 1.5× multiplier, 10+ = 2.0×. Points and tickets determine your gacha jackpot odds.",
  },
  {
    q: "How are winners selected?",
    a: "Using verifiable on-chain randomness from Stellar block entropy. A weighted random draw selects one active member who contributed this cycle. The winner receives the full pool (members × deposit). Selection happens on the 25th of each cycle.",
  },
  {
    q: "What tokens does ARTEL support?",
    a: "Currently native XLM on Stellar Testnet for instant settlement with no trustline required. On mainnet, ARTEL will support any SEP-41 token including USDC — ideal for stable savings. The same smart contract works with any Stellar asset; just change one config parameter.",
  },
  {
    q: "Can I withdraw from a pool early?",
    a: "Before the pool starts (Open state), yes — you can exit and get your full collateral back. Once the pool is active, you must complete all cycles. This protects other members from incomplete pools.",
  },
  {
    q: "What happens if someone doesn't pay?",
    a: "On day 21, the smart contract automatically slashes the defaulter's collateral to cover their contribution. If collateral runs out, the member is removed from the pool and loses their stake. All other members are protected.",
  },
  {
    q: "Is my money safe?",
    a: "Yes. All funds are locked in Soroban smart contracts on Stellar. Admin cannot withdraw your collateral or contributions. The contract code is open source and auditable. An emergency pause function exists for extreme scenarios.",
  },
  {
    q: "How much does gas cost?",
    a: "~0.00001 XLM per transaction (approximately $0.000001). Stellar has some of the lowest transaction fees in Web3. ARTEL uses Fee Bump transactions so the backend can sponsor gas for users — you don't need XLM, just your asset token.",
  },
  {
    q: "What wallets are supported?",
    a: "Freighter (browser extension), Albedo (web wallet), xBull (extension + mobile), and Lobstr (mobile + web). More wallet integrations coming via WalletConnect.",
  },
  {
    q: "How do I claim testnet XLM?",
    a: "Go to the Faucet page, connect your wallet, and click 'Claim 10,000 XLM'. XLM is sent instantly via Stellar Friendbot — no trustline, no gas fee, 1 click. Limited to once per 24 hours.",
  },
  {
    q: "How do I create a pool?",
    a: "Connect your wallet, go to Pools, and click '+ Create Pool'. Set your monthly deposit, max members, and cycle duration. The 3-step wizard will show you the collateral calculation before deploying.",
  },
  {
    q: "What is the Gacha Jackpot?",
    a: "The annual gacha distributes 40% of all collateral yield across every ARTEL pool on June 30. Your tickets (earned from on-time payments and streaks) determine your chance to win the Grand Prize (50%), Runner-Up (30%), or Consolation (20%). Pool yield gacha also runs at the end of each individual arisan.",
  },
  {
    q: "Where can I learn more?",
    a: "Read our documentation, try the Simulator, join our community on Discord and Telegram, or explore the contract on Stellar Expert. Links are in the footer below.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <section className="relative isolate overflow-hidden px-5 pb-6 pt-24 md:px-10 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.28),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.18),transparent_26%)]" />
        <div className="mx-auto max-w-6xl">
          <AnimatedBadge icon={<HelpCircle className="size-4" />} text=">FAQ" />
          <div className="mt-6 flex flex-col lg:flex-row lg:items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-[0.95] tracking-[-0.06em] shrink-0 mt-2" style={{ ...HEADING_FONT, WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f0ead2" }}>
              Got<br />
              <span style={{ WebkitTextStroke: "1px #0a0a0a", WebkitTextFillColor: "#f59e0b" }}>Questions?</span>
            </h1>
            <div className="flex items-start gap-3 max-w-lg">
              <div className="w-1.5 h-24 bg-[var(--color-artel)] shrink-0 mt-1.5" />
              <p className="text-lg font-semibold leading-7 text-[#333333]">
                Everything you need to know about ARTEL. From wallet setup and pool mechanics to collateral math, triple yield, point scoring, and annual gacha distributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:px-10 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mt-12 grid gap-4">
            {FAQS.map(({ q, a }, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={index} className="border-[3px] border-[#0a0a0a] bg-grid-brutal shadow-[10px_10px_0_#0a0a0a]">
                  <button
                    className="flex min-h-[72px] w-full items-center justify-between gap-4 px-5 py-4 text-left transition bg-[#5eead4] hover:bg-[#2dd4bf]"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    type="button"
                  >
                    <span className="flex items-center gap-4">
                      <span className="border-[3px] border-[#7c3aed] bg-[#a78bfa] px-3 py-1 text-xs font-black text-white rounded-full" style={LABEL_MONO}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-lg font-black tracking-[-0.02em] text-[#0a0a0a]" style={HEADING_FONT}>{q}</span>
                    </span>
                    <span className="text-2xl font-black text-[#0a0a0a]" style={LABEL_MONO}>{isOpen ? "-" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t-[3px] border-[#0a0a0a] bg-[#fbcfe8] px-5 py-5">
                      <p className="max-w-4xl text-base font-semibold leading-8 text-[#0a0a0a]">{a}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-12 brutal-subscribe__container cooldown group">
            <div className="brutal-subscribe__header">
              <span className="brutal-subscribe__title" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>community</span>
              <span className="brutal-subscribe__subtitle">Still have questions?</span>
            </div>
            <div className="brutal-subscribe__form">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="font-semibold leading-7 text-white/80">Join the ARTEL community on Telegram and Discord. Get help, share feedback, and connect with other ROSCA builders.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a className="border-[3px] border-white bg-[#26A5E4] px-5 py-3 text-sm font-black text-white shadow-[6px_6px_0_#1a8ac7] transition hover:brightness-110"
                    href="https://t.me/artel_protocol" rel="noopener noreferrer" target="_blank" style={LABEL_MONO}>Telegram</a>
                  <a className="border-[3px] border-white bg-[#5865F2] px-5 py-3 text-sm font-black text-white shadow-[6px_6px_0_#4752c4] transition hover:brightness-110"
                    href="https://discord.gg/stellar" rel="noopener noreferrer" target="_blank" style={LABEL_MONO}>Discord</a>
                </div>
              </div>
            </div>
            <div className="brutal-subscribe__decor">💬</div>
          </div>
        </div>
      </section>
    </div>
  );
}
