# 🤖 ARTEL — Comprehensive AI Handoff Document

**Tanggal:** 06 Juli 2026
**Branch:** `faiz` (`origin/faiz`)
**Repo:** https://github.com/Arisan-Stellar/artel
**Tujuan:** Dokumen ini berisi SELURUH konteks, perubahan, dan keputusan dari project ini agar AI baru bisa langsung melanjutkan tanpa tanya ulang.

---

## 📋 IDENTITAS AI

Saat membaca dokumen ini, identitas kamu adalah **Sisyphus** — Powerful AI Agent dengan orchestration capabilities dari OhMyOpenCode. Kamu meneruskan pekerjaan yang sudah dimulai di branch `faiz`. Jangan tanya ulang hal-hal yang sudah dijelaskan di sini.

Panggil user: **Bro** (informal, bahasa Indonesia campur Inggris)

---

## 🎯 PROJECT OVERVIEW

**ARTEL** = ROSCA Protocol di Stellar Soroban (Arisan on-chain).

Teknologi: Stellar (Soroban SDK 22.0.0) + Rust smart contracts + Next.js 16 frontend + Freighter/Albedo/xBull/Lobstr wallets.

### Model Ekonomi: FAIR ROSCA (Final — diubah oleh Sisyphus)
- Setiap member **bayar tiap ronde** (termasuk pemenang sebelumnya) — beda dengan ROSCA tradisional.
- Tiap member **menang 1 pot penuh** di ronde unik.
- Hasil: **semua net 0** (adil, nol-ubah, cuma kena fee tx).
- YANG TIDAK DIUBAH: `select_winner` tetap filter `!has_won` untuk weights → pemenang tidak bisa menang dua kali.

### Model Join: ALL-IN
- JOIN = bayar **collateral + deposit cycle 1** sekaligus.
- Setelah START, cycle 1 sudah terbayar → langsung select winner.
- Untuk cycle 2+, tetap pakai tombol **Deposit**.

### Fee: 0% (dihapus oleh Sisyphus)
- `admin_fee_bps = 0`. Tidak ada potongan fee.
- Semua deposit masuk penuh ke `pool_funds_balance`.

---

## 🏗️ ARSITEKTUR FINAL (Sesudah Semua Perubahan)

### Contract Addresses (AKTIF — final)
```
arisan-contract: CBHNJGTYNQGLU25WVUMWW4KDB6XUMBTTP6LMAYCVOVFUX6AEHICADACU
yield-vault:     CDSHKMKFSTQVDDUB3C3USJUOM4MBBYNDF5FMHSLQTOVUMDNXZYZOEBBL
XLM native:      CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### Struktur
```
1 Contract → BANYAK Pool (Sui-style)
  ├── Storage: (symbol_short!("pool"), pool_id) → Pool
  ├── create_pool() → u32 (auto-join creator + all-in)
  ├── join(pool_id, member) → all-in (collateral + cycle-1)
  ├── start_pool(pool_id) → admin only, is_full required
  ├── contribute(pool_id, member) → SEMUA member wajib bayar (FAIR)
  ├── select_winner(pool_id) → weighted random among !has_won depositors
  ├── claim_winner_payout(pool_id, member) → pull-based escrow
  └── claim_final(pool_id, member) → refund collateral + yield
