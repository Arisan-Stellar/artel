# 📋 ARTEL — Changelog Lengkap

**Repositori:** https://github.com/Arisan-Stellar/artel
**Branch:** `faiz`
**Author:** Sisyphus (OhMyOpenCode AI Agent) → user: Bro
**Periode:** 06–07 Juli 2026

---

## ✅ STATUS TERAKHIR (08 Juli 2026) — SEMUA SELESAI

| Item | Status |
|------|--------|
| Merge branding senior (favicon) ke faiz | ✅ FF merge |
| Full audit + fix (18 bug: 2 CRITICAL, 2 HIGH, 7 MED, 7 LOW) | ✅ DONE |
| Redeploy arisan + vault (admin key baru) | ✅ arisan `CAHJPUKI…` · vault `CCBQFVC3…` |
| E2E lifecycle test (via CLI) | ✅ net-zero TERBUKTI on-chain |
| Secret bocor | ✅ NEUTRALIZED (rotate + account-merge akun lama → HTTP 404) |
| Docs update-faiz | ✅ HANDOVER, AI_ONBOARD, README, DEPLOY_HANDOVER, CHANGELOG |
| Push faiz + PR #3 → main | ✅ open, mergeable |
| Verifikasi | ✅ cargo 12/12 · tsc 0 · eslint 0/0 · wasm build clean |
| **Sisa** | History scrub (force-push) — DEFERRED, cuma perlu kalau public/mainnet |

---

## 📊 RINGKASAN

| Metric | Value |
|--------|-------|
| Total commits (main → faiz) | 8 awal + 6 pass audit |
| Contract deployments | 6 (5 arisan, ... ) + redeploy arisan+vault (key baru) |
| Bugs found & fixed | 13 + 18 (audit pass) |
| Contract tests | 12/12 ✅ (arisan 9, factory 1, faucet 1, vault 1) |
| Frontend lint | 0 errors, 0 warnings |
| TypeScript | 0 errors |
| E2E lifecycle | net-zero terbukti on-chain ✅ |

---

## 🔴 ORIGINAL BUGS (ditemukan di awal, dari repo tim)

| # | Bug | Severitas | File | Fix |
|---|-----|-----------|------|-----|
| B1 | `contribute()` data member ilang | 🔴 CRITICAL | `arisan-contract/src/lib.rs` | Tambah `pool.members.set()` |
| B2 | `active_depositors_count` double-counting | 🔴 CRITICAL | `arisan-contract/src/lib.rs` | Hapus increment salah di contribute |
| B3 | yield-vault `weighted_random_index` crash | 🔴 CRITICAL | `yield-vault/src/lib.rs` | Ganti ke cumulative-weighted |
| B4 | Faucet admin auth + global cooldown | 🔴 HIGH | `artel-faucet/src/lib.rs` | `to.require_auth()` + key per-address |
| B5 | Factory overwrite PoolEntry (same key) | 🔴 HIGH | `artel-factory/src/lib.rs` | Key pake address bukan symbol |
| B6 | Vault 40% yield ga dikirim | 🟡 MEDIUM | `arisan-contract/src/lib.rs` | Tambah transfer ke vault |
| B7 | `scvAddress("")` di frontend | 🟡 MEDIUM | `pools/[id]/page.tsx` | Pake address dari WalletContext |

---

## 📦 COMMIT DEMI COMMIT

---

### Commit 1: `ef3915c` — Audit Fixes: multi-round contract bugs, FE rework, redeploy

**Contract: `CDELXEHP6F7IXW7FGSSRNU7FM6NVMA3UCBTJMY2TEHAQO25SNEBQN53R` → `CAGWDSMW6BKL3CQ3XAD5O73YD5D7LMRO4GKAQHK3JDKDQ4H64AWDIKTR`**

#### 🔐 Security
| Aksi | File |
|------|------|
| Hapus `/api/deploy/route.ts` (exposes DEPLOYER_SECRET) | `frontend/app/api/deploy/route.ts` |
| Hapus `/api/factory/route.ts` (dead code) | `frontend/app/api/factory/route.ts` |
| Hapus `CONTRACT_IDS.factory/faucet` dari SDK | `frontend/lib/artel-sdk.ts` |

