# 🔧 ARTEL — Full Changelog

> 📁 **Folder:** `update-faiz/` — dokumentasi lengkap perubahan kode
> **Tanggal:** 06 Juli 2026

---

## 🏗️ Ringkasan Semua Fase

```
FASE 0: AUDIT + 7 BUG FIX (Initial)
FASE 1: ARUSDC TOKEN + API PROXY + FRONTEND REAL DATA
FASE 2: WINNER ESCROW + PROTOCOL FEE + UNBIASED RNG
```

---

## ⭐ FASE 0 — 7 Bugs Fixed

```
🔴 CRITICAL                          🔴 HIGH
┌──────────────────────────────┐    ┌────────────────────────┐
│ #1  contribute() data hilang │    │ #4  Faucet publik      │
│ #2  active_depositors dobel  │    │ #5  Factory overwrite  │
│ #3  Gacha crash              │    └────────────────────────┘
└──────────────────────────────┘    🟡 MEDIUM
                                    ┌────────────────────────┐
                                    │ #6  Vault 40% ga kirim │
                                    │ #7  scvAddress("")     │
                                    └────────────────────────┘
```

## ⭐ FASE 1 — ARUSDC Token + API + Frontend

```
🔧 ARUSDC Token Deployed
   Contract: CAMPCGYI26ZMSYHRC4LYPKG55VJV3AT6C6CX3G4VIPPXWZJI2RQYR2W5
   Issuer:   GBTM35LEI4C4VUF74I3HB7A53SIT7TVN5XAE37HVTYSAZPTCNOBVQ5KM
   Supply:   10,000,000 ARUSDC (minted to faucet wallet)

🔧 Backend Faucet
   Friendbot (XLM) → ARUSDC transfer via Horizon
   Trustline validation + per-address cooldown

🔧 API Routes → Proxy Soroban RPC
   /api/contract-state → get_state() real
   /api/factory        → get_pool_count() real
   /api/pools          → iterasi pools dari factory

🔧 Frontend
   Faucet: "Claim 1,000 ARUSDC" (bukan XLM)
   Pool list: fetch dari API, fallback ke mock
   Pool detail: fetch dari API, fallback ke mock
```

## ⭐ FASE 2 — Keamanan + Protocol + RNG

```
🔐 Winner Escrow (Pull-Based Payout)
   select_winner → simpan payout di winner_payout_balance
   claim_winner_payout() → hanya winner bisa withdraw
   Mencegah dana hilang kalo tx gagal di tengah

💰 Protocol Fee 0.5%
   admin_fee_bps sekarang beneran dipake
   Fee masuk ke yield_balance → gacha jackpot akhir

🎲 Rejection Sampling (Unbiased RNG)
   unbiased_mod() ganti seed % total
   Eliminasi modulo bias
   Implementasi di arisan-contract + yield-vault
```

---

## 📄 File Yang Berubah

### Rust Contracts (6 files)
| File | Fase | Perubahan |
|------|:----:|-----------|
| `contracts/arisan-contract/src/lib.rs` | 0,2 | 7 fitur: bug fix + escrow + fee + RNG |
| `contracts/yield-vault/src/lib.rs` | 0,2 | weighted_random_index + unbiased_mod |
| `contracts/artel-faucet/src/lib.rs` | 0 | user auth + per-address cooldown |
| `contracts/artel-factory/src/lib.rs` | 0 | key collision fix |

### Frontend (7 files)
| File | Fase | Perubahan |
|------|:----:|-----------|
| `app/api/contract-state/route.ts` | 1 | Proxy real ke Soroban RPC |
| `app/api/factory/route.ts` | 1 | Proxy real ke Soroban RPC |
| `app/api/faucet/route.ts` | 1 | ARUSDC transfer + trustline check |
| `app/api/pools/route.ts` | 1 | Proxy real ke Soroban RPC |
| `app/dapp/faucet/page.tsx` | 1 | Copy XLM → ARUSDC |
| `app/dapp/pools/page.tsx` | 0,1 | Mock → API fetch + bug fix |
| `app/dapp/pools/[id]/page.tsx` | 0,1 | Mock → API fetch + scvAddress fix |
| `lib/artel-sdk.ts` | 1 | ARUSDC_TOKEN + ARUSDC_ISSUER |

### Config (2 files)
| File | Fase | Perubahan |
|------|:----:|-----------|
| `frontend/.env.local` | 1 | Baru: issuer secret + faucet keypair |
| `contracts/*/test_snapshots/*.json` | 0,2 | Auto-updated by cargo test |

---

## 📂 File Baru

| File | Fase | Isi |
|------|:----:|-----|
| `update-faiz/CHANGELOG.md` | - | Full detail — diff, root cause, dampak |
| `update-faiz/README.md` | - | Ringkasan visual |
| `update-faiz/REFS_SUIVAN_AUDIT.md` | - | Audit Suivan referensi |
| `update-faiz/ADAPTASI_SUI_KE_STELLAR.md` | - | Analisis fitur Sui→Stellar |
| `.omo/plans/fix-bugs.md` | 0 | Work plan fase 0 |
| `.omo/plans/fase1-token-faucet.md` | 1 | Work plan fase 1 |
| `frontend/.env.local` | 1 | Environment variables |

---

## 📊 Test Results

```
┌────────────────────────────────────────────────────────┐
│                     TEST RESULTS                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  CONTRACTS (cargo test):      8/8  ✅  ALL PASS        │
│  ├─ arisan-contract:          5/5  ✅                  │
│  ├─ artel-factory:            1/1  ✅                  │
│  ├─ artel-faucet:             1/1  ✅                  │
│  └─ yield-vault:              1/1  ✅                  │
│                                                        │
│  FRONTEND (npm test):        9/14  ✅  9 PASS          │
│                              5/14  ⚠️  pre-existing    │
│                                                        │
│  TypeScript (tsc --noEmit):   0 errors ✅               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 📑 Baca Selengkapnya

| File | Isi |
|------|-----|
| `CHANGELOG.md` | Full detail — diff, root cause, verifikasi per bug |
| `REFS_SUIVAN_AUDIT.md` | Audit Suivan (referensi konsep asli) |
| `ADAPTASI_SUI_KE_STELLAR.md` | Fitur Sui mana yang bisa diadaptasi |
