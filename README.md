
<p align="center">
  <img src="frontend/public/artel-logo.png" alt="ARTEL" width="180" />
</p>

<p align="center">
  <strong>The ROSCA Protocol on Stellar</strong><br/>
  Trustless, collateralized, triple-yield rotating savings — on-chain.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/network-Stellar%20Testnet-7B61FF?style=flat-square&logo=stellar" alt="Stellar Testnet" />
  <img src="https://img.shields.io/badge/soroban--sdk-22.0.0-00C4B4?style=flat-square" alt="Soroban SDK" />
  <img src="https://img.shields.io/badge/next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/react-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/contracts-4-FFD700?style=flat-square" alt="Contracts" />
  <img src="https://img.shields.io/badge/tests-22%2F22%20passing-22C55E?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

---

## What is ARTEL?

**ARTEL** is a trustless ROSCA (Rotating Savings and Credit Association) protocol built on Stellar — known across Asia as *Arisan* (Indonesia), *Chit Fund* (India), *Kye* (Korea), *Tanda* (Mexico), and dozens more. Over **100 million people** in APAC participate in these informal savings circles.

ARTEL takes this centuries-old mechanism on-chain: smart contracts replace the intermediary, **≥125% collateral** guarantees commitment, and **three layers of yield** turn idle pooled capital into productive assets.

> **ROSCA is DeFi before DeFi had a name. ARTEL is ROSCA after Stellar gave it superpowers.**

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│   │   Pools  │  │ Simulator│  │Leaderboard│  │  Gacha / FAQ  │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│        │              │              │                │          │
│   ┌────┴──────────────┴──────────────┴────────────────┴──────┐  │
│   │        4-Wallet Connector (Freighter · Albedo ·          │  │
│   │               xBull · Lobstr)                            │  │
│   └──────────────────────┬───────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                   SOROBAN SMART CONTRACTS                        │
│                                                                  │
│  ┌─────────────────────┐   ┌───────────────────────────────┐    │
│  │   arisan-contract   │   │       yield-vault              │    │
│  │   Core ROSCA pool   │   │   40% collateral yield vault   │    │
│  │   17 functions · 922 │   │   7 functions · 222 lines      │    │
│  └──────────┬──────────┘   └──────────────┬────────────────┘    │
│             │                              │                      │
│  ┌──────────┴──────────────────────────────┴─────────────────┐  │
│  │  artel-factory (pool registry)  ·  artel-faucet (testnet) │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Stellar DEX       │  │  Blend   │  │  On/Off-Ramp Anchors │  │
│  │  Collateral staking│  │  Lending │  │  IDR · PHP · VND     │  │
│  └───────────────────┘  └──────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The Problem

Traditional ROSCA / arisan suffers from four structural flaws:

| # | Pain Point | Impact |
|---|-----------|--------|
| 🏃 | **Trust breach** | Organizer flees with the pot — no recourse |
| 💤 | **Idle money** | Pooled capital sits dead between disbursement cycles |
| 📋 | **Manual records** | Paper ledgers, WhatsApp spreadsheets, error-prone |
| 🔒 | **Geographic lock** | Only works within a single neighborhood or office |

---

## 💡 The Solution — 3-Layer Protection + Yield

<table>
<tr>
<td width="50%">

### 🔐 Layer 1 — Collateral ≥125%
Every member deposits **≥125%** of the total pool value as collateral before joining. If someone defaults, the smart contract slashes their collateral automatically. *Fleeing* costs more than *staying*.

**Example:** Contribute 100 XLM/month × 10 members → deposit **1,125 XLM** upfront. Defaulting loses all of it. The math makes defection irrational.

</td>
<td width="50%">

### 🧹 Layer 2 — Automated Dues
Smart contracts handle everything: contribution collection, collateral staking, winner selection, yield distribution. No WhatsApp spreadsheets. No "admin left the group."

Every action is verifiable on-chain, from contributions to disbursements.

