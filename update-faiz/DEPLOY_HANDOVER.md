# 🚀 ARTEL — Handover untuk Tim `main` + Deploy Vercel

**Dari:** faiz (branch `faiz`) · **Untuk:** tim yang ngurus `main` + Vercel
**Tanggal:** 07 Juli 2026 · **Isi PR:** merge branding senior + full audit bugfix + redeploy contract

---

## 1. RINGKASAN PR (`faiz → main`)

PR ini berisi:
- ✅ Kerjaan branding senior (favicon 512x512, metadataBase) — sudah ke-merge di `faiz`
- ✅ 18 bug fix hasil audit (2 CRITICAL, 2 HIGH, 7 MEDIUM, 7 LOW)
- ✅ Redeploy contract arisan + vault (admin key baru)
- ✅ E2E lifecycle test lolos on-chain (Fair ROSCA net-zero terbukti)
- ✅ Verifikasi: cargo 12/12 · tsc 0 · eslint 0/0 · wasm build clean

Detail lengkap: `CHANGELOG.md` (Commit 9) & `HANDOVER.md` (PASS TERBARU).

---

## 2. ⚙️ ENV VARS VERCEL (WAJIB DI-SET / UPDATE)

Buka **Vercel → Project Settings → Environment Variables**. Set semua ini (Production + Preview):

```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# ⬇️ CONTRACT BARU — WAJIB UPDATE (beda dari deploy lama)
NEXT_PUBLIC_CONTRACT_POOL=CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT
NEXT_PUBLIC_CONTRACT_VAULT=CCBQFVC34ZAXC3DTCTKCSIAEWQ4QS67LQQ7F2RL5DSGXJWV2XXY4YAEH

NEXT_PUBLIC_XLM_CONTRACT=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

> ⚠️ **KRITIS:** kalau env vars di Vercel masih nunjuk contract LAMA (`CBHNJGTY…` / `CDSHKMKF…`),
> frontend bakal baca pool dari contract lama. **Update ke address baru di atas.**
> Kalau env vars DIKOSONGIN, fallback di `lib/artel-sdk.ts` udah otomatis ke address baru (aman).

**TIDAK ADA secret yang perlu di-set di Vercel.** Semua `NEXT_PUBLIC_*` (client-safe).
Deployer secret CUMA dipakai lokal buat deploy contract, ada di `.env.local` (gitignored) — jangan pernah taruh di Vercel.

---

## 3. 🔒 SATU HAL YANG BELUM SELESAI (butuh keputusan tim)

**Secret deployer LAMA masih ada di git history** (commit `2087e38`, file `HANDOVER.md` versi lama).
- Working tree & docs sekarang **udah bersih** (secret dihapus).
- Key lama udah **di-abandon** — contract baru pakai admin key baru, jadi walau bocor, key lama gak ngontrol apa-apa lagi.
- **TAPI** history publik masih nyimpen secret string-nya.

**Aksi yang disarankan (butuh koordinasi 1 tim karena rewrite history):**
1. Semua orang commit/push dulu, terus berhenti kerja sebentar.
2. Jalankan script scrub: `.omo/plans/phase-f-secret-scrub.md` (`git filter-repo` + force-push).
3. Semua re-clone / `git reset --hard origin/<branch>`.

Kalau tim mau, ini bisa dilakuin setelah PR merge. Kalau nggak, minimal key lama udah aman (abandoned).

---

## 4. ✅ CHECKLIST BUAT TIM MAIN (urut)

- [ ] Review + merge PR `faiz → main`
- [ ] Set/update env vars Vercel (bagian #2) — **paling penting**
- [ ] Trigger redeploy Vercel (auto kalau merge ke main, atau manual)
- [ ] Buka production URL → `/dapp/pools` → pastikan pool ke-load dari contract baru
- [ ] Smoke test: connect Freighter (testnet) → create pool → join → berfungsi
- [ ] (Opsional) Koordinasi tim buat git history scrub (bagian #3)

---

## 5. 📇 REFERENSI CEPAT

| Item | Value |
|------|-------|
| Arisan contract (baru) | `CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT` |
| Vault contract (baru) | `CCBQFVC34ZAXC3DTCTKCSIAEWQ4QS67LQQ7F2RL5DSGXJWV2XXY4YAEH` |
| XLM token (SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |
| Admin pubkey | `GAAA6ZHLYVEK57LIWBOPODU3VPGZXKO6GMQMR2JPEPDHX4R374NN2MTJ` |
| Admin secret | HANYA di `frontend/.env.local` (gitignored) — minta ke faiz |
| Network | Stellar **Testnet** |
| Repo | https://github.com/Arisan-Stellar/artel |
| Branch kerja | `faiz` → PR ke `main` |

> **Model arsitektur:** 1 contract → banyak pool. `pool_id` = angka urut (0,1,2…), BUKAN address.
> URL `/dapp/pools/1` = pool ke-2. Semua pool hidup di dalam 1 contract arisan.
