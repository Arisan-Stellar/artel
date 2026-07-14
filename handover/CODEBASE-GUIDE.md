# 📁 ARTEL — Codebase Guide

## Folder Structure

```
artel/
├── contracts/                    # Rust smart contracts
│   ├── arisan-contract/          # ⭐ Core ROSCA pool (1240 lines)
│   ├── yield-vault/              # Annual gacha vault (242 lines)
│   ├── artel-factory/            # Pool registry (DEPRECATED — not used)
│   └── artel-faucet/             # Testnet faucet (unused — app uses friendbot)
│
├── frontend/                     # Next.js 16 frontend
│   ├── app/
│   │   ├── api/                  # API proxy routes → Soroban RPC
│   │   │   ├── contract-state/   # View function proxy (get_state, get_config, etc.)
│   │   │   ├── faucet/           # Friendbot proxy
│   │   │   ├── pools/            # Pool count endpoint
│   │   │   └── rpc/              # RPC proxy (UNUSED — dead route)
│   │   ├── dapp/                 # dApp routes (authenticated area)
│   │   │   ├── pools/            # Pool listing + [id] detail (most complex page)
│   │   │   ├── create/           # Create new pool
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── leaderboard/      # Reputation ranking
│   │   │   ├── profile/          # User profile
│   │   │   ├── yield/            # Yield dashboard (Edwin's PR)
│   │   │   ├── gacha/            # Gacha page
│   │   │   ├── simulator/        # Interactive ROSCA simulator
│   │   │   ├── faq/              # FAQ page
│   │   │   ├── faucet/           # Faucet claim page
│   │   │   └── layout.tsx        # ⭐ dApp shell (header, nav, wallet connect)
│   │   ├── layout.tsx             # Root layout (metadata, fonts, favicon)
│   │   ├── page.tsx               # ⭐ Landing page (7-section storytelling)
│   │   └── globals.css            # Design system (colors, tabs, cards, badges)
│   ├── components/
│   │   ├── dapp/                  # dApp-specific components (ArtelHeader, ArtelFooter, WalletCard, AnimatedBadge)
│   │   ├── brand/                 # Brand assets (ArtelLogo, ArtelMark)
│   │   ├── scenes/                # Landing page animated scenes
│   │   ├── sections/              # Landing page sections (Retakan, Tempaan, etc.)
│   │   ├── globe/                 # Three.js ArtelGlobe component
│   │   ├── ui/                    # Shared UI (MiniNav, faucet button, etc.)
│   │   ├── fx/                    # Effects (Grain, CustomCursor, Preloader)
│   │   └── motion/                # SmoothScroll
│   ├── hooks/
│   │   ├── useFreighterTx.ts      # ⭐ Contract invocation hook (tx signing, error handling)
│   │   └── WalletContext.tsx       # ⭐ Multi-wallet provider (connect/disconnect)
│   ├── lib/
│   │   ├── artel-sdk.ts           # ⭐ Contract addresses, network config, ArtelClient class
│   │   ├── poolMath.ts            # Collateral calculation, join cost, contribution math
│   │   └── i18n/                  # EN + ID translations
│   ├── bindings/                  # Auto-generated contract TypeScript bindings
│   ├── .env.local                 # ⚠️ SECRET (gitignored) — deployer key + contract addresses
│   ├── .env.example               # Template — committed (no secrets)
│   └── next.config.ts             # Next.js config
│
├── handover/                      # 📖 Dokumentasi lengkap (folder ini)
├── update-faiz/                   # Dokumentasi lama (historical — read but don't edit)
├── .omo/                          # AI agent internal state (plans, session data — gitignored)
└── README.md                      # Project front page
```

---

## Key Files (⭐ wajib dipahami)