</td>
</tr>
<tr>
<td width="50%">

### 💰 Layer 3 — Triple Yield
Idle pooled capital earns yield across three channels:

```
    Collateral → Staked on Stellar DEX → real-time yield
                  │
                  ├─ 50% → distributed equally among members
                  ├─ 40% → pooled into Yield Vault (annual gacha)
                  └─ 10% → protocol operations
```

</td>
<td width="50%">

### 🎰 Annual Gacha Jackpot (30 June)
The **40% yield accumulation** across all pools is distributed once a year via ticket-weighted gacha. Earn tickets by paying early:

| Time Window | Points |
|-------------|:------:|
| Day 1–10 (Early) | **+3** |
| Day 10–20 (Mid) | **+1** |
| Day 21+ (Late) | **−2** (collateral slashed) |

3 prize tiers — no one walks away empty-handed.

</td>
</tr>
</table>

---

## 🗺 State Machine — Monthly Cycle

```
                 ╔════════════════════════════════════════════╗
                 ║            MONTHLY ROUND                   ║
                 ║                                            ║
  Day 1–10       ║  EARLY PAY    +3 points    ★★★            ║
  Day 10–20      ║  MID PAY      +1 point     ★☆☆            ║
  Day 21         ║  SLASH        collateral seized   −2 pts  ║
                 ║                                            ║
  Day 25         ║  WINNER SELECTED   ← random on-chain       ║
  Day 30         ║  YIELD DISTRIBUTED ← 50/40/10 split        ║
                 ║                                            ║
                 ╚══════════════════╦═════════════════════════╝
                                    ║
                 ╔══════════════════╩═════════════════════════╗
                 ║         END OF POOL                        ║
                 ║  → Cumulative yield → Gacha draw           ║
                 ║  → All collateral returned to members      ║
                 ╚════════════════════════════════════════════╝
```

---

## 📍 Deployed Contracts (Stellar Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| **arisan-contract** | `CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5` | Core ROSCA pool lifecycle |
| **yield-vault** | `CCIUQJ3JZJTCJSJQDOW4QLRVT44TL3Y6WIUBW77AWL56AQEYBMOANOAH` | Annual gacha vault |
| **artel-factory** | `CCDM7FMETTVS5NO2UOLFNBOYZJTNZLG6QOVONEGJD4YYTVKURAIU6ABE` | Pool registry |
| **artel-faucet** | `CBOLEQIEDW5M4VWDPWLX6M3WGLRSNXBSLBZZ7KJWHT3RUU3XEGX5AYVX` | Testnet XLM faucet |

> **Network:** Stellar Testnet · **RPC:** `https://soroban-testnet.stellar.org` · **Passphrase:** `Test SDF Network ; September 2015`

---

## 🚀 Quick Start

### Prerequisites
- Node.js `≥18`
- Rust `≥1.75` + `wasm32-unknown-unknown` target
- Stellar CLI `≥22.0.0`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set your RPC endpoints
npm run dev                   # http://localhost:3000
```

### Contracts

```bash
cd contracts
make build                    # or: cargo build --release --target wasm32-unknown-unknown
make test                     # cargo test
```

### Deployment

```bash
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/arisan_contract.wasm \
  --source SOURCE_ACCOUNT \
  --network testnet
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Stellar · Soroban |
| **Smart Contracts** | Rust · soroban-sdk `22.0.0` · `wasm32v1-none` |
| **Frontend** | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 |
| **State** | Zustand · TanStack React Query |
| **Animation** | GSAP · Lenis (smooth scroll) · SplitType |
| **Wallet** | Freighter · Albedo · xBull · Lobstr |
| **Testing** | Vitest (14 frontend) · `cargo test` (8 contracts) |
| **i18n** | English + Bahasa Indonesia |

---

## 🗂 Project Structure

