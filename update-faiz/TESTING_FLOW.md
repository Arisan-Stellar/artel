# 🧪 ARTEL — Testing Flow Lengkap

**Update terakhir:** Fase 7 (post critical re-audit)
**Buat:** Faiz — panduan manual testing end-to-end lewat frontend.

---

## 📍 STATE SAAT INI (siap ditest)

```
Contract arisan : CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT
Contract vault  : CCBQFVC34ZAXC3DTCTKCSIAEWQ4QS67LQQ7F2RL5DSGXJWV2XXY4YAEH
Token           : XLM native (CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC)
Dev server      : http://localhost:3000
Wallet lo        : GCY2ZNSQAFWDCPVUBCVYWPF2XR2AAWJGBEZYEU3GWNHSRTNASS7XMZKF (Freighter)

Pool yang udah ada (fresh, siap join):
  Pool 0 → "Community Arisan"    | 10 XLM/cycle | max 3 members | OPEN (1/3)
  Pool 1 → "Neighborhood Circle" |  5 XLM/cycle | max 4 members | OPEN (1/4)
```

---

## ⚙️ PRASYARAT

1. **Dev server nyala:**
   ```bash
   cd /home/faiz/hackaton/stellar/artel/frontend && npm run dev
   ```
2. **Freighter extension** terinstall di Chromium, network di-set **Testnet**.
3. **Saldo XLM cukup** di wallet (collateral butuh 12.5–25 XLM). Kalau kurang → Faucet (Test A).
4. **Buat test full-lifecycle:** siapin **2 akun Freighter** (Freighter support multi-account: klik avatar → "Add account"). Sebut aja Wallet A (admin) & Wallet B (member).

---

## 🅰️ TEST A — Connect Wallet + Faucet

**Langkah:**
1. Buka `http://localhost:3000/dapp/pools`
2. Klik **CONNECT** (pojok kanan atas) → pilih/approve Freighter → unlock.
3. Header berubah jadi `FREIGHTER · DISCONNECT` + alamat wallet muncul.
4. Klik **Claim 10,000 XLM** (atau ke `/dapp/faucet`) → tunggu konfirmasi.

**Expected:**
- ✅ Wallet connected, alamat tampil di WalletCard.
- ✅ Saldo XLM nambah 10,000 (kalau akun baru) / "Already funded" (kalau udah ada).

**Verify on-chain:**
```bash
curl -s "https://horizon-testnet.stellar.org/accounts/<ALAMAT>" | grep -o '"balance":"[0-9.]*"' | head -1
```

---

## 🅱️ TEST B — Browse Pools

**Langkah:**
1. Di `/dapp/pools`, lihat daftar pool.
2. Cek stat atas: TOTAL POOLS / OPEN / RUNNING / COMPLETED.
3. Klik filter **OPEN / ACTIVE / COMPLETED**.
4. Klik **View Details →** salah satu pool.

**Expected:**
- ✅ Muncul 2 pool: "Community Arisan" & "Neighborhood Circle" (data dari chain, bukan mock).
- ✅ Tiap card nampilin deposit, collateral (angka akurat, mis. 25 XLM utk pool 0), members ratio (1/3).
- ✅ Filter berfungsi.
- ✅ Klik detail → halaman pool detail kebuka.

---

## 🅲 TEST C — Create Pool

**Langkah:**
1. Dari `/dapp/pools`, klik **+ Create Pool** (harus connected).
2. Isi form:
   - Name: `Test Arisan Gue`
   - Contribution: `10` XLM
   - Max members: `2` (biar gampang di-full-in buat test lifecycle)
3. Klik **Create Pool** → Freighter popup → **Confirm**.
4. Tunggu "Pool created! ✅" + pool ID muncul.

**Expected:**
- ✅ Freighter popup muncul (sekali).
- ✅ Sukses → dapet pool ID baru (mis. 2).
- ✅ Lo otomatis jadi **member #1** (auto-join), collateral kepotong dari wallet.
- ✅ Buka `/dapp/pools` → pool baru muncul dengan status OPEN (1/2).

