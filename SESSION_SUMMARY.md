# ARTEL — Session Summary

> **Proyek**: ARTEL (Arisan On-Chain — ROSCA Protocol on Stellar)
> **Target**: APAC Stellar Hackathon 2026 — Deadline 15 Juli 2026
> **Dikerjakan**: 23–26 Juni 2026 (final + design polish + landing overhaul) + 4 Juli 2026 (deploy & submission prep) + 7–8 Juli 2026 (landing page 2.0 + PR merge)

---

## SMART CONTRACTS — 4 deployed, 8/8 test pass

| Contract | Address | Lines | Features |
|----------|---------|:-----:|----------|
| `arisan-contract` | `CD5J...PH5` | 922 | Full lifecycle + token transfer + collateral 125% + 3-lapis yield |
| `yield-vault` | `CCIU...OAH` | 222 | Annual gacha, date-banded, receive_yield |
| `artel-factory` | `CCDM...ABE` | 113 | Pool registry |
| `artel-faucet` | `CBOLE...AYVX` | ~120 | XLM claim via Friendbot + cooldown |

### Verified E2E on Testnet
- Full lifecycle: init → join → start_pool → contribute ×3 → select_winner ×3 → deposit_yield → gacha → claim_final
- Pool state: `Completed`, `gacha_claimed: true`
- XLM faucet: 1-klik via Friendbot, 10,000 XLM instant delivery

---

## FRONTEND — 14/14 test pass, Build ✅, ~5,000 lines

### Storytelling Landing (`/`)
- 7 sections: Retakan, Tempaan, Nyala, Sistem, Galeri, Bukti, CTA + SceneDeck (Hero)
- GSAP + Lenis + 3D scenes, EN + ID i18n
- Branding: ARTEL gold, ROSCA PROTOCOL tagline, ArtelLogo PNG transparent
- Tagline global: **ROSCA PROTOCOL**
- Section markers commented in `page.tsx` for easy editing

### Landing Page Overhaul — 26 June 2026

| Section | Before | After |
|---------|--------|-------|
| **HERO Scene 2** (Akar) | `100M+` stat + 3 facts | **24-country ROSCA grid** (6 cols desktop). Flag + local name + country. Hover tooltip kunyit reveals ROSCA facts (Indonesia: Arisan, India: Chit Fund, Korea: Kye, etc.) |
| **HERO Scene 3** (Percikan) | `What if we brought it on-chain?` + 3 cards | `ROSCA is DeFi before DeFi had a name.` + 3 before→after pairs (Manual→Automated, Idle→Earning, Closed→Open) |
| **Section 1** (Retakan) | 1 paragraf 4 pain points | **4 problem cards** (🏃 Run-away · 💤 Idle money · 📋 Manual records · 🔒 Limited scale) + bridge: `ARTEL fixes all four` |
| **Section 2** (Tempaan) | Formula teks polos | Formula in **highlighted box** + dynamic example below counter (`Win 100 XLM → flee = lose 125 XLM → net -25`) |
| **Section 3** (Nyala) | 3 abstract cards (`Collateral` / `Dues` / `Yield`) | **Layer 1–3 mechanism cards** (DEX staking, Blend lending, vault compound) + **8–15% est. APY** prominent |
| **Section 4** (Sistem) | 9 rule cards | **5 essential rules** with emoji icons + **10/50/40 yield split bar** (red/gold/teal) |
| **Section 5** (Galeri) | `PDAX & Coins.ph` on/off-ramp | Replaced with **Stellar Network** stats ($0.00001/tx, 3–5s, no MEV). All items more technical + impactful |
| **Section 7** (CTA) | `Enter the protocol on testnet.` + footer | **Bold headline** + trust badges (Auditable/Open Source/No Admin Keys) + **3 contract addresses** with copy+explorer + secondary CTA buttons. Footer removed. |

### dApp Pages — 10 routes

| Route | Key Features |
|-------|-------------|
| `/dapp/pools` | Suivan-style pool cards (photo header, APY, avatar, stats, game-btn actions), stat cards, tab filter, create wizard modal, WalletCard |
| `/dapp/pools/[id]` | 2-column layout: pool stats, progress bar, action buttons, yield tracker, participants table, cycle winners |
| `/dapp/simulator` | Interactive sliders with preset buttons, upfront/collateral/gas cards, summary grid, anti-run math |
| `/dapp/leaderboard` | Cycle info + tier cards, stats, ranking table with tier badges, rules accordion (points + gacha + drawing) |
| `/dapp/profile` | 4 stat cards, account info + activity timeline, badges |
| `/dapp/dashboard` | WalletCard, stats, pools list, yield earnings |
| `/dapp/gacha` | Annual + pool tabs, prize tiers, ticket display, countdown |
| `/dapp/faucet` | 1-klik XLM claim, 24h cooldown countdown (h:m:s), brutal-subscribe card, pink info card |
| `/dapp/create` | Collateral calculator, form with wallet gate |
| `/dapp/faq` | 16 questions accordion, community CTA with brutal-subscribe style |

