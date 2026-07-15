# 🗺️ ARTEL — Roadmap & Known Issues

## ✅ Completed

| Feature | Status | Catatan |
|---------|--------|---------|
| Smart contracts (4) | ✅ | arisan, vault, factory, faucet |
| Blend Protocol | ✅ | Supply, withdraw, harvest, yield tracking |
| Vault Wire | ✅ | Auto-register ke gacha vault |
| i18n (EN/ID) | ✅ | All 11 dApp pages |
| Mobile responsive | ✅ | All pages |
| Playwright E2E | ✅ | 203 tests |
| CI/CD | ✅ | GitHub Actions |
| Landing page | ✅ | 7 sections storytelling |
| Launch App button | ✅ | Redesigned |
| CSS variables | ✅ | All defined |

## 🔜 Backlog

### Priority: Medium

| Item | Detail | Effort |
|------|--------|--------|
| **Mobile lebih thorough** | Yield page, pool detail masih ada yg bisa diperbaiki | ~2 jam |
| **Demo page** | Interactive UI demo buat presentasi | ~3 jam |
| **Stellar Mainnet** | Deploy ke mainnet (butuh XLM real) | ~1 jam |
| **Vault annual_gacha** | Trigger gacha setelah 1 tahun | ~2 jam |

### Priority: Low

| Item | Detail | Effort |
|------|--------|--------|
| **Playwright wallet tests** | Freighter full flow (butuh extension) | ~2 jam |
| **Error boundaries** | Better error handling for contract failures | ~1 jam |
| **Loading states** | Skeleton screens untuk pool data | ~1 jam |
| **Accessibility** | WCAG compliance audit | ~3 jam |

## 🐛 Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| Landing page overlay intercepts clicks | Low | Skip test on mobile viewport |
| `userDataDir` in playwright config | Fixed | Was causing tsc error in CI |
| Freighter popup timing | Low | Retry connect if fails |
| Contract addresses hardcoded in ENV | Low | Override via Vercel env vars |

## 🧪 Not Tested (Manual Only)

| Area | Reason |
|------|--------|
| Full pool lifecycle (3 rounds complete) | Takes too long (need fast rounds) |
| Annual gacha draw | Only works June-July |
| Albedo / xBull / Lobstr wallets | Only Freighter tested |
| Pool with 10+ members | Gas limit unknown |

## 📝 Notes for Next Dev/AI

1. **Testnet bisa down** — Stellar testnet kadang bermasalah. Cek dengan `stellar contract invoke ... get_state`
2. **Freighter extension** — Harus terinstall di browser. Popup handling perlu Playwright `context.waitForEvent('page')`
3. **Blend yield** — Butuh waktu buat accumulate yield. Harvest pas yield > 0 baru keliatan.
4. **Vault gacha** — Cuma bisa di-trigger pas June-July (annual window).
5. **Contract addresses** — Setup Vercel env vars BEFORE deploying to production.
6. **Dual remote** — `origin` punya dual push (org + personal). `git push` ke personal doang.
7. **Commit dulu** — Jangan push sebelum direview Faiz.