**Verify on-chain:**
```bash
stellar contract invoke --id CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT \
  --source-account <SECRET> --network testnet -- get_state --pool_id 2
# member_count: 1, state: Pending, is_full: false
```

---

## 🅳 TEST D — Join Pool (⭐ core flow)

**Skenario:** Wallet B join pool yang dibuat Wallet A (atau join pool 0/1 yang udah ada).

**Langkah:**
1. Switch ke **Wallet B** di Freighter (avatar → pilih akun lain). Pastikan Wallet B punya XLM (Faucet dulu).
2. Reconnect di app (DISCONNECT → CONNECT → pilih Wallet B).
3. Buka pool yang OPEN (mis. `/dapp/pools/0` Community Arisan).
4. Klik **Join · 25 XLM** → Freighter popup → **Confirm**.
5. Tunggu banner ✅ txhash.

**Expected:**
- ✅ Tombol berubah "..." pas loading, lalu banner ✅ sukses.
- ✅ **Auto-refresh**: "Participants" naik (1→2), members ratio update (mis. 2/3) **tanpa reload manual**.
- ✅ Tombol **Join hilang** (karena lo udah jadi member).
- ✅ "Your Status" jadi **Active Participant**.
- ✅ Saldo Wallet B turun sebesar collateral (25 XLM utk pool 0).

**Verify on-chain:**
```bash
stellar contract invoke --id CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT \
  --source-account <SECRET> --network testnet -- get_state --pool_id 0
# member_count naik, collateral_balance naik
```

---

## 🅴 TEST E — Full Lifecycle (Start → Contribute → Select → Claim)

> **Butuh pool yang FULL.** Cara termudah: buat pool `max_members=2` (Test C pakai Wallet A), lalu Wallet B join (Test D) → pool jadi 2/2 full.

### E1 — Start Pool (admin only)
1. Login sebagai **Wallet A** (admin/creator).
2. Buka pool detail pool tsb. Status harus **READY** (full + pending).
3. Klik **Start Pool** → Freighter → Confirm.

**Expected:** ✅ Status berubah jadi **ACTIVE**, cycle 1/2. (Tombol Start cuma muncul buat admin saat READY.)

### E2 — Contribute (tiap member bayar iuran)
1. Sebagai **Wallet A**, klik **Deposit 10 XLM** → Confirm.
2. Switch ke **Wallet B**, reconnect, klik **Deposit 10 XLM** → Confirm.

**Expected:**
- ✅ Tiap deposit sukses, "Your Status → Paid: YES".
- ✅ Pool funds naik penuh (fee 0% — semua kontribusi masuk pot).
- ✅ Setelah bayar, tombol Deposit hilang buat wallet itu.

### E3 — Select Winner (admin only)
1. Sebagai **Wallet A** (admin), pastikan **semua member udah deposit**.
2. Klik **Select Winner** → Confirm.

**Expected:**
- ✅ Winner terpilih (weighted random). Cycle maju (1→2).
- ✅ Pool funds → 0 (masuk escrow winner).
- ✅ Kalau ini ronde terakhir (cycle >= total) → status **COMPLETED**.
- ⚠️ **PENTING (hasil re-audit):** kalau pool > 2 ronde, ulangi E2–E3 utk ronde 2. **Winner ronde 1 nggak ikut bayar lagi**, dan pool **tetap bisa lanjut** (bug deadlock udah di-fix di Fase 7).

### E4 — Claim Winner Payout (pull-based)
> Belum ada tombol khusus di FE (roadmap). Verify via CLI kalau mau:
```bash
stellar contract invoke --id CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT \
  --source-account <WINNER_SECRET> --network testnet -- claim_winner_payout --pool_id <ID> --member <WINNER_ADDR>
```
**Expected:** ✅ Dana escrow ketransfer ke winner, saldo winner naik.

---

## 🅵 TEST F — Dashboard / Leaderboard / Profile

