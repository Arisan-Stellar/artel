# 💼 ARTEL — Business Context & Economic Model

## What is ARTEL?

**ARTEL** is a trustless ROSCA (Rotating Savings and Credit Association) protocol built on Stellar Soroban. Known across Asia as:

| Country | Local Name |
|---------|-----------|
| 🇮🇩 Indonesia | **Arisan** |
| 🇮🇳 India | **Chit Fund** |
| 🇰🇷 South Korea | **Kye** |
| 🇲🇽 Mexico | **Tanda** |
| 🇯🇵 Japan | **Mujin** |
| 🇵🇭 Philippines | **Paluwagan** |
| 🇧🇷 Brazil | **Consórcio** |
| 🇳🇬 Nigeria | **Esusu / Ajo** |

Over **100 million people** in APAC participate in these informal savings circles. ARTEL takes this centuries-old mechanism on-chain.

## The Problem

| # | Pain Point | Impact |
|---|-----------|--------|
| 🏃 | **Trust breach** | Organizer runs with the pot — no recourse |
| 💤 | **Idle money** | Pooled capital sits dead between cycles |
| 📋 | **Manual records** | Paper ledgers, error-prone |
| 🔒 | **Geographic lock** | Only works within one neighborhood |

## The Solution — 3 Layer Protection

### 🔐 Layer 1: Collateral ≥125%
Every member deposits ≥125% of total pool value as collateral.
Defecting costs MORE than staying — math makes it irrational.

### 🧹 Layer 2: Automated Smart Contract
Smart contracts handle: contribution collection, collateral staking, winner selection, yield distribution. No admin needed.

### 💰 Layer 3: Triple Yield
Idle pooled capital earns yield via Blend Protocol:
- 75% → distributed equally to members
- 25% → pooled into Gacha vault (annual jackpot)

## Economic Model (FINAL — JANGAN DIUBAH)

| Rule | Value |
|------|-------|
| **Fair ROSCA** | Semua member bayar SETIAP ronde (termasuk pemenang lama). Net-zero: bayar 27.5 = balik 27.5. |
| **All-in Join** | JOIN = bayar collateral + iuran cycle-1 sekaligus. |
| **Fee 0%** | `admin_fee_bps = 0`. Tidak ada potongan. |
| **Collateral Ratio** | ≥100% (default 12500 bps = 125%) |

## Tokenomics

| Item | Detail |
|------|--------|
| **Token** | XLM (Stellar native) |
| **Collateral** | Disimpan di contract, di-supply ke Blend Protocol |
| **Yield Source** | Blend Protocol lending pool (TestnetV2) |
| **Yield Distribution** | 75% member / 25% gacha vault |
| **Gacha Frequency** | Annual (June 30 window) |

## State Machine — Monthly Cycle

```
╔══════════════════════════════════════════════╗
║          MONTHLY ROUND                       ║
║                                              ║
║  Day 1-10   EARLY PAY    +3 points   ★★★    ║
║  Day 10-20  MID PAY      +1 point    ★☆☆    ║
║  Day 21+    SLASH/WARNING           -2 pts   ║
║                                              ║
║  Day 25     WINNER SELECTED ← random         ║
║  Day 30     YIELD DISTRIBUTED                ║
║                                              ║
╚══════════════════════════════════╦═══════════╝
                                   ║
╔══════════════════════════════════╩═══════════╗
║         END OF POOL                          ║
║  → All yield distributed                     ║
║  → Collateral returned to members            ║
║  → Gacha drawn (if annual window)            ║
╚══════════════════════════════════════════════╝
```

## Pool States

| State | Description |
|-------|-------------|
| **Pending** | Pool dibuat, menunggu member join |
| **Active** | Pool berjalan, member bayar tiap ronde |
| **Completed** | Semua siklus selesai, bisa claim final |

## Scoring System

| Payment Timing | Points |
|---------------|--------|
| Early (Day 1-10) | +3 |
| Mid (Day 10-20) | +1 |
| Late/Slash (Day 21+) | -2 |

Streak multipliers (100% → 200%) boost ticket count for gacha.
