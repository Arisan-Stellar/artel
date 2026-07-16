<p align="center">
  <img src="frontend/public/artel-logo.png" alt="ARTEL" width="180" />
</p>

<p align="center">
  <strong>The ROSCA Protocol on Stellar</strong><br/>
  Trustless · Collateralized · Triple-Yield — rotating savings on Stellar Soroban
</p>

<p align="center">
  <img src="https://img.shields.io/badge/network-Stellar%20Testnet-7B61FF?style=flat-square&logo=stellar" alt="Stellar Testnet" />
  <img src="https://img.shields.io/badge/soroban--sdk-22.0.0-00C4B4?style=flat-square" alt="Soroban SDK 22.0.0" />
  <img src="https://img.shields.io/badge/next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/react-19.2-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/tests-203%20passed-22C55E?style=flat-square" alt="203 E2E Tests" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT" />
</p>

---

## What is ARTEL?

**ARTEL** is a trustless ROSCA (Rotating Savings and Credit Association) protocol on Stellar Soroban — known across Asia as *Arisan* (Indonesia), *Chit Fund* (India), *Kye* (Korea), *Tanda* (Mexico), and dozens more. Over **100 million people** in APAC participate in these informal savings circles.

ARTEL replaces the human treasurer with smart contracts: **≥125% collateral** guarantees commitment, **triple yield** from Blend Protocol turns idle capital into productive assets, and **zero fees** keep it 100% accessible.

## 🚀 Live Demo

**🔗 [https://artel-protocol.vercel.app/](https://artel-protocol.vercel.app/)**

Watch the full demo: see the landing page, connect your Freighter wallet, create a pool, join with multiple members, start rounds, select winners, harvest yield from Blend, and claim payouts — all automated on-chain.

## 🏗 Architecture

```
┌────────────────────────────────────────────────────┐
│           FRONTEND — Next.js 16 + React 19          │
│      11 dApp pages · 4-wallet support · EN/ID       │
│         Freighter · Albedo · xBull · Lobstr          │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────┴─────────────────────────────┐
│              SOROBAN SMART CONTRACTS                 │
│                                                      │
│  ┌──────────────────┐   ┌────────────────────────┐  │
│  │  arisan-contract  │   │      yield-vault        │  │
│  │  Core ROSCA pool  │   │  Gacha lottery vault   │  │
│  │  17 functions     │   │  8 functions            │  │
│  └────────┬─────────┘   └───────────┬────────────┘  │
│           │                         │                │
│  ┌────────┴─────────────────────────┴─────────────┐ │
│  │       Blend Protocol — Collateral Yield        │ │
│  │    Supply/Withdraw/Harvest via Soroban calls    │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## 📍 Deployed Contracts (Stellar Testnet)

| Contract | Address |
|----------|---------|
| **arisan-contract** | `CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN` |
| **yield-vault** | `CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7` |
| **XLM Token (SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Blend Pool (TestnetV2)** | `CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF` |

> **Network:** Stellar Testnet · **RPC:** `https://soroban-testnet.stellar.org`
>
> **Model:** 1 contract → many pools. `pool_id` = numeric index, not a separate address.

## 🔐 Key Features

| Feature | Description |
|---------|-------------|
| **125% Collateral** | Every member stakes 125% of pool value. Default means losing it all — math makes cheating irrational. |
| **All-in Join** | Collateral + first cycle contribution paid at once. No monthly reminder needed. |
| **Triple Yield via Blend** | Idle collateral auto-supplied to Blend Protocol. 75% yield to members, 25% to gacha vault. |
| **Vault Wire** | Auto-register members to gacha lottery on every contribute/create/join — dynamic tickets based on payment timing. |
| **Fair ROSCA** | Everyone pays every round (including past winners). Net-zero balance. |
| **Zero Fees** | `admin_fee_bps = 0`. No hidden costs. |
| **On-chain Randomness** | Winner selection uses ledger sequence × timestamp × nonce — no admin bias. |
| **EN/ID Bilingual** | Full Bahasa Indonesia support. Language toggle in header. |

## 🚀 Quick Start

```bash
git clone https://github.com/Arisan-Stellar/artel.git
cd artel

# Frontend
cd frontend && cp .env.example .env.local && npm install && npm run dev
# Open http://localhost:3000

# Contracts
cd ../contracts && cargo test && stellar contract build
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Stellar · Soroban SDK 22.0.0 |
| **Smart Contracts** | Rust · wasm32v1-none |
| **Frontend** | Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 |
| **Wallet** | Freighter · Albedo · xBull · Lobstr |
| **Yield** | Blend Protocol (TestnetV2) |
| **Testing** | Playwright (203 E2E tests) · Vitest · cargo test (11/11) |
| **CI/CD** | GitHub Actions · Vercel |
| **i18n** | English · Bahasa Indonesia |

## 🧪 Testing

```bash
# Rust contracts — 11/11
cd contracts && cargo test

# TypeScript — 0 errors
cd frontend && npx tsc --noEmit && npx eslint . --quiet

# E2E browser tests — 203 passed
cd frontend && npx playwright test --project=chromium
```

## 🌐 Vercel Deployment

**URL:** [https://artel-protocol.vercel.app/](https://artel-protocol.vercel.app/)

Environment variables required:
```
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_POOL=CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN
NEXT_PUBLIC_CONTRACT_VAULT=CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7
NEXT_PUBLIC_XLM_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
NEXT_PUBLIC_CONTRACT_BLEND=CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF
```

## 📄 License

MIT — built for APAC Stellar Hackathon 2026.