**Langkah:**
1. `/dapp/dashboard` — lihat "My Pools" + stat (active pools, total points, tickets).
2. `/dapp/leaderboard` — lihat ranking (address real, points, tickets, tier).
3. `/dapp/profile` — lihat stats agregat (pools, rounds won, total saved, yield), reputation, badges, activity.

**Expected:**
- ✅ Dashboard nampilin cuma pool yang lo ikut (real, bukan "Arisan RT 05" mock).
- ✅ Leaderboard nampilin address peserta beneran (mis. `GCY2…MZKF`), bukan `G...ABC`.
- ✅ Profile nampilin data on-chain lo (points/streak/collateral) — kalau belum ikut pool, tampil 0/kosong.

---

## 🔍 CLI CHEATSHEET (verifikasi cepat)

```bash
C=CAHJPUKIDNVHJ2UQBMM65357I67LJXDQZKCC4DXAK6W4KQBXD2SQIQBT
S=<SECRET_KEY_LO>

# Jumlah pool
stellar contract invoke --id $C --source-account $S --network testnet -- get_pool_count

# State pool
stellar contract invoke --id $C --source-account $S --network testnet -- get_state --pool_id 0

# Config pool
stellar contract invoke --id $C --source-account $S --network testnet -- get_config --pool_id 0

# Admin pool
stellar contract invoke --id $C --source-account $S --network testnet -- get_admin --pool_id 0

# Data member
stellar contract invoke --id $C --source-account $S --network testnet -- get_member_info --pool_id 0 --member <ADDR>

# Leaderboard (address, tickets)
stellar contract invoke --id $C --source-account $S --network testnet -- get_leaderboard --pool_id 0

# Pemenang ronde
stellar contract invoke --id $C --source-account $S --network testnet -- get_round_winner --pool_id 0 --round 1
```

---

## ✅ CHECKLIST HASIL (centang pas test)

| # | Test | Status |
|---|------|:------:|
| A | Connect + Faucet | ☐ |
| B | Browse pools (data real) | ☐ |
| C | Create pool + auto-join | ☐ |
| D | Join pool + auto-refresh | ☐ |
| E1 | Start pool (admin, READY) | ☐ |
| E2 | Contribute (fee 0% — full masuk pot) | ☐ |
| E3 | Select winner (weighted) | ☐ |
| E3b | Ronde 2 jalan (no deadlock) | ☐ |
| E4 | Claim payout (CLI) | ☐ |
| F | Dashboard/Leaderboard/Profile real | ☐ |

---

## 🛠️ TROUBLESHOOTING

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Freighter popup ga muncul | Wallet locked / network salah | Unlock Freighter, set network **Testnet** |
| `❌ txTooLate` | Clock skew / lambat sign | Udah di-fix (setTimeout 300). Kalau muncul, cek jam sistem |
| `❌ ... user rejected` | Popup ke-cancel | Klik **Confirm** di Freighter, jangan cancel |
| Join gagal "already a member" | Wallet udah member pool itu | Pakai wallet lain / pool lain |
| Join gagal "pool is full" | Slot penuh | Pool udah full, join yang OPEN |
| Start Pool nggak muncul | Bukan admin / pool belum full | Login wallet admin + pastikan pool READY (full) |
| Deposit nggak muncul | Bukan member / udah bayar / pool belum active | Cek status pool & membership |
| Saldo kurang | Collateral > saldo | Faucet dulu (Test A) |
| Participants nggak update | Belum auto-refresh | Tunggu ~5 detik / reload |

---

## 🎯 REKOMENDASI URUTAN DEMO (paling mulus)

```
1. Connect + Faucet (Wallet A)
2. Create pool "Demo" (max 2, 10 XLM)   → auto-join, OPEN 1/2
3. Switch Wallet B + Faucet + Join       → FULL 2/2, READY
4. Wallet A: Start Pool                   → ACTIVE
5. Wallet A: Deposit, Wallet B: Deposit   → semua paid
6. Wallet A: Select Winner                → winner + COMPLETED
7. Cek Dashboard/Leaderboard/Profile      → data real
```

Durasi ± 8–10 menit. Setiap aksi = 1 Freighter Confirm.