#### 🔧 Contract bug fixes
| Aksi | Detail |
|------|--------|
| **P2A: select_winner round-1 guard no-op** | `start_pool`: `active_depositors_count = 0` (was member_list.len()). `contribute`: increment. `slash`: increment. |
| **P2B: non-member panic** | Tambah `assert!(contains_key)` sebelum `.unwrap()` di `exit`, `contribute`, `claim_final` |
| **P2C: view functions baru** | `get_admin(pool_id)`, `get_round_winner(pool_id, round)` |

#### 🖥️ Frontend feature work
| Aksi | Detail |
|------|--------|
| **Pool detail rework** | State mapping (Pending+full→"ready"), isAdmin/isParticipant real, participants from get_leaderboard, auto-refresh, button logic, round winners |
| **Dashboard wired** | MY_POOLS + stats agregat dari get_member_info/get_tickets per pool |
| **Leaderboard wired** | Agregasi cross-pool (real addresses, bukan G...ABC) |
| **Profile wired** | STATS/reputation/badges/activity dari on-chain |
| **Multi-wallet signing** | Dispatch per walletType (Freighter/Albedo/xBull/Lobstr) |
| **Collateral display** | `getRequiredCollateralFromConfig()` — mirror contract math |
| **Contract-state API** | Dukung `?fn=` arbitrary view + `&member=` + `&round=` |

#### 🐛 Additional bugs found & fixed in commit 1
| # | Bug | Severitas | Fix |
|---|-----|-----------|-----|
| B8 | `assembleTransaction` return `TransactionBuilder` (bukan Transaction) → `.toXDR()` undefined → `[object Object]` jadi XDR rusak | 🔴 CRITICAL | `assembled.build().toXDR()` |
| B9 | `setTimeout(30)` → clock skew 62s → `txTooLate` | 🟡 MEDIUM | `setTimeout(300)` |
| B10 | "Join Now" button cuma `setJoiningId` → stuck "..." selamanya | 🟡 MEDIUM | Jadi Link ke pool detail |
| B11 | import mati `useFreighterTx`/`scvAddress` di pools/page | 🟢 LOW | Hapus |

---

### Commit 2: `b05022b` — Remove Protocol Fee

**Tidak ada deploy ulang (hanya ubah kode, fee=0).**

| Aksi | Detail |
|------|--------|
| Hapus `fee = contribution * admin_fee_bps / 10000` | `arisan-contract/src/lib.rs` line 405-406 |
| Hapus `pool.yield_balance = yield_balance + fee` | line 412 |
| Ubah `pool_funds_balance += net_deposit` → `+= contribution` | line 411 |
| Set `admin_fee_bps: 0` di test config | line 888 |
| Update snapshot `pool_funds_balance` di test | 2985000000 → 3000000000 |

**Dampak:** Semua deposit 10 XLM → 10 XLM masuk pot (0% fee). Yield cuma dari external deposit_yield.

---

### Commit 3: `b4ed561` — All-In Join

**Contract: `CAGWDSMW6BKL3CQ3XAD5O73YD5D7LMRO4GKAQHK3JDKDQ4H64AWDIKTR` → `CCPAX3PM3DNMXU4ZGPADUIWNZR4P2CSKRCNQSA4BGS2JU24DXFONBWM3`**

#### Contract changes
| Fungsi | Sebelum | Sesudah |
|--------|---------|---------|
| `create_pool` | Transfer collateral, pot=0, deposited=false | Transfer collateral+contribution, pot=contribution, deposited=true, early_payments=1 |
| `join` | Transfer collateral, pot tetap | Transfer collateral+contribution, pot+=contribution, deposited=true, early_payments=1 |
| `start_pool` | `active_depositors_count = 0` | `= member_list.len()` (semua udah deposit cycle 1) |
| `exit` | Refund collateral doang | Refund collateral + total_contributed (cycle-1 deposit) |

#### Frontend
| Aksi | Detail |
|------|--------|
| `poolMath.ts` | `getJoinCostFromConfig`, `getContributionFromConfig` |
| Pool detail | Tombol Join: "Join · 35 XLM (25 collateral + 10 iuran)" |
| Create page | "Upfront (coll + 1st cycle)" = coll + deposit |

**Tests:** `test_all_in_join` (verify join transfer collateral+contribution, pot terisi, deposited=true). Total: 7/7 pass.