### Visual Design System
- **Background**: `#f0ead2` (dark cream) with grid dots
- **Header**: Gold kunyit `var(--color-artel)` background, logo+ARTEL+tagline link to `/`
- **Footer**: Gold kunyit with logo + text side-by-side, enlarged, link to `/`
- **AnimatedBadge**: Letter-by-letter flip animation on hover (all pages)
- **Hero layout**: 2-column — headline with text stroke + description with orange accent bar
- **Card System**: Uiverse.io `.card` style (seoulchik) for profile/leaderboard/simulator, brutal-subscribe variants

### Design Polish — 25 June 2026
| Page | Changes |
|------|---------|
| **Header (all dApp)** | Logo+ARTEL+ROSCA PROTOCOL click → landing `/` |
| **Footer (all dApp)** | Logo+ARTEL+ROSCA PROTOCOL click → landing `/`, hover opacity |
| **Faucet** | Brutal-subscribe card: black → soft purple header, border tetap hitam |
| **FAQ** | Number box: rounded-full soft purple; question bg tosca soft, answer bg pink soft; desc text naturalized; label "BADGES" styled |
| **Profile** | 4 stat cards → brutal-subscribe (soft pink/magenta/tosca/orange); Account Info + Activity cards → Uiverse `.card` style; badge cards → brutal-subscribe (kuning/biru/gold); "BADGES" label with purple box; faucet button removed from WalletCard; "Connect Your Wallet" enlarged |
| **Leaderboard** | Cycle + Tiers cards → Uiverse `.card` (gold/purple); 3 stat cards → brutal-subscribe (tosca/biru/kuning); Table redesigned (black→kuning header, orange text, tier badges readable, no text-stroke); Rules accordion → 2 Uiverse cards (tosca/gold); "Your Rank" kept |
| **Simulator** | All 3 cards → Uiverse style (orange/blue/tosca); font sizes enlarged for readability |
| **Pools** | Description text: em dash removed |

### Shared Components
- `AnimatedBadge` — letter flip box for page badges
- `WalletCard` — connected wallet display (balance, address, explorer link)
- `ArtelHeader` — header with gold bg, nav, fancy connect button
- `ArtelFooter` — footer with product links matching header nav
- `BarcodeStrip`, `StatBox`, `GrainOverlay` — Suivan-ported components

### Multi-Wallet Support (4 wallets)
| Wallet | Type | Connect |
|--------|------|:------:|
| 🦊 Freighter | Extension | ✅ |
| 🌐 Albedo | Web | ✅ |
| 🐂 xBull | Ext + Mobile | ✅ |
| 🐳 Lobstr | Mobile + Web | ✅ |

### Wallet State
- `WalletContext` — global shared state, auto-detect on mount
- `useFreighterTx` — contract invocation via Freighter sign
- `useWallet()` — used by all pages for connected/not-connected states
- Fancy connect button: animation bracket lines, green hover
- Disconnect: red variant

### Action Buttons Wired
- **Pools**: Join Now + Create Pool (game-btn style)
- **Pool Detail**: Deposit, Select Winner, Start Pool, Join
- **Faucet**: Claim 10,000 XLM (1-click via Friendbot API)
- All via `useFreighterTx` → Freighter sign → RPC send

### Filters & Navigation
- Tab-style radio group (ALL/OPEN/ACTIVE/COMPLETED) — sliding gold indicator
- "Claim 10,000 XLM" + "Create Pool" — game-btn style with slide effect
- Header nav: POOLS | SIMULATOR | LEADERBOARD | PROFILE | FAQ | FAUCET
- Footer product links match header nav exactly

### Token Strategy
- **Testnet**: XLM via Friendbot (1-click, no trustline)
- **Mainnet**: USDC (SEP-41) — same contract, different token address
- ARUSDC/ARUSDC2: deployed but not used (trustline issue — documented)

---

## FAUCET
- 1-klik claim 10,000 XLM via Friendbot API
- 24h cooldown with real-time countdown (hours:minutes:seconds)
- Brutal-subscribe card for claim states (FREE XLM / Cooldown / Claimed)
- Pink info card for "How it works"
- WalletCard shows balance + address + explorer link

---

## AUDIT & SECURITY
- 4 contracts deployed, all lifecycle functions verified
- `cargo test`: 8/8 pass across all contracts
- `npm test`: 14/14 pass
- `next build`: success (10 routes compiled)
- Target: `wasm32v1-none` compatible with Stellar CLI 27.0.0

---

## DOCUMENTATION
| File | Purpose |
|------|---------|
| `SPEC.md` | Full technical spec (IPFS metadata section added) |
| `PLAN_ARTEL.md` | SUI→Stellar migration blueprint |
| `HACKATHON_INFO.md` | Competition intel, prize breakdown, judging weights, bootcamp intel |
| `SECURITY_AUDIT.md` | 25 findings, all fixed |
| `AUDIT_FINAL.md` | Pre-deployment audit |
| `RECOMMENDATION.md` | Frontend/backend architecture |
| `SESSION_SUMMARY.md` | This file |

---

## TODO — Before 15 July Deadline