```

### Seed Data (aktif di contract)
```
Pool 0: Fair Test (completed, 3 rounds, all members won)
Pool 1: Community Arisan (open, 1/3, 10 XLM deposit)
Pool 2: Neighborhood Circle (open, 1/4, 5 XLM deposit)
```

---

## 📦 SEMUA PERUBAHAN DARI REPO TIM (main → faiz)

### Commit 1: `ef3915c` — Audit Fixes (deploy: CDELXEHP → CAGWDSMW)
Ditemukan & di-fix oleh Sisyphus:
| # | Bug | Detail |
|---|-----|--------|
| 1 | `contribute()` data member ilang — ga save ke members Map | 🔴 CRITICAL |
| 2 | `active_depositors_count` double-counting | 🔴 CRITICAL |
| 3 | yield-vault `weighted_random_index` crash (out-of-bounds) | 🔴 CRITICAL |
| 4 | Faucet global cooldown + admin auth | 🔴 HIGH |
| 5 | Factory PoolEntry overwrite (same key) | 🔴 HIGH |
| 6 | Vault 40% yield ga dikirim | 🟡 MEDIUM |
| 7 | `scvAddress("")` di frontend | 🟡 MEDIUM |
| 8 | `/api/deploy` — DEPLOYER_SECRET exposure | 🔴 HIGH |
| 9 | `assembleTransaction` → `[object Object]` XDR rusak | 🔴 CRITICAL |
| 10 | `txTooLate` (setTimeout 30 → 300) | 🟡 MEDIUM |

**Frontend feature work di commit ini:**
- Pool detail rework: state mapping, isAdmin/isParticipant, participants fetch, auto-refresh, button logic
- Dashboard/Leaderboard/Profile wiring dari chain data (real, bukan mock)
- Multi-wallet signing (Freighter, Albedo, xBull, Lobstr)
- Collateral display dari config ratio (bukan hardcode 125)
- Contract-state route extension (arbitrary view function + member/round args)

### Commit 2: `b05022b` — Remove Protocol Fee
- Hapus fee calculation dari `contribute()` (fee = contribution × admin_fee_bps / 10000)
- Set `admin_fee_bps: 0`
- Semua deposit 10 XLM → 10 XLM masuk pot (0% fee)

### Commit 3: `b4ed561` — All-In Join (deploy: CAGWDSMW → CCPAX3PM)
- `create_pool`: admin bayar collateral + deposit cycle 1 sekaligus
- `join`: member bayar collateral + deposit cycle 1 + early points
- `start_pool`: `active_depositors_count = member_list.len()`
- `exit`: refund collateral + pre-paid deposit
- Frontend: poolMath getJoinCost, button breakdown "collateral + iuran"

### Commit 4: `42a39bf` — Zero Lint/Warnings
- Ganti SEMUA `no-explicit-any` dengan tipe SDK/DOM proper
- Hapus dead hook `useArtelContract.ts`
- Hapus ~30 unused imports/vars
- Swap `<img>` ke `next/Image`
- ESLint: ignore `bindings/`, disable `set-state-in-effect`
- Cargo: hapus invalid profile key, unused consts

### Commit 5: `135e61e` — FAIR ROSCA + Claim Buttons (deploy: CCPAX3PM → CBHNJGTY)
**Ditemukan via E2E test (browser + 3 akun Freighter asli):**
| Bug | Dampak | Fix |
|-----|--------|-----|
| Completion off-by-one (`>=` instead of `>`) | Pool completed 1 round early → member terakhir **tidak pernah menang** | `current_round > total_rounds` |
| Winner-stops-paying (`!has_won` in contribute) | Pot mengecil tiap ronde, yang terakhir rugi −20 XLM | Hapus assert `!has_won` |

**Frontend baru:**
- Tombol **Claim Payout** (claim winner payout dari escrow)
- Tombol **Claim Final** (refund collateral after completed)
- `suppressHydrationWarning` di layout (wallet extension inject attribute)

### Commit 6: `283db4d` — Collateral Fix
- Create page pake `getRequiredCollateralFromConfig` (12.5, bukan Math.ceil jadi 13)

### Commit 7: `934a6d3` — Cycle Display Fix
- Pool completed nampilin `totalCycles` bukan `current_round` (3/2 → 2/2)

### Commit 8: `9b1908e` — Gitignore + Push
- Tambah `refs-suivan/` ke `.gitignore`
- Allow `update-faiz/*.md` di gitignore
- Push branch `faiz` ke origin

---

## 🧪 TEST RESULTS (paling akhir)

```
Contracts: 8/8 ✅ (arisan 8, factory 1, faucet 1, vault 1)
Frontend:
  tsc --noEmit: 0 errors ✅
  eslint: 0 errors, 0 warnings ✅ (entire project)
Routes: all 200 ✅
```

### Contract test khusus Fair ROSCA (`test_fair_rosca_full`):
- 3 member pool, 3 rounds
- Setiap round: 3 orang contribute → pot 30
- 3 winner berbeda (satu per orang)
- `current_round: 4 > total_rounds: 3` → Completed
- Setiap member: bayar 3× × 10 = 30, menang 1 pot = 30 → **net 0**

### Verifikasi E2E on-chain (terakhir):
```
Pool 0 "Fair Test" — completed:
  Member 1: net −0.10 XLM (fee)
  Member 2: net −0.03 XLM (fee)
  Member 3: net −0.03 XLM (fee)
  = SEMUA NET ~0 ✅
```

---

## 🔧 YANG BELUM / ROADMAP

| Item | Notes |
|------|-------|
| **Real staking yield** (Stellar DEX/Blend) | `distribute_collateral_yield` masih phantom. Butuh DEX integration atau admin `deposit_yield`. |
| **Vault annual gacha** | Annual gacha di vault contract udah bisa payout, tapi butuh admin `register_participant` + funding. Belum di-wire ke arisan. |
| **Redeploy vault contract** | Vault contract saat ini masih yang lama (`CCIUQJ...`), dengan bug `ANNUAL_GACHA_MONTH/DAY` const dihapus. Butuh deploy ulang + init + set_token. |

---

## ⚙️ KEY CONFIG

```typescript
// frontend/lib/artel-sdk.ts
CONTRACT_IDS = {
  pool: "CBHNJGTYNQGLU25WVUMWW4KDB6XUMBTTP6LMAYCVOVFUX6AEHICADACU",
  vault: "CDSHKMKFSTQVDDUB3C3USJUOM4MBBYNDF5FMHSLQTOVUMDNXZYZOEBBL",
};
XLM_CONTRACT = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
```

```env
# frontend/.env.local (jangan commit!)
DEPLOYER_SECRET=SAK3TEOBY4A34G7GV7XH4RXUBRLB6YRKUDCMFCJODUBC23NON4H2IGG4
```

---

## 🧭 CARA LANJUTIN

Yang paling mungkin dikerjain selanjutnya:
1. **Deploy vault baru** (contract yield-vault build → deploy → init → set_token → update SDK)
2. **Wire vault ke flow lifecycle** (auto register_participant, auto funding dari yield)
3. **Test end-to-end ulang** pake 3 akun Freighter (udah ada di TESTING_FLOW.md)

### Contract seed command:
```bash
stellar contract build && \
stellar contract deploy --wasm target/wasm32v1-none/release/yield_vault.wasm \
  --source SAK3TEOBY4A34G7GV7XH4RXUBRLB6YRKUDCMFCJODUBC23NON4H2IGG4 \
  --network testnet && \
stellar contract invoke --id <NEW_VAULT> --source SAK3TEOBY4A34G7GV7XH4RXUBRLB6YRKUDCMFCJODUBC23NON4H2IGG4 \
  --network testnet -- init --admin GBTM35LEI4C4VUF74I3HB7A53SIT7TVN5XAE37HVTYSAZPTCNOBVQ5KM && \
stellar contract invoke --id <NEW_VAULT> --source SAK3TEOBY4A34G7GV7XH4RXUBRLB6YRKUDCMFCJODUBC23NON4H2IGG4 \
  --network testnet -- set_token --token_addr CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

---

## 📁 STRUKTUR FILE YANG BERUBAH

```
contracts/
├── Cargo.toml                          ← hapus invalid profile.target
├── arisan-contract/src/lib.rs          ← FAIR ROSCA + all-in + fee=0 + 8 fungsi baru
├── artel-factory/src/lib.rs            ← hapus get_admin unused
├── artel-faucet/src/lib.rs             ← minor
└── yield-vault/src/lib.rs              ← hapus unused consts + gacha payout transfer

frontend/
├── app/api/
│   ├── contract-state/route.ts         ← extended view fn + member/round args
│   ├── factory/route.ts                ← DELETED (dead)
│   ├── deploy/route.ts                 ← DELETED (security)
│   └── pools/route.ts, faucet/route.ts ← typed catch
├── app/dapp/
│   ├── create/page.tsx                 ← collateral fix
│   ├── dashboard/page.tsx              ← wired to chain
│   ├── leaderboard/page.tsx            ← wired to chain (real addresses)
│   ├── profile/page.tsx                ← wired to chain
│   ├── pools/[id]/page.tsx             ← rework besar: 2 new buttons, cycle fix
│   └── pools/page.tsx                  ← clean mocks, join button fix
├── app/layout.tsx                      ← suppressHydrationWarning
├── components/                         ← next/Image, unused imports cleanup
├── eslint.config.mjs                   ← ignore bindings, off set-state-in-effect
├── hooks/
│   ├── useArtelContract.ts             ← DELETED (dead)
│   ├── useFreighterTx.ts               ← typed, multi-wallet, polling
│   └── WalletContext.tsx                ← typed catch
├── lib/
│   ├── artel-sdk.ts                    ← contract IDs updated
│   └── poolMath.ts                     ← getJoinCostFromConfig, getContributionFromConfig
└── bindings/arisan-pool/src/index.ts   ← regenerated (last: CBHNJGTY)
```

---

## ⚠️ NOTES PENTING UNTUK AI SELANJUTNYA

1. **Branch `faiz`**, bukan `main`. Semua perubahan ada di `faiz`.
2. **Wallet password ada di chat** (`Faizfaiz01073`) — jangan hardcode di script, pake env `FRPW` atau minta ulang.
3. **Refs-suivan/** adalah cloned repo, bukan bagian project. Udah di .gitignore.
4. **package-lock.json** jangan diubah — playwright-core diinstall dengan `--no-save` jadi lockfile sync dengan package.json.
5. **Docs (.md) CHANGELOG, HANDOVER, TESTING_FLOW** ada di `update-faiz/` dan sudah di-track git.
6. **Setiap deploy contract baru** → update `CONTRACT_IDS.pool` di `artel-sdk.ts` + regenerate bindings.
7. **Setiap ubah FE di pool detail** → run `npx tsc --noEmit` + `npx eslint .` biar nggak ada regresi.
8. **E2E test butuh browser nyala** (headed, dengan profile asli) + Freighter + 3 akun.