---

### Commit 4: `42a39bf` — Zero Lint/Warnings Audit

**Tidak ada deploy ulang (kode-only).**

#### TypeScript/ESLint cleanup
| Aksi | Detail |
|------|--------|
| `no-explicit-any` | 41 instances → semua di-type proper (import type, unknown narrowing) |
| `useFreighterTx.ts` | Full rewrite: typed params/results, `catch (e: unknown)` |
| `api/contract-state/route.ts` | `toNative(ScVal)`, `callView(Server, Account)` |
| `api/faucet/pools/rpc/route.ts` | `catch (e: unknown)` |
| `hooks/WalletContext.tsx` | `catch (e: unknown)` |
| `pools/page.tsx` | `parsePoolState(RawPoolState, RawPoolConfig)` instead of `any` |
| `pools/[id]/page.tsx` | `PoolView`, `ConfigView`, `MemberView`, `CycleWinner` interfaces |
| **Dead code removed** | `useArtelContract.ts` (unused hook), ~30 unused imports/vars |
| **`<img>` to `next/Image`** | 3 instances: layout, ArtelHeader, ArtelFooter |
| **ESLint config** | Ignore `bindings/**`, disable `set-state-in-effect` (false-positive on data-fetch effects) |

#### Rust cleanup
| Aksi | Detail |
|------|--------|
| `Cargo.toml` | Hapus `profile.release.target` invalid key |
| `artel-factory` | Hapus `get_admin()` unused private fn |
| `yield-vault` | Hapus `ANNUAL_GACHA_MONTH`, `ANNUAL_GACHA_DAY` unused consts |

**Hasil akhir:** `cargo test` → 0 warning. `eslint .` → 0 error.

---

### Commit 5: `135e61e` — FAIR ROSCA Economics + Claim UI + Hydration

**Contract: `CCPAX3PM3DNMXU4ZGPADUIWNZR4P2CSKRCNQSA4BGS2JU24DXFONBWM3` → `CBHNJGTYNQGLU25WVUMWW4KDB6XUMBTTP6LMAYCVOVFUX6AEHICADACU`**

#### 🔴 Critical bugs FOUND by E2E test (proven on-chain)

**Bug K1: Completion off-by-one**
- `select_winner` increment current_round, cek `current_round >= total_rounds`
- Pool 3 member: start→r1, select→r2, select→r3 (3>=3 COMPLETED)
- Hanya 2 winner terpilih, anggota ke-3 **tidak pernah menang**
- **Fix:** `>` instead of `>=` → butuh N selections untuk N-member pool

**Bug K2: Winner-stops-paying → shrinking pot**
- `contribute` assert `!has_won` — pemenang tidak boleh bayar lagi
- Pot per ronde: 30 → 20 → 10 (makin kecil)
- Yang terakhir: bayar 20 (all-in + contribute), menang pot 10 → **rugi 10 XLM**
- **Fix:** hapus assert `!has_won` (semua wajib bayar tiap ronde)

**Bukti on-chain (E2E test 3 akun):**
```
Sebelum fix (pool 2, max=3):
  A: ±0 (menang R2)
  B: +20 XLM (menang R1)
  C: -20 XLM (tidak pernah menang)  ← KORBAN BUG

Sesudah fix (pool 0, fair test):
  Semua akun: net ~0 XLM (hanya fee tx) ✅
```

#### Contract fixes
| Aksi | Line | Detail |
|------|------|--------|
| Hapus `!has_won` assert di contribute | ~389 | Pemenang tetap bisa bayar ronde berikutnya |
| `select_winner` expected = `is_active` | ~478 | Semua wajib deposit (bukan hanya non-winner) |
| Completion `>` bukan `>=` | ~521 | N selections untuk N-member pool |

#### Frontend baru
| Aksi | Detail |
|------|--------|
| **Claim Payout button** | Muncul kalau `memberInfo.pending_winner_payout > 0 && !winner_payout_claimed` |
| **Claim Final button** | Muncul kalau `pool: completed && !gacha_claimed` |
| **Hydration fix** | `suppressHydrationWarning` di `<body>` (wallet extension inject attributes) |

