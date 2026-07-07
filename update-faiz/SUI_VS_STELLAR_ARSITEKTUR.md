# ⚔️ Sui vs Stellar — Perbandingan Arsitektur + Opsi Implementasi

**Tanggal:** 06 Juli 2026
**Tujuan:** Dokumentasi buat tim — perbandingan teknis antara Suivan (Sui) dan ARTEL (Stellar), plus opsi arsitektur token/faucet.

---

> ## 📋 COPY BUAT WA
>
> ─────────────────────────────
> 🔥 SUI vs STELLAR - 3 OPSI FAUCET
> ─────────────────────────────
>
> OPSI 1 (Sekarang) ✅ BACKEND ONLY
> User klik → Backend kirim ARUSDC
> ✅ Gaperlu sign apapun
> ✅ Gaperlu XLM buat gas
> ✅ UX PALING ENAK
> ❌ Issuer key di backend
>
> OPSI 2 (Kaya Sui) ❌ CONTRACT AS ISSUER
> User klik → Sign di wallet → Dapet token
> ❌ WAJIB SIGN TRANSAKSI
> ❌ WAJIB PUNYA XLM
> ❌ Ribet buat user awam
>
> OPSI 3 (Hybrid) ❌ CONTRACT + FEE BUMP
> User klik → Sign di wallet → Dapet token
> ✅ Gas gratis
> ❌ TETAP WAJIB SIGN
> ❌ Paling ribet setup
>
> ─────────────────────────────
> 🏆 KESIMPULAN
> ─────────────────────────────
>
> PAKAI OPSI 1.
>
> Target kita: ibu-ibu arisan, UKM, pekerja migran.
> BUKAN crypto native kayak target Sui.
>
> Mereka ga ngerti signing wallet, gas, seed phrase.
> Mereka make GoPay/OVO: klik doang beres.
>
> Opsi 1 cocok buat mereka. Opsi 2/3 terlalu ribet.
> Jangan paksa ARTEL jadi Sui. Kita beda pasar.

---

## 📋 Ringkasan

| Aspek | Suivan (Sui) | ARTEL (Stellar) |
|-------|-------------|-----------------|
| **Chain** | Sui | Stellar |
| **Smart Contract Lang** | Move | Rust (Soroban SDK) |
| **Token Test** | `TEST_USDC` (custom) | `ARUSDC` (custom) |
| **Token Standard** | Sui `coin::mint()` + `TreasuryCap` | SEP-41 / Stellar Asset Contract (SAC) |
| **Faucet Flow** | Contract → mint → user wallet | Backend API → transfer → user wallet |
| **Gas** | Relayer / Sponsored Tx | Fee Bump (NATIVE protocol) |
| **Randomness** | Seal (threshold encryption) | On-chain entropy + rejection sampling |
| **Yield** | DeepBook V3 (smart contract DEX) | Stellar DEX (built-in protocol) |
| **Auth** | Capability object (`PoolAdminCap`) | Address-based (`require_auth()`) |
| **Tests** | 120 Move tests | 8 Rust tests |

---

## 🆚 Perbandingan Detail

### 1. Token & Faucet

| Aspek | Sui | Stellar |
|-------|-----|---------|
| **Cara deploy token** | Module `test_usdc.move` + `TreasuryCap` | `stellar contract asset deploy` atau `register_stellar_asset_contract_v2()` |
| **Siapa issuer?** | `TreasuryCap` disimpan di object (bisa contract atau account) | **Issuer keypair** — bisa account address atau contract address |
| **Mint dari contract?** | ✅ `coin::mint(&mut cap, amount, ctx)` langsung dari contract | ✅ Bisa kalo issuer address = contract address. Panggil `sac.mint()` |
| **Decimals** | 6 (standar Sui) | 7 (standar Stellar SAC) |
| **Faucet flow (Sui)** | User → contract call → `coin::mint()` → token masuk wallet | |
| **Faucet flow (Stellar)** | User → API → backend sign → Horizon payment → token masuk wallet | |

