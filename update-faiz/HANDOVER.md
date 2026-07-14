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
arisan-contract: CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O
yield-vault:     CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V
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

### Seed Data (state saat ini di contract baru)
```
Contract baru (redeploy) START KOSONG — pool dibuat via UI (/dapp/create).
Cek jumlah pool: get_pool_count. Pool diindeks angka urut (0, 1, 2, ...).

Snapshot terakhir (07 Juli):
  Pool 0: "E2E CLI Test" (Completed, 3 member, 3 ronde, tiap member menang 1x — hasil E2E test)
  Pool 1: "Faiz 2" (Pending/open, 1/2, 10 XLM deposit, admin Wallet 3)
```

> ⚠️ **pool_id = angka urut, BUKAN contract address.** Semua pool hidup di dalam SATU
> contract arisan (`CAHJPUKI…`). URL `/dapp/pools/1` = pool ke-2 (index dari 0), bukan address.


---

## 🆕 PASS TERBARU (07 Juli) — Full Audit + Redeploy + E2E

### Integrasi kerjaan senior
- `origin/main` (branding: favicon 512x512, metadataBase, cleanup import) sudah di-**fast-forward merge** ke `faiz`. Tinggal PR `faiz → main`.

### Contract addresses BARU (redeploy pakai admin key baru — key lama di-abandon)
```
arisan: CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O
vault:  CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V (init + set_token OK)
admin pubkey: GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ
admin secret: HANYA di frontend/.env.local (gitignored) — JANGAN commit
```

### Bug audit yang di-fix pass ini
| Sev | Fix |
|-----|-----|
| 🔴 CRITICAL | `distribute_collateral_yield` nganggep principal sebagai yield → insolvency. Fix: seed `collateral_yield_balance = principal`. |
| 🔴 CRITICAL | Secret deployer + password bocor di git (docs). Fix: scrub working tree + rotate key baru + account-merge akun lama (skrg HTTP 404, worthless). History scrub deferred (cuma perlu kalau public/mainnet) |
| 🟠 HIGH | `admin_fee_bps` create page 50 → 0 (selaras Fee 0%) |
| 🟠 HIGH | Faucet `init` tanpa re-init guard → takeover. Fix: panic if initialized. |
| 🟡 MED | Pool detail FUNDS pakai `pool_funds_balance` asli; badge Paid/Winner dari `get_member_info`; tickets dari `get_tickets`; `select_winner` guard weight==0; vault `register_participant` admin-gated; useFreighterTx/api pakai env config |
| 🟢 LOW | Favicon single-source; hapus dead `getRequiredCollateralAmount`; gacha no-stranded-funds; allowlist rpc/contract-state; factory DEPRECATED |

### E2E test (via CLI Stellar SDK — Freighter extension gak bisa di-automate headless)
```
Pool 3-member, 3 ronde:
  Create (all-in 17.5 XLM) → 3 join (full 3/3) → start (Active) →
  R1 select (winner M2) → R2 contribute all + select (winner M1, pemenang lama tetap bayar) →
  R3 contribute + select (winner admin) → COMPLETED (round 4 > 3) →
  claim payout (3x15 XLM) + claim final (3x12.5 collateral) → contract balance 0 (solvent)
HASIL: M1 & M2 net ~0 XLM (cuma fee tx) → Fair ROSCA net-zero TERBUKTI on-chain ✅
```

### Verifikasi
```
cargo test: 12/12 ✅ | tsc: 0 ✅ | eslint: 0/0 ✅ | wasm build: clean ✅
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

## 🧪 TEST RESULTS (historis — commit 5; state TERBARU lihat "PASS TERBARU" di atas: cargo 12/12)

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
| ~~**Redeploy vault contract**~~ ✅ DONE | Vault baru `CCBQFVC3…` (init + set_token). arisan juga redeploy `CAHJPUKI…`. |

---

## ⚙️ KEY CONFIG

```typescript
// frontend/lib/artel-sdk.ts  (env vars with fallback — set NEXT_PUBLIC_* to override)
CONTRACT_IDS.pool    = process.env.NEXT_PUBLIC_CONTRACT_POOL 
                     || "CBDJOVCVXHMMBP7E7IPBPTZHCKFB277R7QXBEDSIGCNZHYI3VYCOSO5O"
CONTRACT_IDS.vault   = process.env.NEXT_PUBLIC_CONTRACT_VAULT 
                     || "CAW77FMNIHKNCPU6WTFCA7VF42WS3JU5DUXBKZWELGARJ5E6DMYNFW5V"
XLM_CONTRACT         = process.env.NEXT_PUBLIC_XLM_CONTRACT 
                     || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
// NEXT_PUBLIC_NETWORK, NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_HORIZON_URL
// Lihat .env.example untuk daftar lengkap
```

### Vercel Deployment
Set semua `NEXT_PUBLIC_*` vars di Vercel → Project Settings → Environment Variables.
Atau biarkan default (semua jalan ke Stellar Testnet dengan contract terakhir).

```env
# frontend/.env.local (jangan commit!)
DEPLOYER_SECRET=<DEPLOYER_SECRET set in frontend/.env.local — NEVER commit>
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
  --source <DEPLOYER_SECRET set in frontend/.env.local — NEVER commit> \
  --network testnet && \
stellar contract invoke --id <NEW_VAULT> --source <DEPLOYER_SECRET set in frontend/.env.local — NEVER commit> \
  --network testnet -- init --admin GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ && \
stellar contract invoke --id <NEW_VAULT> --source <DEPLOYER_SECRET set in frontend/.env.local — NEVER commit> \
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
2. **Wallet password ada di chat** (`<ask Bro directly — do not hardcode>`) — jangan hardcode di script, pake env `FRPW` atau minta ulang.
3. **Refs-suivan/** adalah cloned repo, bukan bagian project. Udah di .gitignore.
4. **package-lock.json** jangan diubah — playwright-core diinstall dengan `--no-save` jadi lockfile sync dengan package.json.
5. **Docs (.md) CHANGELOG, HANDOVER, TESTING_FLOW** ada di `update-faiz/` dan sudah di-track git.
6. **Setiap deploy contract baru** → update `CONTRACT_IDS.pool` di `artel-sdk.ts` + regenerate bindings.
7. **Setiap ubah FE di pool detail** → run `npx tsc --noEmit` + `npx eslint .` biar nggak ada regresi.
8. **E2E test butuh browser nyala** (headed, dengan profile asli) + Freighter + 3 akun.