```
.
├── contracts/
│   ├── arisan-contract/    # Core ROSCA pool (922 lines)
│   ├── yield-vault/        # Annual gacha vault (222 lines)
│   ├── artel-factory/      # Pool registry (113 lines)
│   └── artel-faucet/       # Testnet faucet (66 lines)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # 7-section storytelling landing
│   │   ├── layout.tsx
│   │   └── dapp/
│   │       ├── pools/         # Pool listing + detail [id]
│   │       ├── simulator/     # Interactive ROSCA simulator
│   │       ├── leaderboard/   # Reputation ranking
│   │       ├── gacha/        # Annual + pool jackpot
│   │       ├── dashboard/     # User dashboard
│   │       ├── profile/       # Reputation profile
│   │       ├── faucet/        # 1-click XLM claim
│   │       ├── faq/           # 16-question FAQ
│   │       ├── create/        # Create new pool
│   │       └── layout.tsx     # dApp shell (header + wallet)
│   ├── components/
│   │   ├── sections/          # Landing page sections
│   │   └── ui/               # Shared UI components
│   ├── hooks/
│   │   ├── WalletContext.tsx   # Multi-wallet provider
│   │   └── useFreighterTx.ts  # Contract invocation
│   ├── lib/
│   │   ├── artel-sdk.ts       # Contract client + addresses
│   │   └── i18n/             # EN + ID translations
│   ├── bindings/             # Auto-generated contract bindings
│   └── tests/                # 14 Vitest suites
│
└── docs/                     # (hackathon deliverables)
```

---

## ✅ Testing

```bash
# Frontend — Vitest (14/14 passing)
cd frontend && npm test

# Contracts — Rust (8/8 passing)
cd contracts && cargo test

# Build check
cd frontend && npm run build   # 10 routes compiled
```

---

## 🔒 Security

- **Collateral model** makes default economically irrational (`cost of default > reward of staying`)
- **Circuit breaker** — `pause()` / `unpause()` stops the pool in emergencies
- **Overflow protection** — `overflow-checks = true` with minimal WASM size (`opt-level = "z"`)
- **No admin keys** — all critical functions are time-based or vote-triggered, not admin-only
- **Verifiable randomness** — on-chain winner selection (no off-chain RNG)
- **Grace period** before collateral slashing — members get a 48h warning window

---

## 🌐 Wallet Support

| Wallet | Type | Status |
|--------|------|:------:|
| Freighter | Browser Extension | ✅ |
| Albedo | Web | ✅ |
| xBull | Extension + Mobile | ✅ |
| Lobstr | Mobile + Web | ✅ |

All wallets share a unified `WalletContext` — connect once, available everywhere in the dApp.

---

## 🎨 Design System

- **Palette:** Gold kunyit (`#D4A017`) + dark cream background (`#f0ead2`) + grid dot texture
- **Cards:** Uiverse.io-style brutal-subscribe variants with soft pastel headers
- **Typography:** Letter-by-letter flip animation (AnimatedBadge) on hover
- **Layout:** 2-column hero, tab-style filter with sliding gold indicator
- **Motion:** GSAP scroll-triggered sequences, Lenis smooth scrolling, parallax scenes

---

## 📖 Landing Page

The `/` route is a scrollytelling narrative in 7 acts:

1. **Retakan** (The Crack) — the problems with traditional arisan
2. **Tempaan** (The Forging) — how collateral economics fix trust
3. **Nyala** (The Flame) — triple-yield mechanics
4. **Sistem** (The System) — rules, timeline, yield split
5. **Galeri** (The Gallery) — Stellar ecosystem integrations
6. **Bukti** (The Proof) — on-chain verifiability
7. **CTA** — contract addresses, trust badges, enter the protocol

---

## 🏆 Recognition

Built for the **APAC Stellar Hackathon 2026** — Track A: *Local Finance & Real-World Access*

---

## 📄 License

MIT © 2026 ARTEL

---

<p align="center">
  <sub>Built with Rust · Stellar · Next.js · and a lot of conviction</sub>
</p>
