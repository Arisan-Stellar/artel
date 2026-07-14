# 📋 ARTEL — Handover Dokumentasi Lengkap

**Untuk:** Programmer baru / AI agent baru.

> Setelah baca semua file di folder ini, kamu akan paham project dari A-Z.

## 📖 Urutan Baca

| # | File | Isi | Est. |
|---|------|-----|------|
| 1 | **PROJECT.md** | Business context, economic model, fitur | 10m |
| 2 | **TECH-STACK.md** | Teknologi, versi, alasan | 5m |
| 3 | **ARCHITECTURE.md** | Desain sistem, Blend integration | 15m |
| 4 | **CODEBASE-GUIDE.md** | Struktur folder, rules, do/don't | 10m |
| 5 | **SMART-CONTRACTS.md** | Kontrak, fungsi, state machine | 15m |
| 6 | **FRONTEND.md** | Halaman, hooks, wallet, Blend UI | 10m |
| 7 | **DEPLOYMENT.md** | Address, env vars, deploy flow | 5m |
| 8 | **CHECKPOINTS.md** | Milestones, fase, test results | 5m |
| 9 | **ROADMAP.md** | Yang belum, known issues | 5m |
| 10 | **SESSION-LOG.md** | Kronologi lengkap semua work | 15m |
| 11 | **WHAT-WE-DID.md** | Ringkasan semua pencapaian | 5m |

## 🚀 Quick Start

```bash
git clone https://github.com/Arisan-Stellar/artel.git && cd artel && git checkout faiz
cd frontend && cp .env.example .env.local && npm install && npm run dev
cd ../contracts && cargo test && stellar contract build
```

## 📇 Referensi Cepat

| Item | Value |
|------|-------|
| **Repo** | https://github.com/Arisan-Stellar/artel |
| **Branch** | `faiz` (kerja) → PR ke `main` |
| **Network** | Stellar Testnet |
| **Arisan** | `CDKJUY6T...` |
| **Vault** | `CAW77FMN...` |
| **Blend Pool** | `CCEBVDYM...` (TestnetV2) |
| **Tests** | 11/11 cargo · 0 tsc · 0 eslint · wasm clean |
| **Blend** | ✅ LIVE — supply, withdraw, harvest, yield tracking |

## ⚡ Status (15 Juli 2026)

| Area | Status |
|------|--------|
| Contracts | 4 kontrak, 11/11 tests, deployed testnet |
| Blend | ✅ Auto-supply collateral, harvest yield on-chain |
| Frontend | 18 routes, mobile menu, ESLint 0 |
| Yield tracking | Balance diff via invoke_contract::<i128> |
| CI/CD | GitHub Actions ready |
| Demo pools | 3 pools seeded |
| Vault wire | ❌ Deferred (Soroban auth blocked) |