| File | Why Important |
|------|---------------|
| `contracts/arisan-contract/src/lib.rs` | Seluruh logic ROSCA — pool lifecycle, fair ROSCA, collateral, yield/gacha |
| `frontend/app/dapp/pools/[id]/page.tsx` | Halaman paling kompleks — pool detail, buttons, participants, yield stats |
| `frontend/hooks/useFreighterTx.ts` | Semua interaksi contract via browser wallet — signing, error mapping |
| `frontend/hooks/WalletContext.tsx` | Wallet state management — connect/disconnect multi-wallet |
| `frontend/lib/artel-sdk.ts` | Contract addresses (env vars + fallback), network config |
| `frontend/app/dapp/layout.tsx` | dApp shell — header, navbar, wallet button, footer |

---

## Important Rules (Do's & Don'ts)

### ✅ DO
- Kerja di branch `faiz`, PR ke `main`
- Pakai `NEXT_PUBLIC_*` env vars — fallback selalu ada di `artel-sdk.ts`
- Jalanin `cargo test` + `tsc --noEmit` + `eslint .` sebelum setiap commit
- Commit pesan pakai conventional commits (`fix:`, `feat:`, `docs:`, `chore:`, `merge:`)
- Kalau deploy kontrak baru → update `.env.local`, `.env.example`, `artel-sdk.ts`, bindings, docs

### ❌ DON'T
- JANGAN commit `.env.local` (ada deployer secret di dalamnya)
- JANGAN pakai `as any`, `@ts-ignore`
- JANGAN ubah `package-lock.json` sembarangan (cuma kalau `npm ci` gagal → `npm install`)
- JANGAN push ke `main` langsung — selalu lewat PR
- JANGAN hardcode contract address — pakai `CONTRACT_IDS` dari `artel-sdk.ts`

### 🔒 Security
- Deployer secret (`DEPLOYER_SECRET`) HANYA di `.env.local` (gitignored)
- JANGAN taruh `DEPLOYER_SECRET` di Vercel — app gak butuh (user sign via wallet)
- Semua `NEXT_PUBLIC_*` vars aman buat client — hanya info publik

---

## Config Flow

```
.env.local (gitignored, local only)
    ↓ override
.env.example (committed, template)
    ↓ override
artel-sdk.ts default fallback (last resort — commited)
```

Di Vercel: set `NEXT_PUBLIC_*` di dashboard → override semua di atas.

---

## Verifikasi Cepat

```bash
# Setelah perubahan kontrak
cd contracts && cargo test && stellar contract build

# Setelah perubahan frontend
cd frontend && npx tsc --noEmit && npx eslint . --quiet && npm run build
```

---

## 🆕 New Files & Patterns (Added July 2026)

### New key files
| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | GitHub Actions: cargo test + tsc + eslint on PR |
| `.omo/plans/*.md` | AI agent work plans (historical) |

### Blend Auth Pattern
```rust
// Di blend_supply() — authorize kontrak untuk panggil Blend.submit + token.transfer
env.authorize_as_current_contract(Vec::from_array(env, [
    InvokerContractAuthEntry::Contract(SubContractInvocation {
        context: ContractContext { contract: blend, fn_name: "submit", args },
        sub_invocations: vec![/* token.transfer */],
    }),
]));
let _: Val = env.invoke_contract(blend_addr, &symbol_short!("submit"), args);
```

### Cross-contract Token Balance Query
```rust
// invoke_contract::<i128> works where TokenClient doesn't
let balance: i128 = env.invoke_contract(&token, &symbol_short!("balance"), vec![addr]);
```

### Updated Rules
- ✅ `Symbol::new()` untuk function names > 9 chars (symbol_short max 9)
- ✅ `InvokerContractAuthEntry` harus flat (bukan nested) untuk Blend
- ✅ JANGAN pake `TokenClient` di cross-contract context — pake `invoke_contract::<T>`
- ✅ Setiap deploy kontrak baru → update `.env.local`, `.env.example`, `artel-sdk.ts`, docs

### Test Patterns
- `MockBlendPool` — mock Blend contract untuk unit test
- `MockVault` — mock Vault contract untuk future vault wire testing
- `env.mock_all_auths()` — skip auth checks di tests
