# 📁 ARTEL — Codebase Guide

## Root Directory Structure

```
/
├── contracts/          # Rust smart contracts (Soroban)
├── frontend/           # Next.js application (Vercel root)
├── e2e/                # Playwright E2E tests
├── handover/           # Documentation
├── demo-video/         # Demo video scripts
├── .github/            # CI/CD workflows
└── update-faiz/        # (obsolete) old docs
```

## Contracts Structure

```
contracts/
├── Cargo.toml              # Workspace
├── Makefile                # Build shortcuts
├── arisan-contract/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # ~1311 lines — All pool logic
├── yield-vault/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # ~242 lines — Gacha vault
├── artel-factory/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # ~113 lines — Pool registry (unused)
└── artel-faucet/
    ├── Cargo.toml
    └── src/
        └── lib.rs          # ~66 lines — Testnet faucet
```

### Key Contracts Sections

**arisan-contract/src/lib.rs:**
| Lines | Content |
|-------|---------|
| 1-166 | Imports, types, constants, helper functions |
| 197-259 | `blend_supply()` / `blend_withdraw()` helpers |
| 280-367 | `create_pool()` — admin creates + joins auto |
| 369-427 | `join()` — member joins with all-in |
| 433-464 | `exit()` — leave before pool starts |
| 469-483 | `start_pool()` — admin starts |
| 488-530 | `contribute()` — pay monthly dues |
| 535-573 | `slash_collateral()` — admin slashes defaulter |
| 578-660 | `select_winner()` — random weighted selection |
| 662-760 | `claim_winner_payout()` + `claim_final()` |
| 762-830 | `harvest_blend_yield()` — harvest from Blend |
| 832-960 | Query functions (get_state, get_member_info...) |
| 961-1311 | Tests (8 test functions) |

## Frontend Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (landing page shell)
│   ├── page.tsx            # Landing page (7 sections)
│   ├── globals.css         # Tailwind + custom CSS
│   ├── dapp/
│   │   ├── layout.tsx      # dApp shell (header + footer + LocaleProvider)
│   │   ├── pools/page.tsx  # Pool listing
│   │   ├── pools/[id]/page.tsx  # Pool detail
│   │   ├── create/page.tsx # Create pool form
│   │   ├── yield/page.tsx  # Yield dashboard
│   │   ├── simulator/page.tsx  # ROSCA simulator
│   │   ├── leaderboard/page.tsx  # Leaderboard
│   │   ├── profile/page.tsx # User profile
│   │   ├── faq/page.tsx    # FAQ
│   │   ├── faucet/page.tsx # Testnet faucet
│   │   ├── dashboard/page.tsx  # Dashboard
│   │   ├── gacha/page.tsx  # Gacha info
│   │   └── api/            # API routes (contract-state, pools)
│   └── components/
│       ├── dapp/           # Shared dApp components
│       ├── sections/       # Landing page sections
│       ├── ui/             # Shared UI (Button, GhostWord)
│       └── motion/         # Animation hooks
├── hooks/
│   ├── WalletContext.tsx   # Multi-wallet provider
│   └── useFreighterTx.ts   # Contract invocation helper
├── lib/
│   ├── artel-sdk.ts        # Contract client + addresses
│   ├── poolMath.ts         # Collateral calculations
│   └── i18n/               # Internationalization
│       ├── types.ts        # Dict type definitions
│       ├── en.ts           # English dictionary
│       ├── id.ts           # Indonesian dictionary
│       ├── LocaleProvider.tsx  # Context provider
│       └── dictionaries.ts # Registry
├── bindings/               # Auto-generated contract bindings
├── tests/                   # Vitest test files
├── e2e/                     # Playwright tests (8 files)
├── public/                  # Static assets
├── playwright.config.ts     # Playwright configuration
└── package.json
```

## E2E Test Structure

```
e2e/
├── navigation.spec.ts  # Nav links, hamburger (8 tests)
├── pools.spec.ts       # Pool listing, filters (5 tests)
├── pool-detail.spec.ts # Stats, participants (5 tests)
├── yield.spec.ts       # Yield page (6 tests)
├── create-pool.spec.ts # Form, wallet guard (2 tests)
├── i18n.spec.ts        # EN↔ID toggle (9 tests)
├── responsive.spec.ts  # 4 viewports × 4 pages (24 tests)
└── full-flow.spec.ts   # Wallet connect flow (3 tests, needs Freighter)
```

## Coding Rules (WAJIB)

### ✅ DO
- Kerja di branch `faiz`
- Config via `NEXT_PUBLIC_*` env vars — fallback di `artel-sdk.ts`
- Jalanin `cargo test` + `tsc --noEmit` + `eslint .` SEBELUM commit
- Commit: `fix:`, `feat:`, `docs:`, `chore:`, `merge:`, `ci:`
- Setiap deploy kontrak baru → update `.env.local`, `.env.example`, `artel-sdk.ts`
- Komit dulu, baru push setelah di-review

### ❌ DON'T
- JANGAN commit `.env.local` (ada `DEPLOYER_SECRET`)
- JANGAN push ke `main` langsung — selalu lewat PR
- JANGAN merge ke `faiz` tanpa izin
- JANGAN pakai `as any` / `@ts-ignore`
- JANGAN ubah `package-lock.json` sembarangan
- JANGAN hardcode contract address — pakai `CONTRACT_IDS` dari `artel-sdk.ts`
- JANGAN push sebelum di-review

### 🔒 Security
- Admin key `artel-admin-v2` — pubkey `GAAA6ZHL...`, secret di `.env.local` (gitignored)
- Deploy kontrak: `stellar contract deploy --wasm ... --source artel-admin-v2 --network testnet`
- User signing via wallet extension — aplikasi TIDAK pegang secret key user