#### Test baru: `test_fair_rosca_full`
```rust
3 member pool, 3 rounds:
- Round 1: 3 contribute → pot 30 → winner A
- Round 2: 3 contribute → pot 30 → winner B (≠ A)
- Round 3: 3 contribute → pot 30 → winner C (≠ A, ≠ B)
- Completed (current_round=4 > total_rounds=3)
- Setiap member: bayar 30, menang 30 → net 0 ✅
```

---

### Commit 6: `283db4d` — Create Page Collateral Fix

| Sebelum | Sesudah |
|---------|---------|
| `Math.ceil(deposit * (max-1) * 125 / 100)` → 13 | `getRequiredCollateralFromConfig(...)` → 12.5 |
| Upfront: 23 XLM | Upfront: 22.5 XLM |

---

### Commit 7: `934a6d3` — Cycle Display Fix

| Sebelum | Sesudah |
|---------|---------|
| Completed: "CYCLE 3/2" (current_round mentah) | Completed: "CYCLE 2/2" (capped di totalCycles) |

---

### Commit 8: `9b1908e` — Gitignore + Push

- `refs-suivan/` di `.gitignore`
- `update-faiz/*.md` di-allow di `.gitignore`
- Branch `faiz` push ke `origin/faiz`

---

## 🧪 TEST RESULTS (Hierarki, terakhir: commit 5)

```
CONTRACTS (cargo test):
  arisan-contract: 8/8 ✅
    - test_collateral_formula
    - test_init_join_exit (all-in exit refund + deposit)
    - test_full_lifecycle (all-in, no round-1 contributes)
    - test_tickets_with_streak
    - test_slash (round-2 scenario)
    - test_two_rounds_no_deadlock
    - test_all_in_join
    - test_fair_rosca_full     ← baru (3 winner, net-0)
  yield-vault: 1/1 ✅
  artel-factory: 1/1 ✅
  artel-faucet: 1/1 ✅

FRONTEND:
  tsc --noEmit: 0 errors ✅
  eslint .: 0 errors, 0 warnings ✅
  All routes: 200 ✅
```

---

## 📍 SEMUA CONTRACT ADDRESS

| Versi | Contract | Address | Deployed by |
|-------|----------|---------|-------------|
| Awal (single pool) | arisan | `CD5JAD6VAMI2IR7IKNAX42AL4MFBAZM6ZYE6XBDC6AQZ5MNX6JR6GPH5` | Tim |
| Ke-2 (multi-pool) | arisan | `CCJZSCZH3SBAX62HGPT6NXJGQZFLW4SWOXFX5PFIZL63AX4ZTPVVB4PD` | Tim |
| Ke-3 (multi+autojoin) | arisan | `CDELXEHP6F7IXW7FGSSRNU7FM6NVMA3UCBTJMY2TEHAQO25SNEBQN53R` | Tim |
| Ke-4 (audit fix) | arisan | `CAGWDSMW6BKL3CQ3XAD5O73YD5D7LMRO4GKAQHK3JDKDQ4H64AWDIKTR` | Sisyphus |
| Ke-5 (all-in join) | arisan | `CCPAX3PM3DNMXU4ZGPADUIWNZR4P2CSKRCNQSA4BGS2JU24DXFONBWM3` | Sisyphus |
| **Ke-6 (FAIR ROSCA)** | **arisan** | **`CBHNJGTYNQGLU25WVUMWW4KDB6XUMBTTP6LMAYCVOVFUX6AEHICADACU`** | **Sisyphus (AKTIF)** |
| Awal | vault | `CCIUQJ3JZJTCJSJQDOW4QLRVT44TL3Y6WIUBW77AWL56AQEYBMOANOAH` | — |
| **Baru (gacha fix)** | **vault** | **`CDSHKMKFSTQVDDUB3C3USJUOM4MBBYNDF5FMHSLQTOVUMDNXZYZOEBBL`** | **Sisyphus (AKTIF, init+token OK)** |

---

## 📋 YANG BELUM DILAKUKAN (Roadmap)

1. ~~**Redeploy vault contract**~~ ✅ DONE — vault baru `CCBQFVC3…` (init + set_token). arisan juga redeploy `CAHJPUKI…`.
2. **Wire vault register_participant** → arisan otomatis daftarin member ke vault pas contribute.
3. **Wire vault funding** → distribute_collateral_yield via env.invoke_contract ke vault.receive_yield.
4. **Real yield (DEX/Blend)** → `deposit_yield()` ada tapi belum ada automation.
5. **Tombol "Distribute Yield" di FE** → sekarang cuma ada di contract.

