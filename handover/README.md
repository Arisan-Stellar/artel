# 📋 ARTEL — Handover Dokumentasi Lengkap

**Untuk:** Programmer baru / AI agent baru.
**Versi:** 15 Juli 2026

> Setelah baca semua file di folder ini, kamu akan paham project dari A-Z.

---

## 📖 Urutan Baca (rekomendasi)

| # | File | Isi | Waktu |
|---|------|-----|-------|
| 1 | **AI-ONBOARD.md** | Prompt lengkap buat AI baru (copy-paste) | 2m |
| 2 | **PROJECT.md** | Business context, economic model, fitur | 10m |
| 3 | **TECH-STACK.md** | Teknologi, versi, alasan pemilihan | 5m |
| 4 | **ARCHITECTURE.md** | Desain sistem, Blend integration, flow | 15m |
| 5 | **CODEBASE-GUIDE.md** | Struktur folder, coding rules, patterns | 10m |
| 6 | **SMART-CONTRACTS.md** | Kontrak, fungsi, state machine | 15m |
| 7 | **FRONTEND.md** | Halaman, hooks, wallet, i18n | 10m |
| 8 | **DEPLOYMENT.md** | Address, env vars, deploy flow | 5m |
| 9 | **GIT-RULES.md** | Remote setup, commit rules, CI/CD | 5m |
| 10 | **CHECKPOINTS.md** | Milestones, test results, E2E | 5m |
| 11 | **WHAT-WE-DID.md** | Ringkasan semua pencapaian | 5m |
| 12 | **SESSION-LOG.md** | Kronologi lengkap semua work | 15m |
| 13 | **ROADMAP.md** | Yang belum, known issues, backlog | 5m |

---

## 🚀 Quick Start (30 detik)

```bash
# Clone repo
git clone https://github.com/Faiz-abdurrachman/artel.git
cd artel

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Buka http://localhost:3000

# Contracts
cd ../contracts
cargo test
stellar contract build
```

---

## 📊 Status Project (15 Juli 2026)

| Area | Status |
|------|--------|
| **Contracts** | 4 kontrak, 11/11 test, deployed testnet |
| **Blend Protocol** | ✅ LIVE — supply, withdraw, harvest, yield tracking |
| **Vault Wire** | ✅ LIVE — auto-register ke gacha vault |
| **Frontend** | 11 halaman, mobile responsive, ESLint 0 |
| **i18n** | ✅ EN + ID — semua halaman dApp bilingual |
| **E2E Tests** | ✅ 203 Playwright tests, 0 failed |
| **CI/CD** | ✅ GitHub Actions: cargo test + tsc + eslint |
| **Demo pools** | 3 pools seeded on testnet |
| **Landing page** | ✅ Full storytelling, Triple Yield, CTA |

### Contract Addresses (Active)

| Contract | Address |
|----------|---------|
| **arisan** | `CBVWEPXBBCPAK2A3NCCKIP6ORYB32VH3OKRQBUWNSMONQC5KEORPEQSN` |
| **vault** | `CA65HU7KGU4EU4DGQYEQCCUBHAHFW6BOGCOKVRIIYGOOSYLSDH5WLIR7` |
| **XLM (SAC)** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| **Blend Pool** | `CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF` (TestnetV2) |

### Admin Key

| Item | Value |
|------|-------|
| Alias | `artel-admin-v2` |
| Pubkey | `GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ` |
| Secret | Di `frontend/.env.local` (gitignored) |

---

## 📁 Struktur Repo

```
.
├── contracts/          # Smart contracts Rust (Soroban SDK 22.0.0)
│   ├── arisan-contract/ # Core ROSCA pool (1311 lines)
│   ├── yield-vault/     # Gacha vault (242 lines)
│   ├── artel-factory/   # Pool registry (113 lines)
│   └── artel-faucet/    # Testnet faucet (66 lines)
│
├── frontend/           # Next.js 16 + React 19 (Vercel root)
│   ├── app/            # Pages & layouts
│   │   ├── page.tsx    # Landing page (7 sections)
│   │   ├── dapp/       # dApp pages (11 halaman)
│   │   └── api/        # API routes
│   ├── components/     # UI + section components
│   ├── hooks/          # WalletContext, useFreighterTx
│   └── lib/            # artel-sdk, i18n, poolMath
│
├── e2e/                # Playwright E2E tests (203 tests)
├── handover/           # Dokumentasi (file ini)
├── demo-video/         # Script + shot list buat demo
└── .github/            # CI/CD workflows
```

---

## 🔐 Git Rules (WAJIB)

Ada 2 remote:
```
origin    → https://github.com/Arisan-Stellar/artel.git     (org)
origin    → https://github.com/Faiz-abdurrachman/artel.git   (personal - dual push)
personal  → https://github.com/Faiz-abdurrachman/artel.git   (personal)
```

**Aturan:**
1. ✅ **Commit local dulu** — jangan push sebelum direview
2. ❌ **Jangan push ke main langsung** — selalu lewat PR
3. ❌ **Jangan merge ke faiz** — tanpa izin
4. ✅ **Branch `faiz`** — tempat kerja
5. ✅ **Push bisa ke 2 remote** — `git push` ke personal, `git push origin faiz` ke org+personal

---

## 🧪 Quality Gates (Always Passing)

| Gate | Command | Status |
|------|---------|--------|
| Rust tests | `cd contracts && cargo test` | 11/11 ✅ |
| WASM build | `cd contracts && stellar contract build` | 4/4 clean ✅ |
| TypeScript | `cd frontend && npx tsc --noEmit` | 0 errors ✅ |
| ESLint | `cd frontend && npx eslint . --quiet` | 0 errors ✅ |
| E2E | `cd frontend && npx playwright test` | 203 passed ✅ |

---

## 🔗 Quick Links

| Link | URL |
|------|-----|
| Repo | https://github.com/Faiz-abdurrachman/artel |
| Vercel | https://vercel.com/yt2025id-labs-projects/artel |
| Blend Pool | https://stellar.expert/explorer/testnet/contract/CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF |
