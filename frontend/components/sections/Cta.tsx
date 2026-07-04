"use client";

import { useState } from "react";
import { Copy, Check, ShieldCheck, Code, Key, ExternalLink } from "lucide-react";
import { useDict } from "@/lib/i18n/LocaleProvider";
import { useBoldReveal } from "@/components/motion/useBoldReveal";
import { useMagnetic } from "@/components/motion/useMagnetic";
import { Button } from "@/components/ui/Button";
import { GhostWord } from "@/components/ui/GhostWord";
import { DAPP_URL } from "@/components/ui/MiniNav";

const EXPLORER_URL = "https://stellar.expert/explorer/testnet";

const CONTRACTS = [
  { label: "arisan-contract", nameKey: "contractArisan" as const, addr: "CD5JN4BZGND2ZDWFWTE4LQTXQNWLGFF4ZSKLBGRLF6CPVVNWVGH6PH5" },
  { label: "yield-vault", nameKey: "contractVault" as const, addr: "CCIUGLBEGQJGRTJYIVMTRKIHYRXULKWGXQVKAS5ARLR6QRYMQSDGOAH" },
  { label: "artel-factory", nameKey: "contractFactory" as const, addr: "CCDM7ZNAWTR4JQNXYTEVHB3LWKENQSORS3BEWEQSEKLMG3NHDYBBABE" },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, key: "trustLabel" as const },
  { icon: Code, key: "trustLabel2" as const },
  { icon: Key, key: "trustLabel3" as const },
];

export function Cta() {
  const dict = useDict();
  const ref = useBoldReveal<HTMLElement>();
  const magnet = useMagnetic<HTMLSpanElement>(0.5);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 2000);
  };

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <section ref={ref} id="cta" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-24 sm:px-8">
      <GhostWord text="BUILD" stroke="rgba(12,140,233,0.12)" className="left-1/2 top-[6%] -translate-x-1/2 text-[24vw]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <h2 data-split className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl">
          {dict.cta.title}
        </h2>

        <p data-reveal className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[var(--color-muted)]">
          {dict.cta.subtitle}
        </p>

        {/* Trust badges */}
        <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {TRUST_BADGES.map(({ icon: Icon, key }) => (
            <span key={key} className="inline-flex items-center gap-1.5 border-[2px] border-[var(--color-teal)] bg-[var(--color-teal)] bg-opacity-10 px-4 py-2 text-sm font-bold text-[var(--color-teal)]">
              <Icon className="size-4" />
              {dict.cta[key]}
            </span>
          ))}
        </div>

        {/* Primary CTA */}
        <span ref={magnet} data-reveal className="mt-10 inline-block">
          <Button href={DAPP_URL} rel="noopener noreferrer" className="px-10 py-5 text-lg">
            {dict.cta.button}
          </Button>
        </span>

        {/* Contract Addresses */}
        <div data-reveal className="mt-14 w-full max-w-2xl">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-muted)] mb-3">{dict.cta.contractLabel}</h3>
          <div className="grid gap-2">
            {CONTRACTS.map(({ label, nameKey, addr }) => (
              <div key={label} className="flex items-center justify-between gap-3 border-[2px] border-[var(--color-text)] bg-[var(--color-surface)] px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-muted)] shrink-0">{dict.cta[nameKey]}</span>
                  <span className="font-mono text-xs text-[var(--color-text)] truncate">{short(addr)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleCopy(addr)} className="grid size-7 place-items-center border-[2px] border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-surface)] hover:bg-[var(--color-artel)] hover:text-[var(--color-text)] transition">
                    {copied === addr ? <Check className="size-3" /> : <Copy className="size-3" />}
                  </button>
                  <a href={`${EXPLORER_URL}/contract/${addr}`} target="_blank" rel="noopener noreferrer" className="grid size-7 place-items-center border-[2px] border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-artel)] transition">
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary CTAs */}
        <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={`${EXPLORER_URL}/contract/${CONTRACTS[0].addr}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-[3px] border-[var(--color-text)] px-5 py-3 text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-surface)] transition">
            {dict.cta.secondaryButton} <ExternalLink className="size-3.5" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-[3px] border-[var(--color-text)] bg-[var(--color-text)] px-5 py-3 text-sm font-bold text-[var(--color-surface)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] transition">
            {dict.cta.githubButton} <Code className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
