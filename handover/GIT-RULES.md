# 🔐 ARTEL — Git Rules & Workflow

## Remote Setup

Ada 2 remote:

```
origin    → https://github.com/Arisan-Stellar/artel.git     (organization)
          → https://github.com/Faiz-abdurrachman/artel.git   (personal — dual push)
personal  → https://github.com/Faiz-abdurrachman/artel.git   (personal)
```

### Dual Push Configuration

`origin` terkonfigurasi dengan **2 push URLs** — jadi `git push origin faiz` push ke org + personal sekaligus.

```bash
# Verifikasi
git remote -v
```

## Branch Strategy

| Branch | Purpose | 
|--------|---------|
| `main` | Production (org repo). Jangan commit langsung! |
| `faiz` | **Active development branch.** Semua kerjaan di sini. |

## Commit Rules

### ✅ DO
- **Commit local dulu** — jangan push sebelum direview
- Jalanin `cargo test` + `tsc --noEmit` + `eslint .` SEBELUM commit
- Commit message format: `type: message`
- Types: `fix:`, `feat:`, `docs:`, `chore:`, `merge:`, `ci:`, `test:`

### ❌ DON'T
- ❌ **Jangan push ke `main` langsung** — selalu lewat PR
- ❌ **Jangan merge ke `faiz`** — tanpa izin Faiz
- ❌ **Jangan merge `faiz` ke `main`** — tanpa izin
- ❌ **Jangan push sebelum di-review**
- ❌ Jangan commit `.env.local` (ada `DEPLOYER_SECRET`)
- ❌ Jangan pakai `as any` / `@ts-ignore`
- ❌ Jangan ubah `package-lock.json` sembarangan

## Push Commands

```bash
# Push ke personal repo — faiz dikirim sebagai main
git push

# Push ke org repo — faiz
git push origin faiz

# Push explicit ke personal (kalo perlu)
git push personal faiz:main
```

## Remote Configuration

```
origin    → https://github.com/Arisan-Stellar/artel.git     (org — push faiz)
personal  → https://github.com/Faiz-abdurrachman/artel.git   (personal — push faiz→main)
```

**Mapping:** Lokal `faiz` → Remote `main` (personal). Jadi `git push` otomatis kirim `faiz` sebagai `main` di personal repo.

## PR Workflow

```bash
# PR dari faiz → main di org repo
# 1. Push faiz
git push origin faiz

# 2. Buka https://github.com/Arisan-Stellar/artel/pulls
# 3. Create PR: faiz → main
# 4. Jalanin CI (otomatis lewat GitHub Actions)
# 5. Merge setelah review
```

## CI/CD

File: `.github/workflows/ci.yml`

Trigger:
- Push ke `faiz`
- PR ke `main` atau `faiz`

Jobs:
```
Contracts (Rust):
  - cargo test (11/11 ✅)
  - stellar contract build (4/4 ✅)

Frontend (TypeScript):
  - npm ci
  - npx tsc --noEmit (0 errors ✅)
  - npx eslint . --quiet (0 errors ✅)
```

## Commit History (Local)

```bash
44d895d fix: yield page — fix pool card layout
883eb92 fix: tabs filter — active text white
7e3dd5d feat: redesign Launch App button
c13ac7a fix: Freighter connect remove isConnected()
5d934c1 fix: landing page CSS variables
b0141e1 fix: playwright config userDataDir
922542e ci: fix npm ci utf-8-validate
711625d test: fix mobile viewport edge cases
4fffb0c test: add Playwright E2E tests
a9bd9f3 fix: invisible text — CSS variables
cf12fab feat: i18n for all dApp pages (EN/ID)
1e1cef4 fix: mobile responsive
cfb98b1 feat: vault wire
```
