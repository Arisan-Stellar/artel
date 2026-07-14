# 📋 ARTEL — Handover Dokumentasi Lengkap

**Tujuan:** Dokumen ini dibuat untuk onboarding **programmer baru** atau **AI agent baru**
yang akan melanjutkan development ARTEL. Baca berurutan dari atas ke bawah.

> **Setelah baca semua file di folder ini, kamu akan paham:**
> - Project ini tentang apa dan kenapa dibuat
> - Teknologi apa yang dipakai dan kenapa
> - Arsitektur sistem secara keseluruhan
> - Cara setup dan menjalankan project
> - Semua yang sudah dikerjakan sejauh ini
> - Apa yang masih perlu dikerjakan

---

## 📖 Urutan Baca (direkomendasikan)

| # | File | Isi | Estimasi |
|---|------|-----|----------|
| 1 | **`PROJECT.md`** | Project overview, business context, economic model (Fair ROSCA, All-in Join, Fee 0%) | 10 min |
| 2 | **`TECH-STACK.md`** | Semua teknologi, versi, alasan pemilihan | 5 min |
| 3 | **`ARCHITECTURE.md`** | Desain sistem, kontrak, frontend, data flow, wallet integration | 15 min |
| 4 | **`CODEBASE-GUIDE.md`** | Struktur folder, file kunci, conventions, rules, do's & don'ts | 10 min |
| 5 | **`SMART-CONTRACTS.md`** | Semua kontrak, fungsi, state machine, known issues, Blend status | 15 min |
| 6 | **`FRONTEND.md`** | Halaman, komponen, hooks, wallet, error handling, UI fixes | 10 min |
| 7 | **`DEPLOYMENT.md`** | Contract addresses, env vars, Vercel setup, deploy flow | 5 min |
| 8 | **`SESSION-LOG.md`** | Kronologi lengkap semua yang dikerjakan (audit, fix, redeploy, docs) | 15 min |
| 9 | **`CHECKPOINTS.md`** | Milestones, test results, verifikasi di tiap fase | 5 min |
| 10 | **`ROADMAP.md`** | Yang belum selesai, known issues, next steps, Blend integration plan | 5 min |

---

## 🚀 Quick Start (kalau cuma mau langsung jalanin)

```bash
# 1. Clone
git clone https://github.com/Arisan-Stellar/artel.git
cd artel
git checkout faiz

# 2. Frontend
cd frontend
cp .env.example .env.local   # udah ada fallback, optional
npm install
npm run dev                   # http://localhost:3000

# 3. Contracts
cd ../contracts
cargo test                    # 12/12 tests
stellar contract build        # build semua wasm
```

---

## 📇 Referensi Cepat

| Item | Value |
|------|-------|
| **Repo** | https://github.com/Arisan-Stellar/artel |
| **Branch kerja** | `faiz` |
| **Branch production** | `main` |
| **Network** | Stellar Testnet |
| **Contracts (live)** | arisan `CBDJOVCV...`, vault `CAW77FMN...` |
| **Build status** | cargo 12/12 · tsc 0 · eslint 5 (pre-existing) · wasm clean |
| **PRs** | #3 (merged), #5 (open) |
