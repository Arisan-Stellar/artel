
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
  <img src="https://img.shields.io/badge/contracts-12%2F12%20passing-22C55E?style=flat-square" alt="Tests" />
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
| **arisan-contract** | `CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT` | Core ROSCA pool lifecycle |
| **yield-vault** | `CCBQFVC34ZAXC3DTCTKCSIAEWQ4QS67LQQ7F2RL5DSGXJWV2XXY4YAEH` | Annual gacha vault |
| **XLM token (SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | Native XLM asset contract |

> **Network:** Stellar Testnet · **RPC:** `https://soroban-testnet.stellar.org` · **Passphrase:** `Test SDF Network ; September 2015`
>
> **Model:** 1 contract → banyak pool. `pool_id` = angka urut (`0, 1, 2…`), **bukan** contract address —
> URL `/dapp/pools/1` = pool ke-2 di dalam contract arisan yang sama.
> `artel-factory` & `artel-faucet` tidak dipakai di arsitektur saat ini (faucet pakai friendbot).

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
| **Testing** | Vitest (frontend) · `cargo test` (12/12 contracts) |
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

### Automated

```bash
# Contracts — Rust (12/12 passing: arisan 9, factory 1, faucet 1, vault 1)
cd contracts && cargo test

# Frontend — type + lint (0 errors, 0 warnings)
cd frontend && npx tsc --noEmit && npx eslint .

# Frontend — Vitest
cd frontend && npm test

# Build check
cd frontend && npm run build
```

---

## 🧪 Manual End-to-End Testing (Full Lifecycle)

Tes lengkap ROSCA dari **create → join → start → contribute → select winner → claim** lewat browser.
Model ekonomi: **Fair ROSCA** (semua member bayar tiap ronde, termasuk pemenang) + **All-in Join** (collateral + iuran cycle-1 dibayar sekaligus) + **Fee 0%**.

### Prasyarat

1. **Dev server nyala:** `cd frontend && npm run dev` → `http://localhost:3000`
2. **Freighter extension** terinstall, network di-set **Testnet**.
3. **2–3 akun Freighter** (klik avatar → "Add account"). Sebut: **Wallet A** (admin), **Wallet B**, **Wallet C**.
4. **Saldo XLM cukup** tiap wallet (butuh ±20 XLM buat collateral+iuran). Kurang → pakai Faucet (Step 0).

> ℹ️ Karena pakai **All-in Join**, admin auto-jadi member #1 saat create. Jadi pool 3-member butuh admin + 2 join (bukan 3).

### Flow Step-by-Step

| # | Aksi | Wallet | Langkah | Expected ✅ |
|---|------|--------|---------|-------------|
| **0** | Faucet | A, B, C | Buka `/dapp/faucet` → **Claim 10,000 XLM** tiap wallet | Saldo naik / "Already funded" |
| **1** | Create pool | A | `/dapp/create` → Name, Deposit `5`, Max `3` → **Create Pool** → Freighter Confirm | Banner "Pool Created ✅" + pool ID. Admin auto jadi member #1, bayar **17.5 XLM** (12.5 collateral + 5 iuran) |
| **2** | Join | B | Switch Wallet B → buka pool → **Join · 17.5 XLM** → Confirm | Participants 1→2, tombol Join hilang, "Active Participant" |
| **3** | Join | C | Switch Wallet C → **Join** → Confirm | Participants 2→3, status **READY** (full 3/3) |
| **4** | Start | A | Switch Wallet A → **Start Pool** → Confirm | Status **ACTIVE**, cycle 1/3, Pool Funds **15 XLM** (all-in cycle-1) |
| **5** | Round 1 select | A | **Select Winner** → Confirm (cycle 1 udah kebayar dari all-in) | Winner terpilih, cycle 1→2, Pool Funds → 0 (escrow), muncul di "Cycle Winners" |
| **6** | Round 2 | A, B, C | Tiap wallet **Deposit 5 XLM** → lalu A **Select Winner** | **Pemenang R1 tetap wajib Deposit** (Fair ROSCA). Winner R2 ≠ R1. Cycle 2→3 |
| **7** | Round 3 | A, B, C | Tiap wallet **Deposit** → A **Select Winner** | Winner R3 (member terakhir yg belum menang). Status **COMPLETED** (cycle capped 3/3) |
| **8** | Claim Payout | A, B, C | Tiap wallet: tombol **Claim Payout XX XLM** → Confirm | Escrow (15 XLM/winner) masuk ke wallet, tombol hilang |
| **9** | Claim Final | A, B, C | Tiap wallet: tombol **Claim Final XX XLM** → Confirm | Collateral (12.5 XLM) balik ke wallet |
| **10** | Verify | A | `/dapp/dashboard`, `/dapp/leaderboard`, `/dapp/profile` | Data real dari chain (pool, points, tickets, winner) |

### Verifikasi Net-Zero (inti Fair ROSCA)

Tiap member: **bayar** 27.5 XLM (12.5 collateral + 3×5 iuran) → **balik** 27.5 XLM (menang 1 pot 15 + collateral 12.5) → **net 0** (cuma kena fee tx).

Cek saldo on-chain:
```bash
curl -s "https://horizon-testnet.stellar.org/accounts/<ADDRESS>" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['balances'][0]['balance'],'XLM')"
```

### CLI Verification (sudah dijalankan — hasil aktual)

Full lifecycle di atas sudah diverifikasi via Stellar CLI di testnet (pool 3-member, 3 ronde):

```
create (all-in 17.5) → 3 join (full 3/3) → start → R1 winner M2 →
R2 (M2 tetap bayar) winner M1 → R3 winner admin → COMPLETED (round 4 > 3) →
claim payout 3×15 + claim final 3×12.5 → contract balance 0 (solvent)

HASIL: Wallet B & C net ~0 XLM (cuma 0.03 fee) → Fair ROSCA net-zero TERBUKTI ✅
3 winner unik (tiap member menang 1×) · completion logic (>) benar
```

> 📄 Versi lebih dalam + CLI cheatsheet + troubleshooting: **`update-faiz/TESTING_FLOW.md`**

### Troubleshooting Cepat

| Gejala | Solusi |
|--------|--------|
| Freighter popup gak muncul | Unlock Freighter, set network **Testnet** |
| `❌ txTooLate` | Cek jam sistem (clock skew) |
| Join gagal "already a member" | Pakai wallet lain |
| Join gagal "pool is full" | Admin sudah jadi member #1 — cukup 2 join lagi buat pool max-3 |
| Start Pool gak muncul | Login wallet admin + pool harus READY (full) |
| Participants gak update | Tunggu ±5 detik (auto-refresh) / reload |

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
