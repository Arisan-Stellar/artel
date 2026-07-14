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
