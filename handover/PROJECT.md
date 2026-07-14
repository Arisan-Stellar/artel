# 🎯 ARTEL — Project Overview

## What is ARTEL?

**ARTEL = ROSCA Protocol on Stellar.** Sebuah protokol **tabungan bergilir (ROSCA/arisan)** yang berjalan
sepenuhnya di atas blockchain Stellar dengan smart contract Soroban.

ROSCA (Rotating Savings and Credit Association) adalah mekanisme keuangan informal yang dipakai
oleh **100+ juta orang di Asia Pasifik** — dikenal sebagai *Arisan* (Indonesia), *Chit Fund* (India),
*Tanda* (Mexico), *Kye* (Korea), dan puluhan nama lainnya.

## The Problem (Masalah ROSCA Tradisional)

| # | Masalah | Dampak |
|---|---------|--------|
| 🏃 | **Pelarian bendahara** | Pemegang kas kabur bawa uang — tidak ada recourse |
| 💤 | **Uang menganggur** | Dana terkumpul diam saja di antara ronde pembayaran |
| 📋 | **Catatan manual** | Buku tulis, spreadsheet WhatsApp, rawan error |
| 🔒 | **Terbatas geografis** | Cuma bisa dalam satu RT/kantor/komunitas kecil |

## The Solution (Solusi ARTEL)

### 1. Smart Contract sebagai Bendahara
- Kontrak Soroban menggantikan bendahara manusia
- Semua aturan di-enforce oleh kode — tidak bisa dicurangi
- Transparan & verifiable on-chain

### 2. ≥125% Collateral (Jaminan)
Setiap anggota **wajib deposit collateral ≥125%** dari total iuran sebelum join.
Kalau ada yang kabur/nunggak → collateral disita otomatis.
**Matematikanya:** rugi kalau kabur > untung kalau tetap ikut.

### 3. Triple Yield (Pendapatan Pasif)
Dana collateral yang menganggur diinvestasikan untuk menghasilkan yield:
- **50% → dibagi merata ke anggota aktif**
- **40% → masuk vault untuk undian gacha tahunan**
- **10% → operasional protokol**

### 4. Gacha Jackpot Tahunan (30 Juni)
Akumulasi yield 40% dari semua pool diundi setahun sekali via sistem tiket.
Tiket didapat dari pembayaran tepat waktu — semakin rajin, semakin besar peluang.

---

## 💰 Economic Model (Model Ekonomi)

### FAIR ROSCA (Final — redesain oleh Sisyphus)

Berbeda dengan ROSCA tradisional, ARTEL menggunakan model **FAIR ROSCA**:
- **Semua member bayar SETIAP ronde** — termasuk pemenang sebelumnya
- Setiap member **menang 1 pot penuh** di 1 ronde unik
- Hasil akhir: **semua member net ~0** (impas, cuma kena fee transaksi)

**Contoh (3 member, iuran 10 XLM):**
```
Ronde 1: A, B, C bayar 10 → pot 30 → winner A
Ronde 2: A, B, C bayar 10 → pot 30 → winner B  (A tetap bayar meski sudah menang!)
Ronde 3: A, B, C bayar 10 → pot 30 → winner C
Hasil: setiap orang bayar 30, menang 30 → net 0
```

### ALL-IN JOIN
Saat JOIN, anggota **langsung bayar collateral + iuran ronde pertama** sekaligus.
- Jadi pas pool START, semua sudah bayar ronde 1 → langsung bisa select winner
- Untuk ronde 2+, pakai tombol Deposit biasa

### FEE 0%
`admin_fee_bps = 0`. Tidak ada potongan fee. Semua deposit masuk penuh ke pot.

---

## 🏗️ Key Architecture Decisions

| Keputusan | Detail |
|-----------|--------|
| **1 Contract → Many Pools** | Model ala Sui — semua pool hidup di dalam 1 kontrak arisan, dibedakan pakai `pool_id` (angka urut) |
| **Branch `faiz`** | Semua development di branch `faiz`, PR ke `main`. Jangan kerja langsung di `main` |
| **Config via `NEXT_PUBLIC_*`** | Semua config pakai env vars dengan fallback di `artel-sdk.ts` |
| **Wallet signing** | User tanda tangan sendiri via Freighter/Albedo/xBull/Lobstr — aplikasi TIDAK pegang secret key user |
| **Blend Protocol** | Integrasi Blend (lending protocol) DIRENCANAKAN tapi BELUM LIVE — kode kerangka ada, fungsi no-op |
