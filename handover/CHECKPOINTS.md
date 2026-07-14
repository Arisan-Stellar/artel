# ✅ ARTEL — Checkpoints & Verifications

## State Saat Ini (08 Juli 2026)

| Item | Status | Detail |
|------|--------|--------|
| **Contract live** | ✅ Running | arisan `CBDJOVCV...`, vault `CAW77FMN...` |
| **Contract tests** | ✅ 12/12 | arisan 9, factory 1, faucet 1, vault 1 |
| **TypeScript** | ✅ 0 errors | `tsc --noEmit` |
| **ESLint** | ⚠️ 5 errors | Pre-existing dari Edwin (yield page: `any` types, unescaped entities) |
| **WASM build** | ✅ Clean | Semua 4 kontrak ke-build |
| **Frontend build** | ✅ Success | 18 routes compiled |
| **E2E lifecycle** | ✅ Passed | Net-zero terbukti on-chain |
| **Secret security** | ✅ Neutralized | Old key account-merged (404) |
| **History scrub** | 📌 Deferred | Cuma perlu kalau go public/mainnet |
| **Blend integration** | 🚧 Framework only | Functions no-op, belum terhubung ke Blend asli |

---

## Checklist Per Fase

### Fase A: Merge Branding Senior
- [x] FF merge `origin/main` → `faiz` (zero conflict, 3 file)
- [x] Baseline: tsc 0, eslint 0/0, cargo test all pass

### Fase B: Favicon Fix
- [x] Layout.tsx hapus duplicate `icons` block
- [x] Single source: `app/icon.png` (Next.js file convention)

### Fase C: Frontend Bugs
- [x] H1: `admin_fee_bps: 0` (create page)
- [x] M1: FUNDS from `pool_funds_balance`
- [x] M2: Participant badges (paid/won) from `get_member_info`
- [x] M3: Tickets from `get_tickets`
- [x] M4: Env-driven network config (`useFreighterTx`, `api/rpc`)
- [x] L1: Remove dead `getRequiredCollateralAmount`
- [x] L6: Surface empty catch errors
- [x] L7/L8: Input allowlists + NaN guard
- [x] L9: `cycleDays` from `round_duration`
- [x] Gate: tsc 0, eslint 0/0

### Fase D: Contract Bugs
- [x] C2: `collateral_yield_balance` seed principal
- [x] H2: Faucet re-init guard
- [x] M5: `select_winner` zero-weight guard
- [x] M6: Vault `register_participant` admin auth
- [x] L5: Gacha no stranded funds
- [x] L3/L4/M7: Comments/notes
- [x] Gate: cargo test 12/12, wasm build clean

### Fase E: Redeploy #1
- [x] Generate admin key `artel-admin-v2` + fund
- [x] Deploy arisan + vault + init
- [x] Update `env.local`, `artel-sdk.ts`, bindings, docs
- [x] Gate: `get_pool_count = 0`, vault state init

### Fase F: Secret Remediation
- [x] Scrub secret from working tree docs
- [x] Account-merge old key → new key (akun lama 404)
- [x] Script filter-repo siap (deferred)
- [x] Gate: `grep SAK3TEOBY` → CLEAN working tree

### Fase G: E2E Test
- [x] CLI lifecycle test (Fresh pool → 3 ronde → completed → claims)
- [x] 3 winners unique (fair ROSCA)
- [x] Net-zero verified on-chain
- [x] Gate: Horizon balances show net ~0

### Fase H: Docs + README
- [x] Update semua `update-faiz/*.md`
- [x] Root README: visual flow + manual testing
- [x] `DEPLOY_HANDOVER.md` untuk tim main/Vercel
- [x] `handover/` folder dengan 10 file komprehensif

### Fase I: Merge main → faiz
- [x] Pull 12 commit dari `origin/main` (Edwin yield/blend/gacha)
- [x] Resolve 4 file konflik (artel-sdk, lib.rs, create, pools/[id])
- [x] Fix `blend_supply`/`blend_withdraw` compile error
- [x] Restore poolFunds, cycleDays, contract addresses
- [x] Gate: cargo 12/12 + tsc 0 + build

### Fase J: Redeploy #2
- [x] Build wasm dengan Blend fix
- [x] Redeploy: `CC7IZDSK...` + `CAW77FMN...`
- [x] Update semua config + docs ke address baru
- [x] Gate: fresh contract, pool_count = 0

### Fase K: Vercel Fix
- [x] Lockfile sync: `@emnapi/runtime`, `@emnapi/core`, `bufferutil`
- [x] `npm ci` success
- [x] Gate: `npm run build` success (17 routes)

### Fase L: UI/UX Fixes
- [x] Pool Created text kontras
- [x] Filter tabs contrast + hover
- [x] Hide Claim Final + Draw Gacha when not actionable
- [x] User-friendly error mapping
- [x] YIELD navbar

### Fase M: PRs
- [x] PR #3: Audit + redeploy + E2E (MERGED)
- [x] PR #5: Sync main + faiz fixes (OPEN)
- [x] Push ke personal repo (Vercel testing)