| Priority | Task | Status |
|----------|------|:------:|
| 🟢 P1 | Design polish all dApp pages | ✅ |
| 🔴 P0 | Push to public GitHub repo | ✅ |
| 🔴 P0 | Deploy frontend to Vercel | ✅ |
| 🔴 P0 | Create pitch deck (5 min) | ❌ |
| 🔴 P0 | Record demo video (2-3 min) | ❌ |
| 🟡 P2 | Blend Protocol vault integration | 🔄 In Progress |
| 🟡 P2 | IDR anchor research | ❌ |

---

## SESSION — 7–8 Juli 2026

### Landing Page 2.0 — Full Overhaul

**Hero Section (SceneHero)**
- **Three.js globe** — Bumi berputar 3D dengan 24 titik ROSCA dunia (flag + country + local name)
- Drag to rotate, scroll to zoom, auto-rotate
- 2800 bintang starfield, atmosfer rim glow, cloud layer
- Procedural earth texture (biome colors, ice caps, continental shelf)
- Label anti-tumpuk (auto-declutter algorithm)
- Marquee ROSCA definition di bottom

**Hero Section 2 (SceneAkar) — APAC 20 Countries**
- Peta APAC di tengah dengan CSS filter kunyit
- 8 card desktop (kiri-kanan) + 12 mobile (grid)
- Card style: Uiverse.io black card + gold/cyan gradient glow, hover rotate -90deg
- Bottom marquee: stat + 20 negara scroll (flag, country, ROSCA name)
- Indonesia dihapus (masuk Section 3)

**Hero Section 3 (ScenePercikan) — Arisan Indonesia**
- "ARISAN" watermark faded di kanan
- Abstergo-style loader animation (kunyit gold)
- Konten: penjelasan Arisan + "The Original ROSCA"
- Neo-brutalism: border-[3px] + boxShadow cards
- Problem cards: 🏃 💤 📋 🔒 (4 masalah tradisional)

**Section 1 (Retakan) — ARTEL Solution**
- 3D rotating cube ARTEL (6 faces: Arisan, ROSCA, Trust, Equity, Liquidity, Yield)
- 4 solution cards: 125% Collateral, 3-Layer Yield, Immutable Ledger, Global Permissionless
- Neo-brutalism styling (thick borders, offset shadows)
- Posisi cube: absolute top-right

### Visual Changes
| Area | Detail |
|------|--------|
| **MiniNav** | Hidden on landing page (logo + ARTEL + Launch App) |
| **StripeMarquee** | All removed; 1 Marquee between Retakan & Tempaan |
| **Favicon** | `artel-logo.png` 512×512 (ARTEL logo asli) |
| **Grid** | Section 1: kunyit; Section 3: merah (crack); All: visible |

### Infra Fixes
| Issue | Fix |
|-------|-----|
| Vercel deploy gagal (no app dir) | Root Directory → `frontend` di dashboard |
| Vercel CDN cache stale | Manual `vercel alias` refresh |
| `package-lock.json` conflict | Regenerated after merge |
| Cargo test fail (blend) | Fix `_amount` params, update test snapshot |

### PR Merges — 8 July 2026

| PR | Author | Judul | Files | Konflik |
|:--:|--------|-------|:-----:|:-------:|
| #3 | Faiz | Audit bugfix + redeploy + E2E | 31 | package-lock |
| #4 | Edwin | Yield 3 updates (Blend integration) | 21 | pools/[id], bindings, SDK |

**Resolusi:**
- PR #3: 1 konflik (`package-lock.json`) — regenerated
- PR #4: 3 konflik — kept Edwin's dApp changes
- Contract fix: `blend_supply`/`blend_withdraw` unused params → `#[allow(unused_variables)]`
- Test `test_collateral_yield_no_phantom`: updated from `distribute_collateral_yield` → `harvest_yield`

### Key Decisions — 8 July
1. **Indonesia excluded from APAC section** — dedicated Section 3 for Arisan deep dive
2. **Neo-brutalism design system** — `border-[3px]` + `boxShadow: 4px 4px 0` as standard
3. **Three.js globe** instead of static hero — interactive world map with ROSCA markers
4. **Vercel auto-deploy** now works via GitHub integration

### GitHub
- Repo: **https://github.com/Arisan-Stellar/artel** (public)
- 290 files pushed, **only `README.md`** (all internal `.md` docs excluded via `.gitignore`)
- Invite **Faiz-abdurrachman** — role Write (smart contract + backend)
- README.md: professional "wow-level" — architecture diagram, state machine, contract addresses, quick start, security, design system, all 7 landing sections documented

### Vercel
- Deploy: **https://artel-protocol.vercel.app**
- Project name: `artel` under `yt2025id-labs-projects`
- Build: Next.js 16.2.9, 18 routes compiled, 1m deploy
- `metadataBase` updated to `artel-protocol.vercel.app`

### Branding Fix
- Favicon replaced: Suivan → ARTEL gold "A" on dark background (`icon.svg` + `icon.png`)
- Old `icon.png` (2048px, Suivan-branded) replaced

### Hackathon Submission Prep
- Track selected: **Local Finance & Real World Access**
- Idea submission form answers drafted (8 questions)
- Awaiting final team names for submission