### 2. Randomness / RNG

| Aspek | Sui | Stellar |
|-------|-----|---------|
| **Primitive** | Seal (threshold encryption, commit-reveal) | On-chain entropy (`ledger.sequence() + timestamp`) |
| **Unbiased?** | ✅ `unbiased_random_index()` — rejection sampling | ✅ Sekarang pake `unbiased_mod()` — rejection sampling (sama) |
| **Fairness** | Tinggi — multi-party | Sedang — validator bisa pengaruhin timestamp |
| **Oracle alternative** | — | Band Protocol (Stellar oracle) |

### 3. Gas / Biaya Transaksi

| Aspek | Sui | Stellar |
|-------|-----|---------|
| **Gas per tx** | ~0.001 SUI | **~0.00001 XLM** (10× lebih murah) |
| **Sponsorship** | Relayer / sponsored tx (backend sign) | **Fee Bump** — built-in protocol level ✅ |
| **User perlu token gas?** | Bisa disponsorin | Bisa pake Fee Bump |
| **Kompleksitas** | Relayer butuh setup terpisah | Fee Bump tinggal pake SDK |

### 4. DEX / Yield

| Aspek | Sui | Stellar |
|-------|-----|---------|
| **DEX** | DeepBook V3 (smart contract) | **Stellar DEX** (built-in protocol) |
| **Tipe** | Orderbook (smart contract) | Orderbook (protokol level) ✅ |
| **Integrasi** | Butuh contract call ke DeepBook | Tinggal bikin liquidity pool — no smart contract needed |
| **Kematangan** | Masih baru | **Udah bertahun-tahun** beroperasi |

---

## 🎯 3 Opsi Arsitektur Faucet / Token

Ini yang perlu didiskusiin tim: **gimana cara user dapet token test?**

### Opsi 1: Backend-only (Saat Ini) — PALING UX-FRIENDLY ✅

```
┌──────────┐    POST /api/faucet    ┌──────────────────┐
│  User    │ ──────────────────────→ │  Backend (Next)  │
│  Wallet  │                        │  pegang issuer key│
│  G...    │ ←────────────────────── │                  │
└──────────┘    "1,000 ARUSDC!"     └────────┬─────────┘
                                              │
                                       Horizon Payment
                                       (sign + submit)
                                              │
                                        ┌─────▼──────┐
                                        │  User Wallet │
                                        │ +1,000 ARUSD│
                                        └────────────┘
```

**Flow:** User klik claim → Backend sign tx ARUSDC → Kirim ke user → Selesai

| Kelebihan | Kekurangan |
|-----------|------------|
| ✅ **User tinggal klik — ga perlu sign apa-apa** | ❌ Backend harus online terus |
| ✅ **Gas ditanggung backend (otomatis)** | ❌ Issuer key ada di backend |
| ✅ **Rate limiting gampang** | |
| ✅ **UX PALING BAGUS** — cocok buat user awam | |

**Target user:** Ibu-ibu arisan, non-crypto native, pengguna awam

---

### Opsi 2: Contract as Issuer — PALING "CRYPTO NATIVE"

```
┌──────────┐   Call faucet::claim()  ┌──────────────────────┐
│  User    │ ──────────────────────→ │  Faucet Contract     │
│  Wallet  │                        │  (issuer ARUSDC)     │
│          │ ←────────────────────── │  coin::mint()        │
└──────────┘    "1,000 ARUSDC!"     └──────────────────────┘
```

**Flow:** User sign tx → panggil faucet contract → contract mint ARUSDC → Kirim ke user

| Kelebihan | Kekurangan |
|-----------|------------|
| ✅ **Trustless** — ga perlu percaya backend | ❌ **User harus sign transaksi** (ada popup wallet) |
| ✅ **Sama persis kayak Suivan** | ❌ Perlu deploy ulang ARUSDC + faucet contract |
| ✅ Issuer key ga perlu di backend | ❌ User perlu punya XLM buat gas (kecuali Fee Bump) |

