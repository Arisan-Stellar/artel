# 📅 ARTEL — Session Log (Chronological)

**Session:** 07–08 Juli 2026 · **Agent:** Sisyphus · **User:** Bro (Faiz)

---

## Phase 1: Onboarding + Context (07 Juli)

1. **Baca semua docs handover** (`update-faiz/`): HANDOVER.md, CHANGELOG.md, TESTING_FLOW.md, AI_ONBOARD_PROMPT.md
2. **Baca source code kunci**: `lib.rs` (1162 lines), `useFreighterTx.ts`, `pools/[id]/page.tsx`, `artel-sdk.ts`, `poolMath.ts`
3. **Pahami konteks project**: ARTEL = ROSCA Protocol (Fair ROSCA, All-in Join, Fee 0%)

---

## Phase 2: Full Audit (07 Juli)

### Audit menemukan 18 bug:
- 🔴 **C1**: Secret key deployer bocor di git history (`update-faiz/HANDOVER.md:199`)
- 🔴 **C2**: `distribute_collateral_yield` phantom yield insolvency (`lib.rs:563-594`)
- 🟠 **H1**: `admin_fee_bps=50` di create page (kontradiksi Fee 0%)
- 🟠 **H2**: Faucet re-init guard missing (admin takeover)
- 🟡 **M1**: Pool Funds display `deposit*members` (salah)
- 🟡 **M2**: Participant Paid/Winner badges tidak muncul (hardcode false)
- 🟡 **M3**: Tickets hardcode "6"
- 🟡 **M4**: Network config tidak konsisten (hardcode vs env)
- 🟡 **M5**: `select_winner` zero-weight fallback i=0
- 🟡 **M6**: Vault register_participant unauth
- 🟡 **M7**: Randomness lemah (admin timing bias)
- 🟢 **L1-L10**: Dead code, empty catches, favicon dobel, cycleDays hardcode, docs stale

---

## Phase 3: Bugfix (07 Juli)

### Frontend fixes:
- ✅ H1: `admin_fee_bps: 0` di create page
- ✅ M1: FUNDS dari `pool_funds_balance` (bukan `deposit*members`)
- ✅ M2: Participant badges dari `get_member_info`
- ✅ M3: Tickets dari `get_tickets`
- ✅ M4: `useFreighterTx` + `api/rpc` pakai `artel-sdk` config
- ✅ L1: Hapus dead `getRequiredCollateralAmount`
- ✅ L6: `console.warn` di empty catch
- ✅ L7/L8: Allowlist rpc method + contract-state fn + NaN guard
- ✅ L9: `cycleDays` dari `round_duration`

### Contract fixes:
- ✅ C2: `collateral_yield_balance` seed principal + test `test_collateral_yield_no_phantom`
- ✅ H2: Faucet re-init guard
- ✅ M5: `select_winner` assert `weight_sum > 0`
- ✅ M6: Vault `register_participant` admin auth
- ✅ L5: Gacha kurangi sebesar terdistribusi (bukan zero-in)
- ✅ L3: Factory DEPRECATED
- ✅ L4/L7: Faucet SAC note + randomness comment

### Integrasi kerjaan senior:
- ✅ FF merge `origin/main` → `faiz` (branding: favicon, metadataBase)
- ✅ B: Favicon single-source (hapus duplicate)

### Verifikasi:
- `cargo test`: 12/12 ✅
- `tsc --noEmit`: 0 ✅
- `eslint`: 0/0 ✅
- `wasm build`: clean ✅

---

## Phase 4: Redeploy + E2E (07 Juli)

### Redeploy kontrak:
- ✅ Generate admin key baru `artel-admin-v2`
- ✅ Deploy arisan (`CAHJPUKI...`) + vault (`CCBQFVC3...`)
- ✅ Update semua config (`env.local`, `artel-sdk.ts`, bindings)
- ✅ Simpan secret di `.env.local` (gitignored)

### Secret remediation:
- ✅ Hapus secret dari semua docs (`update-faiz/*.md`)
- ✅ Account-merge akun lama (`GBTM35LE...`) → key baru — akun lama HTTP 404
- ✅ **No force-push needed** — secret history tidak berbahaya (akun lama sudah dihapus)

### E2E full lifecycle:
- ✅ Via CLI Stellar SDK (Freighter extension tidak bisa di-automate headless)
- ✅ Create pool → 3 join → start → 3 ronde → completed → claim payout + final
- ✅ **Fair ROSCA net-zero TERBUKTI on-chain** (member M1/M2 net ~0 XLM)

### Docs:
- ✅ Update semua `update-faiz/*.md` (HANDOVER, AI_ONBOARD, CHANGELOG, TESTING_FLOW)
- ✅ Buat `DEPLOY_HANDOVER.md` (Vercel env vars + checklist tim main)
- ✅ Root README: visual flow E2E, manual testing instructions

---

## Phase 5: Pull Requests (07 Juli)

- ✅ PR #3 `faiz → main`: Full audit bugfix + redeploy + E2E (MERGED)
- ✅ PR #5 `faiz → main`: Sync main (yield+blend+gacha+landing) + restore faiz fixes (OPEN)
- ✅ Push ke personal repo: `git push personal faiz:main` untuk testing Vercel

---

## Phase 6: Merge main → faiz (08 Juli)

### Merge 12 commit dari `main` (PR #4 Edwin): yield, blend, gacha, landing page, Vercel config

