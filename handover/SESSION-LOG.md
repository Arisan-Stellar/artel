# 📅 ARTEL — Session Log (Chronological)

## Session 1: 7 Juli 2026
**Focus:** Audit + Bugfix

- Full codebase audit → 18 bugs found
- Critical: old deployer secret in git → account-merged to worthless
- Critical: phantom yield insolvency → seeded `collateral_yield_balance`
- Admin key rotated → `artel-admin-v2`
- Contracts redeployed
- Full E2E lifecycle verified
- PR #3: faiz → main (MERGED)

## Session 2: 8 Juli 2026
**Focus:** Merge + Redeploy + UI

- Merged Edwin's main into faiz (PR #4 Edwin: yield, gacha, landing)
- Fixed compile errors post-merge
- Redeployed with Blend no-op (Blend wasn't deployed yet)
- UI fixes: Pool Created text, filter tabs, error messages, navigation

## Between Sessions (8-14 Juli)
**Focus:** Blend Protocol Research + Integration

- Discovered Blend TestnetV2 pool exists
- Rewrote `blend_supply()`/`blend_withdraw()` from no-op → real calls
- `authorize_as_current_contract` pattern implemented
- `harvest_blend_yield()` implemented
- Bugfix: `select_winner` was withdrawing from Blend
- Bugfix: `disburse_pool_yield_gacha` was withdrawing from Blend
- E2E verified: 3 rounds, 3 winners

## Session 3: 14-15 Juli
**Focus:** Polish + Infrastructure

- ESLint cleanup (4 → 0 errors)
- Demo pools seeded (E2E Blend, Micro Arisan, Premium Circle)
- Randomness upgrade (multiplicative nonce)
- Bugfix: `exit()` missing blend_withdraw
- Bugfix: `claim_final()` over-withdraw from Blend
- Mobile hamburger menu
- CI/CD GitHub Actions

## Session 4: 15 Juli 2026
**Focus:** Vault Wire + Mobile + i18n + E2E + UI Fixes

(8:00-17:00 WIB)

### Pagi: Vault Wire
- Cross-contract auth pattern: `authorize_as_current_contract` → vault
- Modified `create_pool()`, `join()`, `contribute()` to auto-register
- Modified `register_participant()` in vault: `admin.require_auth()` → `arisan.require_auth()`
- Cargo test 11/11 ✅
- Deployed vault + arisan baru
- E2E verified: create → join → start → contribute → vault registered

### Siang: i18n
- Extended Dict type with dApp section (~150 keys)
- EN + ID dictionaries for all pages
- LocaleProvider + language toggle in dApp header
- All 11 dApp pages i18n'd
- tsc 0, eslint 0 ✅

### Sore: Mobile Polish
- Pool detail: address truncation, join button responsive
- Yield page: address truncation less aggressive, header stacks mobile
- Hamburger backdrop overlay
- Cross-browser testing

### E2E Tests
- Playwright setup: 8 test files, 4 projects (chromium, mobile, tablet, freighter)
- 203 tests passing, 0 failed
- Navigation, pools, pool detail, yield, i18n, responsive, full flow

### Bugfixes (malam)
- `--color-purple` / `--color-muted` undefined → added to globals.css
- Tabs filter: z-index issue on active state, changed text to white
- Landing page: fixed 4 missing CSS variables (--color-ink, --color-text, --color-surface, --color-base)
- Launch App button: redesigned with brutalist shadow + animated arrow
- Yield page: fixed card layout when address + harvest button cramped
- Freighter connect: removed `isConnected()` check blocking first-time connection

### CI/CD Fixes
- Node 20 → 22 (utf-8-validate requires node >=22)
- `userDataDir` removed from playwright config
- `utf-8-validate@5.0.10` added as optionalDependency

### Demo Video Kit
- Created `demo-video/` folder
- 5 files: README, SCRIPT (EN/ID), SHOTLIST, FLOW, CHEATSHEET
- ~8 min script across 11 scenes

### Documentation
- Complete handover rewrite (14 files)
- ~3000 lines of documentation
- Git rules added (dual remote)
- AI onboarding prompt updated

## Total Commits on faiz: 28
```
9302365 docs: demo video production kit
44d895d fix: yield page card layout
883eb92 fix: tabs filter active text
7e3dd5d feat: redesign Launch App button
c13ac7a fix: Freighter connect
5d934c1 fix: landing page CSS
b0141e1 fix: playwright config
922542e ci: fix npm ci
711625d test: fix mobile viewport
4fffb0c test: add Playwright E2E tests
a9bd9f3 fix: invisible text
cf12fab feat: i18n all dApp pages
1e1cef4 fix: mobile responsive
cfb98b1 feat: vault wire
... (14 more below)
```
