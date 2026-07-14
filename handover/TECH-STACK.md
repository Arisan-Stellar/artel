# 🛠️ ARTEL — Tech Stack

## Overview

| Layer | Technology | Version | Why Chosen |
|-------|-----------|---------|------------|
| **Blockchain** | Stellar + Soroban | SDK 22.0.0 | Hackathon requirement (APAC Stellar) |
| **Smart Contracts** | Rust | `wasm32v1-none` target | Type-safe, performant, no garbage collector |
| **Frontend** | Next.js 16 + React 19 | 16.2.9 | SSR/SSG for landing, CSR for dApp |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS 4 | utility-first | Rapid UI, design system consistency |
| **Animation** | GSAP + Lenis | — | Scroll-triggered animations, smooth scroll |
| **3D (Landing)** | Three.js | — | Interactive globe on landing page |
| **State Mgmt** | Zustand + TanStack Query | — | Lightweight state + server state |
| **Wallet** | Freighter, Albedo, xBull, Lobstr | — | Multi-wallet support via WalletContext |
| **i18n** | Custom (EN + ID) | — | English + Bahasa Indonesia |
| **Testing** | Vitest (FE) + cargo test (contracts) | — | 12/12 contract tests, vitest suites |
| **Deploy** | Vercel | — | Auto-deploy from Git |

---

## Smart Contract Stack (Rust)

```
soroban-sdk = "22.0.0"
Target: wasm32v1-none (Soroban WASM)
Optimization: opt-level = "z" (minimize WASM size)
```

4 kontrak:
| Contract | File | Lines | Tests |
|----------|------|-------|-------|
| `arisan-contract` | `contracts/arisan-contract/src/lib.rs` | ~1240 | 9/9 ✅ |
| `yield-vault` | `contracts/yield-vault/src/lib.rs` | ~242 | 1/1 ✅ |
| `artel-factory` | `contracts/artel-factory/src/lib.rs` | ~107 | 1/1 ✅ (DEPRECATED) |
| `artel-faucet` | `contracts/artel-faucet/src/lib.rs` | ~70 | 1/1 ✅ (unused — app uses friendbot) |

---

## Frontend Stack

### Key Dependencies
```json
{
  "next": "^16.2.9",
  "react": "^19.2.4",
  "@stellar/stellar-sdk": "^14.5.0",
  "@stellar/freighter-api": "latest",
  "tailwindcss": "^4",
  "gsap": "latest",
  "three": "latest",
  "@tanstack/react-query": "latest",
  "zustand": "latest"
}
```

### Dev Tools
```json
{
  "typescript": "^5",
  "eslint": "^9",
  "vitest": "latest",
  "playwright": "latest"  // (dev only — not in production build)
}
```

---

## Network Configuration

Semua jalan di **Stellar Testnet**:

| Config | Value |
|--------|-------|
| Network | `testnet` |
| RPC URL | `https://soroban-testnet.stellar.org` |
| Horizon URL | `https://horizon-testnet.stellar.org` |
| Passphrase | `Test SDF Network ; September 2015` |
| XLM Token (SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

---

## Toolchain

| Tool | Purpose |
|------|---------|
| `stellar` CLI | Deploy contract, invoke functions, key management |
| `cargo` | Rust build + test |
| `npm` | Frontend package management |
| `git` | Version control (branch `faiz`) |
| `Vercel` | Frontend deployment |
| `Python3` | Utility scripts (sed-like replacements) |

---

## ⚠️ Catatan Penting

- **Node.js:** terinstall versi `v26.2.0` (lokal). Vercel default mungkin beda — pastikan kompatibel.
- **package-lock.json:** jangan diubah sembarangan. Regenerate cuma kalau ada `ERESOLVE` / `npm ci` error.
- **Playwright:** terinstall sebagai dev dependency TAPI TIDAK dipakai di production build. Kalau `npm ci` gagal karena transitive deps (`@emnapi/runtime`, `bufferutil`), jalankan `npm install` untuk sync lockfile.
- **wasm32 target:** wajib `rustup target add wasm32v1-none` sebelum build kontrak.

---

## Blend Protocol Stack (Added July 2026)

| Component | Details |
|-----------|---------|
| **Blend Pool** | TestnetV2: `CCEBVDYM...` |
| **Pool Factory** | `CDV6RX4C...` |
| **Assets** | XLM, USDC, wETH, wBTC |
| **Cross-contract** | `env.invoke_contract` + `authorize_as_current_contract` |
| **Auth pattern** | Flat `InvokerContractAuthEntry` untuk authorize sub-contract calls |
| **Yield tracking** | `invoke_contract::<i128>` on token `balance()` before/after withdraw+resupply |

### Key dependencies (unchanged from base)
```json
{
  "next": "^16.2.9",
  "react": "^19.2.4",
  "@stellar/stellar-sdk": "^14.5.0",
  "soroban-sdk": "22.0.0"
}
```