**Target user:** Crypto native, power user

---

### Opsi 3: Contract as Issuer + Fee Bump — TERBAIK (TAPI PALING RIBET)

```
┌──────────┐   Sign "claim" tx     ┌──────────────────────┐
│  User    │ ─────────────────────→ │  Faucet Contract     │
│  Wallet  │                       │  (issuer ARUSDC)     │
│          │ ←───────────────────── │  coin::mint()        │
└──────────┘    "1,000 ARUSDC!"    └──────────────────────┘
       ↑                                    │
       │ Backend wrap pake Fee Bump         │
       │ (gas gratis)                       │
       └────────────────────────────────────┘
```

**Flow:** User sign "claim" → Backend wrap pake Fee Bump → Submit → Token masuk

| Kelebihan | Kekurangan |
|-----------|------------|
| ✅ Trustless | ❌ **PALING RIBET SETUP** |
| ✅ Gas gratis buat user | ❌ Butuh deploy ulang token + contract |
| ✅ Sama kayak Sui + better | ❌ Butuh setup Fee Bump backend |
| | ❌ User tetap harus sign transaksi |

---

## 📊 Perbandingan UX untuk User Akhir

| Opsi | Klik Aja? | Sign Wallet? | Punya XLM? | Gas Gratis? | Mirip Sui? |
|:----:|:---------:|:------------:|:----------:|:-----------:|:----------:|
| **1** Backend-only | ✅ **Ya** | ❌ Ga perlu | ❌ Ga perlu | ✅ Iya | ❌ |
| **2** Contract | ❌ Ga cukup | ✅ **Wajib** | ✅ **Wajib** | ❌ Tidak | ✅ |
| **3** Contract + Fee Bump | ❌ Ga cukup | ✅ **Wajib** | ❌ Ga perlu | ✅ Iya | ✅ |

### 🏆 KESIMPULAN BUAT TIM

**Opsi 1 (Backend-only) adalah yang paling UX-friendly.**

Kenapa:
1. Target pasar ARTEL = **pengguna awam**, bukan crypto native
2. Ibu-ibu arisan ga ngerti wallet signing, gas, dll
3. "Klik → selesai" adalah standar UX yang mereka kenal (kayak GoPay, OVO, WhatsApp)
4. Opsi 2 dan 3 lebih "crypto native" tapi **lebih ribet buat user awam**

**Rekomendasi:**
- **Testing / Hackathon:** Pake Opsi 1 (udah jalan sekarang)
- **Mainnet:** Tetep pake Opsi 1 — upgrade ke Fee Bump kalo perlu
- **Jangan pake Opsi 2/3** kalo target user bukan crypto native

---

## 🆚 "Tapi Sui pake Opsi 2, kenapa?"

Sui **bisa** karena:
1. Ekosistem Sui = crypto native (target: developer, DeFi)
2. Semua user Sui punya wallet dan ngerti signing
3. Di Sui, mint token dari contract itu standard

**ARTEL beda:**
1. Target: Ibu-ibu PKK, karyawan, UMKM
2. Mereka ga punya wallet, ga ngerti signing
3. Mereka make GoPay/OVO/DANA setiap hari — "click and done"

**Sui ≠ ARTEL.** Dua produk berbeda buat pasar berbeda. Jangan paksa ARTEL jadi Sui.

---

## 📁 File Referensi

| File | Isi |
|------|-----|
| `contracts/artel-faucet/src/lib.rs` | Faucet contract (Opsi 2 — kalo dipake) |
| `frontend/app/api/faucet/route.ts` | Faucet API (Opsi 1 — yg skrg dipake) |
| `frontend/lib/artel-sdk.ts` | Config ARUSDC + issuer |
| `frontend/.env.local` | Issuer secret + faucet keypair |
| `contracts/yield-vault/src/lib.rs` | Annual gacha (pake ARUSDC) |
| `contracts/arisan-contract/src/lib.rs` | Core pool logic (pake ARUSDC) |