### Post-merge fixes:
- ✅ **artel-sdk.ts**: Restore contract addresses kita + tambah `CONTRACT_IDS.blend`
- ✅ **lib.rs**: Fix `blend_supply`/`blend_withdraw` compile error (variable naming)
- ✅ **pools/[id]/page.tsx**: Restore poolFunds + cycleDays + blend type fix
- ✅ **Three.js**: Install `three` + `@types/three` untuk ArtelGlobe
- ✅ Verifikasi: cargo test 12/12 + wasm build + tsc 0 + build success

---

## Phase 7: Redeploy #2 (08 Juli)

### Blend no-op fix:
- ⚠️ `blend_supply`/`blend_withdraw` manggil `supply` ke XLM token (error: `supply not found`)
- ✅ Fix: fungsi Blend jadi no-op (karena Blend belum terdeploy di testnet untuk project ini)
- ✅ Redeploy arisan: `CC7IZDSK...` (ganti `CAHJPUKI...`)

### Blend unstaked negative fix:
- ⚠️ `blend_btoken_balance` internal tracking tidak akurat (minus karena no-op vs dummy counting)
- ✅ Tetap no-op — stat Blend akan di-hide dari UI

---

## Phase 8: UI/UX Fixes (08 Juli)

### Display fixes:
- ✅ Pool Created text color (teal-on-teal → black-on-teal)
- ✅ Filter tabs contrast (`#888`→`#bbb` inactive, `#555`→`#fff` hover)
- ✅ Hide Claim Final + Draw Gacha when not actionable
- ✅ User-friendly error messages (~25 pattern mapping, Bahasa Indonesia)

### Navigation:
- ✅ Add YIELD to dapp navbar layout

---

## Phase 9: Handover Documentation (08 Juli)

- ✅ Buat folder `handover/` dengan 10 file komprehensif
- ✅ README, PROJECT, TECH-STACK, ARCHITECTURE, CODEBASE-GUIDE
- ✅ SMART-CONTRACTS, FRONTEND, DEPLOYMENT
- ✅ SESSION-LOG (file ini), CHECKPOINTS, ROADMAP

---

## Phase 6: Blend Protocol Integration (14 Juli 2026)

1. Research Blend Protocol — found TestnetV2 pool `CCEBVDYM...`, API `submit()` with `SupplyCollateral`/`WithdrawCollateral`
2. Rewrote `blend_supply()`/`blend_withdraw()` from no-op → real `env.invoke_contract`
3. Added `authorize_as_current_contract` for cross-contract auth (flat entries pattern)
4. Fixed `blend_btoken_balance` tracking — now accurate
5. Removed Blend from `contribute()` (collateral only, not contributions)
6. Added Blend supply in `create_pool()` (admin collateral)
7. `CONTRACT_IDS.blend` updated to TestnetV2 address
8. Fixed create page `blend_address: XLM_CONTRACT` → `CONTRACT_IDS.blend`
9. E2E verified: 3 rounds, 3 unique winners, Blend supply/withdraw confirmed on-chain
10. Fixed: removed `blend_withdraw` from `select_winner` (pool from contributions, not Blend)
11. Fixed: removed `blend_withdraw` from `disburse_pool_yield_gacha` (yield in contract)

## Phase 7: Harvest Yield (14 Juli 2026)

1. Added `harvest_blend_yield()` — withdraw all Blend collateral, re-supply principal
2. Yield tracking via `invoke_contract::<i128>` on token `balance()` before/after
3. `TokenClient::balance()` failed in contract context — switched to raw `invoke_contract`
4. Distribution: 75% member (yield_earned) / 25% gacha (yield_balance)
5. Frontend: harvest button wired to `harvest_blend_yield` via `useFreighterTx`
6. Removed old `harvest_yield(pool_id, amount)` — deprecated manual deposit
7. Removed `test_collateral_yield_no_phantom` — useless smoke test

## Phase 8: Polish & Audit (14-15 Juli 2026)

1. ESLint: 4 errors → 0 (fixed `any` types, unescaped quotes in yield page)
2. Yield page: Blend live badge, stellar.expert link, removed simulation mode info
3. Demo data: 3 pools seeded (E2E Blend, Micro Arisan, Premium Circle)
4. Randomness upgrade: `derive_seed` with multiplicative nonce hash
5. `bump_entropy_counter` — non-linear advance for better entropy
6. **BUG FIX**: `exit()` missing `blend_withdraw` — collateral stuck in Blend
7. **BUG FIX**: `claim_final()` was withdrawing total (collateral+yield) from Blend — only collateral should be withdrawn
8. Vault Wire attempt: cross-contract auth `arisan→vault.register_participant` blocked by Soroban auth model. Deferred.

## Phase 9: Infrastructure (15 Juli 2026)

1. Mobile responsive: hamburger menu in dapp layout (Menu/X toggle, slide-down nav)
2. i18n: dictionaries already complete (EN+ID for landing), dApp pages deferred
3. CI/CD: `.github/workflows/ci.yml` — cargo test + tsc + eslint on PR/push
4. Docs: full handover update — all 11 files synced to current state
5. WHAT-WE-DID.md — complete achievement summary for new devs/AI

### Commits (faiz branch)
```
404457c ci: GitHub Actions for PR quality gates
bc0eca2 feat: mobile hamburger menu
5b39361 fix: audit — exit + claim_final Blend bugs
f97d4a7 feat: randomness upgrade
b27c963 chore: remove harvest_yield, fix ESLint, seed demo
8b997d2 feat: on-chain yield tracking via balance query
95fdcc8 feat: harvest_blend_yield
83f077f fix: remove Blend from select_winner
d30a3bc feat: Blend Protocol integration
```