---

## Commit 9: Merge `main` (branding senior) + Full Audit Bugfix + Redeploy

**Contract redeploy (fresh admin key, key lama di-abandon karena secret bocor):**
```
arisan: CBHNJGTY… → CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT
vault:  CDSHKMKF… → CCBQFVC34ZAXC3DTCTKCSIAEWQ4QS67LQQ7F2RL5DSGXJWV2XXY4YAEH (init + set_token OK)
admin:  GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ (secret cuma di .env.local)
```

**Integrasi:** fast-forward `origin/main` → `faiz` (branding: favicon 512x512, metadataBase, cleanup import).

**Contract fixes:**
| Sev | Fix | File |
|-----|-----|------|
| 🔴 CRITICAL | `distribute_collateral_yield` nganggep principal sebagai yield → insolvency. Seed `collateral_yield_balance = principal` di create_pool/join. + `test_collateral_yield_no_phantom` | arisan lib.rs |
| 🟠 HIGH | Faucet `init` tanpa re-init guard → admin takeover. Tambah panic if initialized. | faucet lib.rs |
| 🟡 MED | `select_winner` fallback index-0 kalau semua weight 0. Tambah `assert weight_sum>0`. | arisan lib.rs |
| 🟡 MED | Vault `register_participant` unauth → ticket stuffing. Gate ke admin. | vault lib.rs |
| 🟢 LOW | Gacha zero-in `yield_balance` → dana sisa nyangkut. Kurangi sebesar yang terbagi. | arisan lib.rs |
| 🟢 LOW | Factory ditandai DEPRECATED; faucet SAC note; randomness security note. | factory/faucet/arisan |

**Frontend fixes:**
| Sev | Fix |
|-----|-----|
| 🟠 HIGH | `admin_fee_bps` create page 50 → 0 (selaras Fee 0%) |
| 🟡 MED | Pool detail FUNDS pakai `pool_funds_balance` asli (bukan deposit×members) |
| 🟡 MED | Participant badge Paid/Winner diisi dari `get_member_info` (dulu selalu false) |
| 🟡 MED | Tickets "Your Status" pakai `get_tickets` (dulu hardcode 6) |
| 🟡 MED | `useFreighterTx` + `api/rpc` pakai config dari `artel-sdk` (dulu hardcode testnet) |
| 🟢 LOW | Favicon single-source (hapus block `icons` di layout.tsx) |
| 🟢 LOW | Hapus dead `getRequiredCollateralAmount`; cycleDays dari `round_duration`; allowlist rpc/contract-state; NaN guard; surface empty-catch |

**Security remediation (C1):** secret key + password dihapus dari working tree docs. Key di-**rotate** (contract pakai admin baru) + akun key lama di-**account-merge** (sekarang HTTP 404, worthless). Git history scrub (force-push) **DEFERRED** — cuma perlu kalau repo go public/mainnet.

**Test:** cargo `12/12` ✅ · tsc `0` ✅ · eslint `0/0` ✅ · wasm build clean ✅

> ⚠️ Redeploy me-reset semua pool testnet (fresh, 0 pool). Bikin pool baru via UI (`/dapp/create`).

---

## Commit 10-14: E2E test + docs handover + secret neutralization

**E2E full lifecycle (CLI, testnet)** — create→3 join→start→3 ronde (contribute+select)→claim payout+final.
Hasil: 3 winner unik, pool Completed, contract balance 0 (solvent), member net ~0 XLM → **Fair ROSCA net-zero TERBUKTI**.

**Docs handover** — `DEPLOY_HANDOVER.md` (env vars Vercel + checklist tim main), README root (manual E2E flow + diagram visual), update semua address ke redeploy.

**Secret neutralization (no force-push)** — account-merge akun lama `GBTM35LE…` → key baru `GAAA6ZHL…`. Akun lama sekarang HTTP 404. Secret bocor di history jadi ngontrol akun non-existent = 100% worthless. Force-push scrub tidak diperlukan untuk testnet.

**PR:** [#3](https://github.com/Arisan-Stellar/artel/pull/3) `faiz → main` (open, mergeable).
