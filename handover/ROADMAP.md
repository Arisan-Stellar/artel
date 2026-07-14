# 🗺️ ARTEL — Roadmap & Known Issues

## 🔥 NEXT STEP (Priority #1) — Blend Protocol Yield Integration

**Goal:** Integrasi beneran antara ARTEL arisan-contract dengan Blend Protocol pool 
sehingga collateral yang di-stake menghasilkan yield secara otomatis.

### Yang sudah ada (kerangka)
- ✅ `blend_address` di `ArisanConfig` (field untuk address Blend Pool)
- ✅ `blend_btoken_balance` di `Pool` struct (tracking internal)
- ✅ `blend_supply()` / `blend_withdraw()` — fungsi no-op (kerangka, belum nyala)
- ✅ `harvest_yield()` — admin bisa deposit yield manual
- ✅ `/dapp/yield` page — UI untuk yield dashboard (Edwin's PR)
- ✅ `CONTRACT_IDS.blend` di `artel-sdk.ts`

### Yang perlu dikerjakan
| # | Task | Detail |
|---|------|--------|
| 1 | **Cari Blend Pool address** | Blend Protocol v2 udah terdeploy di testnet. Pool Factory: `CDSYOAVXFY7SM5S64IZPPPYB4GVGGLMQVFREPSQQEZVIWXX5R23G4QSU`. BUTUH: address Pool spesifik yg nerima XLM & punya backstop. Cek `blend-utils/testnet.contracts.json` |
| 2 | **Import Blend SDK** | Pakai `@blend-capital/blend-contract-sdk` (Rust) atau `@blend-capital/blend-sdk` (JS). Atau langsung `env.invoke_contract` dengan format `submit` yang benar |
| 3 | **Rewrite `blend_supply`** | Bukan manggil `supply` (fungsi nggak ada), tapi **`submit` dengan `SupplyCollateral` request type**. Format: `pool.submit({ from, spender, to, requests: [{ amount, request_type: SupplyCollateral, address: XLM }] })` |
| 4 | **Rewrite `blend_withdraw`** | Sama — `submit` dengan `WithdrawCollateral` request type |
| 5 | **Fix `blend_btoken_balance` tracking** | Saat ini balance tracking kacau karena Blend no-op. Perlu sync dengan actual Blend position |
| 6 | **Aktifkan di join/create/contribute/claim** | Panggil `blend_supply` pas JOIN/CREATE (collateral) dan CONTRIBUTE (iuran). Panggil `blend_withdraw` pas CLAIM_FINAL/EXIT |
| 7 | **Deploy + test** | Redeploy kontrak → create pool → join → cek yield di `/dapp/yield` |
| 8 | **Update UI** | Tampilkan Blend Staked stat yang akurat (bukan minus), harvest yield button, live yield data |

### Diskusi yang perlu diselesaikan sebelum mulai
- **A. Supply collateral doang, atau iuran juga?** Collateral jumlah besar (≥125%) → yield signifikan. Iuran nilainya kecil → complexity vs benefit?
- **B. Harvest: manual (admin) atau otomatis?** Manual lebih hemat gas. Otomatis lebih adil tapi mahal.
- **C. Blend Pool: pakai yang udah ada atau deploy sendiri?** Cek dulu ada yg nerima XLM di testnet.
- **D. Risiko:** Blend di-hack → collateral lenyap. Liquidity crunch → yield 0. Perlu mitigasi.

---

## Priority: HIGH (sebelum mainnet)

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 2 | **Randomness upgrade** | Ganti `derive_seed` (admin-timing biasable) dengan VRF atau commit-reveal scheme. Critical untuk mainnet fairness | Medium |
| 3 | **Wire vault `register_participant`** | Auto-register member ke vault saat contribute (saat ini admin-manual lewat CLI). Ganti auth dari admin ke arisan contract address | Small |
| 4 | **Wire vault `receive_yield`** | Panggil vault dari `distribute_collateral_yield` via `env.invoke_contract`. Saat ini yield manual transfer | Medium |
| 5 | **Fee sponsorship (fee-bump)** | Backend service untuk bayar gas fee user → 0 gas fee experience | Medium |

---

## Priority: MEDIUM (UX & Polish)

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 6 | **Yield page data** | `/dapp/yield` saat ini baca data yang tidak akurat (`blend_btoken_balance` minus). Fix: hide Blend stats kalau Blend not live, atau wire ke data kontrak yang valid | Small |
| 7 | **Pool seed data** | Bikin beberapa pool demo via UI/CLI supaya ada data buat testing dashboard/leaderboard/profile | Small |
| 8 | **E2E test via browser** | Setup Playwright/Freighter integration (terkendala extension injection di headless). Atau bisa pakai manual test guide di README | Medium |
| 9 | **i18n completeness** | Lengkapi terjemahan EN + ID untuk semua halaman (yield page belum fully translated) | Medium |
| 10 | **Mobile responsive** | Cek semua halaman di mobile — beberapa card/button mungkin perlu adjustment | Small |

---

## Priority: LOW (Nice-to-have)

| # | Item | Detail | Effort |
|---|------|--------|--------|
| 11 | **Git history scrub** | Force-push `git filter-repo` untuk hapus secret lama dari history. BUTUH KOORDINASI 1 TIM (rewrite shared history → semua re-clone). Saat ini secret sudah worthless (akun lama HTTP 404). Cuma perlu kalau repo go public/mainnet | Medium |
| 12 | **ESLint cleanup** | 5 errors pre-existing dari Edwin (`yield/page.tsx`: `any` types, unescaped entities) | Small |
| 13 | **Remove deprecated code** | Hapus `artel-factory`, `artel-faucet` dari build + references. Atau biarin with DEPRECATED marker | Small |
| 14 | **Automated CI/CD** | GitHub Actions untuk auto-run `cargo test` + `tsc` + `eslint` on PR | Small |
| 15 | **On-chain event indexing** | Index events (`poolnew`, `memjoin`, `winsel`, `contrib`, `winclaim`, `finclaim`) untuk dashboard yang lebih responsif (ganti polling API) | Large |

---

## Known Issues (Not Fixed)

| # | Issue | Impact | Workaround |
|---|-------|--------|------------|
| **P1** | `blend_btoken_balance` not accurate (minus values) | Stat Blend di UI misleading | Hide Blend stats until integration live |
| **P2** | `yield_balance` always 0 (no real yield) | Yield page shows zeros | Works as expected — yield requires Blend or manual deposit |
| **P3** | `/dapp/yield` page 5 ESLint errors | Lint warnings, doesn't affect build | Accept for now |
| **P4** | `select_winner` panic if all weights = 0 (edge case after multiple slashes) | Cannot select winner if all members inactive | Fixed: assert `weight_sum > 0` — will show clear error |
| **P5** | `harvest_yield` requires admin manual deposit | Not automated | Works as designed — admin manually triggers |
| **P6** | Vault date check uses approximate day-of-year | Off by 1 day in leap years | Acceptable for hackathon |
| **P7** | Wallet password + old deployer secret visible in git history | Cosmetic (accounts are dead) | Scrub deferred |
| **P8** | Freighter extension API not injectable via headless Playwright | Cannot fully automate browser E2E tests | Use CLI for contract testing, manual for browser UI testing |

---

## Deprecated Contracts

| Contract | Status | Why |
|----------|--------|-----|
| `artel-factory` | DEPRECATED | "1 contract → many pools" architecture doesn't need a registry |
| `artel-faucet` | Unused | App uses Friendbot (`/api/faucet`); contract can't mint XLM native SAC |
| Old arisan `CAHJPUKI...` | Abandoned | Replaced by `CBDJOVCV...` (Blend framework) |
| Old vault `CCBQFVC3...` | Abandoned | Replaced by `CAW77FMN...` |
