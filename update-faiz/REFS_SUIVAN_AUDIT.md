# 🔬 AUDIT: refs-suivan (Sui Move) — Referensi Konsep Asli

**Tanggal:** 06 Juli 2026
**Repo Source:** https://github.com/ARSUI-Team/testing-suivan.git
**Lokasi Clone:** `artel/refs-suivan/`

---

## 📋 Overview

Ini adalah **implementasi asli** dari konsep ROSCA protocol yang kemudian di-port ke Stellar Soroban. 
Ditulis dalam **Sui Move** untuk hackathon **Sui Overflow 2026**.

### Stats

| Metrik | Nilai |
|--------|-------|
| Move modules | 9 source + 7 seal-library |
| Move tests | **120 tests, ALL PASS** |
| Frontend routes | 11 pages |
| API endpoints | 9 endpoints |
| Contract lines | 1,863 (pool) + 329 (factory) + 246 (deepbook) + 212 (seal) + 139 (walrus) + 104 (faucet) |
| **Total** | **~3,014 lines Move** |
| **Total (Stellar)** | **~1,323 lines Rust** |

---

## 🏗️ Arsitektur Modules

```
suivan/
├── arisan_pool.move        🏦 1,863 lines — Full ROSCA lifecycle
├── arisan_factory.move      🏭 329 lines — Pool registry + templates
├── deepbook_yield.move      ⚡ 246 lines — Flash loan arbitrage via DeepBook V3
├── seal_randomness.move     🎲 212 lines — Threshold encryption RNG
├── walrus_store.move        💾 139 lines — Permanent blob storage
├── faucet.move              🚰 104 lines — On-chain faucet
├── test_usdc.move           🪙 64 lines — Mock USDC
└── test_sui.move            🪙 51 lines — Mock SUI

seal-local/                  🔐 7 modules — HMAC, KDF, polynomial, GF256
```

---

## ⚖️ Perbandingan: Suivan (Sui) vs ARTEL (Stellar)

### Yang SAMA (Konsep Dipertahankan)

| Konsep | Sui (Suivan) | Stellar (ARTEL) | Notes |
|--------|-------------|------------------|-------|
| Collateral 125% dari sisa komitmen | ✅ `deposit * (max_participants-1) * 125%` | ✅ Sama (line 73-76) | Keduanya pake formula ini |
| 5-balance segregation | ✅ collateral, pool_funds, winner_payout, yield, collateral_yield | ✅ Hanya 3: collateral, pool_funds, yield | Stellar belum punya `winner_payout_balance` dedicated |
| active_depositors_count | ✅ di-reset per cycle, dihitung dari `deposits_this_cycle` | ❌ **BUG #2** yang gue fix — dulunya double-count | Sekarang udah bener |
| Per-cycle deposit tracking | ✅ `deposits_this_cycle: bool` | ✅ `deposited_this_round: bool` | Sama |
| Slash collateral untuk nutup iuran | ✅ Jika cukup collateral → `pool_funds_balance += slash` | ✅ Sama (line 378) | Sama |
| Member inactive kalo collateral habis | ✅ `is_active = false` | ✅ Sama | Sama |
| Gacha di akhir pool | ✅ Weighted by leaderboard score | ✅ Weighted by tickets (compute_tickets) | Sama |
| Pause/unpause | ✅ | ✅ | Sama |

### Yang Stellar LEBIH BAIK

| Fitur | Stellar | Sui | Notes |
|-------|---------|-----|-------|
| **Code size** | 922 lines (arisan-contract) | 1,863 lines (arisan_pool) | Stellar lebih ringkas |
| **Constant definitions** | EARLY_WINDOW, MID_WINDOW (10/20 hari) | Hanya `cycle_duration_ms` | Stellar punya timeline detail |
| **Point system** | 3-tier: early(+3) / mid(+1) / late(-2) | Leaderboard score (cumulative) | Stellar lebih granular |
| **Streak bonus** | ✅ `compute_tickets()` — 1.0x-2.0x multiplier | ❌ Tidak ada streak bonus | Stellar lebih fair |

### Yang Sui LEBIH BAIK (Stellar Harus Tiru)

| Fitur | Sui (Suivan) | Stellar (ARTEL) | Kenapa Penting |
|-------|-------------|------------------|----------------|
| **Winner escrow (pull-based)** | ✅ Payout masuk `winner_payout_balance`, winner withdraw manual | ❌ Payout langsung dikirim via `select_winner()` | **Keamanan**: kalo `select_winner()` gagal di tengah, duit ilang. Escrow lebih aman |
| **unbiased_random_index** | ✅ Rejection sampling (eliminate modulo bias) | ❌ Pake `% total` biasa | **Keamanan**: modulo bias bisa dimanipulasi |
| **Hot potato receipts** | ✅ `YieldWithdrawalReceipt` — no abilities, must be consumed | ❌ Tidak ada pattern ini | **Atomicity**: tx aborts kalo receipt ga di-consume |
| **Capability-based auth** | ✅ `PoolAdminCap` per pool — object, bukan address check | ❌ `pool.admin.require_auth()` — address check | **Keamanan**: capability bisa di-transfer, address check fixed |
| **Seal threshold RNG** | ✅ Multi-party commit-reveal untuk fairness | ❌ Pake `ledger.sequence() + timestamp` | **Fairness**: RNG Stellar bisa dimanipulasi oleh validator |
| **Yield strategy integration** | ✅ DeepBook V3 flash loan arbitrage | ❌ Tidak ada yield integration beneran | **Revenue**: yield cuma dihitung, ga pernah di-deploy |
| **Sponsor tx (gas-free untuk user)** | ✅ Sponsored transactions via backend | ❌ User bayar gas sendiri | **UX**: user ga perlu XLM buat gas |
| **Generic CoinType** | ✅ Pool bisa USDC, SUI, token apapun | ❌ Fixed token per pool | **Fleksibilitas** |
| **Protocol fee** | ✅ 0.5% per deposit (PROTOCOL_FEE_BPS = 50) | ❌ Tidak ada | **Revenue** |
| **Admin delegation** | ✅ `PoolAdminCap` bisa di-transfer ke agent address | ❌ Admin address fixed | **Automation** |
| **120 tests** | ✅ Full coverage + edge cases | ❌ Hanya 5 test | **Reliability** |

### Yang Sama-SAMA Bermasalah

| Issue | Sui | Stellar | Keterangan |
|-------|-----|---------|------------|
| **Yield distribution tidak otomatis** | Butuh admin panggil `deposit_collateral_yield` | Butuh admin panggil `distribute_collateral_yield` | Yield dari DEX ga otomatis masuk ke contract |
| **Admin-dependent slash** | Admin harus panggil `slash_collateral` manual | Admin harus panggil `slash_collateral` manual | Belum ada keeper/agent auto-slash |
| **Gacha randomness dependen on-chain** | Pake Seal seed (kalo ada) atau tx digest fallback | Pake ledger.sequence() + timestamp | Semua on-chain RNG bisa dimanipulasi |
| **Time-based assert** | Pake `sui::clock::timestamp_ms` | Pake `env.ledger().timestamp()` | Relatif aman, tapi validator bisa pengaruhin |

---

## 🔍 Detail Kunci dari Sui yang Perlu Diadaptasi ke Stellar

### 1. Winner Escrow (Pull-Based Payout)

**Sui (baris 1046-1103):**
```move
// select_winner: simpan payout di escrow, jangan transfer langsung
balance::join(&mut pool.winner_payout_balance, payout_balance);
participant.pending_winner_payout = total_payout;
participant.winner_payout_claimed = false;

// claim_winner_payout: hanya winner bisa withdraw
let payout_coin = coin::take(&mut pool.winner_payout_balance, amount, ctx);
transfer::public_transfer(payout_coin, sender);  // ke sender = winner
```

**Stellar sekarang (baris 424-428):**
```rust
let payout = pool.pool_funds_balance;
pool.pool_funds_balance = 0;
let ct = contract_id(&env);
transfer_from(&env, &pool.config.token, &ct, &winner, payout);  // transfer LANGSUNG
```

**Rekomendasi:** Implementasi escrow pattern di Stellar — simpan payout ke `winner_payout_balance`, bkin fungsi `claim_winner_payout()`.

### 2. Unbiased Random Index (Rejection Sampling)

**Sui (seal_randomness.move):**
```move
fun unbiased_random_index(seed: u256, modulus: u64): u64 {
    let mask = (1u128 << (128 - (modulus as u128).leading_zeros())) - 1;
    loop {
        let sample = (seed.wrapping_mul(seed) ^ seed.wrapping_add(modulus as u256));
        let masked = (sample as u128) & mask;
        if (masked < (modulus as u128)) {
            return (masked as u64)
        };
    }
}
```

**Stellar sekarang (baris 82-101):**
```rust
fn weighted_random_index(env: &Env, weights: &Vec<u32>, salt: u64) -> u32 {
    let roll = seed % (total as u64);  // modulo bias!
    ...
}
```

**Rekomendasi:** Implementasi rejection sampling untuk menghilangkan modulo bias.

### 3. 5-Balance Segregation Lengkap

**Sui (ArisanPool struct):**
```move
collateral_balance: Balance<CoinType>,
pool_funds_balance: Balance<CoinType>,
winner_payout_balance: Balance<CoinType>,    // ✅ punya ini
yield_balance: Balance<CoinType>,
collateral_yield_balance: Balance<CoinType>,
```

**Stellar (Pool struct):**
```rust
collateral_balance: i128,
pool_funds_balance: i128,
yield_balance: i128,
collateral_yield_balance: i128,
col_yield_dist: i128,
// ❌ TIDAK ADA winner_payout_balance
```

**Rekomendasi:** Tambah `winner_payout_balance` di Stellar.

### 4. Capability-Based Auth

**Sui:**
```move
public struct PoolAdminCap has key, store { pool_id: ID, ... }
// Fungsi pake cap, bukan address check:
public fun select_winner(cap: &PoolAdminCap, pool: &mut ArisanPool, ...) {
    assert!(cap.pool_id == object::id(pool), E_WRONG_POOL_CAP);
```

**Stellar:**
```rust
pub fn select_winner(env: Env) -> Result<Address, soroban_sdk::Error> {
    pool.admin.require_auth();  // address check — fixed
```

**Rekomendasi:** Di Soroban, kita bisa pake `Address` sebagai capability. Tapi pattern Stellar sekarang lebih simpel. Fair enough untuk MVP.

### 5. Protocol Fee

**Sui:**
```move
const PROTOCOL_FEE_BPS: u64 = 50;  // 0.5%
// Fee dipotong dari deposit, masuk ke collateral_yield_balance
```

**Stellar:**
```rust
pub admin_fee_bps: u32,  // ada di config, tapi TIDAK PERNAH dipake!
```

**Rekomendasi:** Implementasi protocol fee di Stellar — potong 0.5% (atau sesuai config) dari setiap deposit.

---

## 🧪 Test Coverage Comparison

| Area | Sui (tests) | Stellar (tests) |
|------|:-----------:|:---------------:|
| Init | ✅ | ✅ 1 test |
| Join + Exit | ✅ | ✅ 1 test |
| Contribute | ✅ | ✅ 1 test (full lifecycle) |
| Slash | ✅ | ✅ 1 test |
| Select winner | ✅ | ✅ 1 test (full lifecycle) |
| End pool + gacha | ✅ | ❌ TIDAK ADA test |
| Claim final | ✅ | ❌ TIDAK ADA test |
| Collateral yield | ✅ | ❌ TIDAK ADA test |
| Edge: collateral exact | ✅ | ❌ TIDAK ADA test |
| Edge: insufficient funds | ✅ | ❌ TIDAK ADA test |
| Edge: double claim | ✅ | ❌ TIDAK ADA test |
| Edge: pause/unpause | ✅ | ❌ TIDAK ADA test |
| **TOTAL** | **120 TESTS** | **5 TESTS** |

---

### 6. Faucet Pattern — Per-Address Cooldown (Sui sudah bener ✅)

Perbandingan faucet stelah fix kita:

| Aspek | Suivan (Sui) | ARTEL Stellar (sebelum fix) | ARTEL Stellar (setelah fix) |
|-------|-------------|---------------------------|---------------------------|
| Auth | `ctx.sender()` — otomatis | `admin.require_auth()` ❌ | `to.require_auth()` ✅ |
| Cooldown key | `Table<address, u64>` ✅ | `symbol_short!("last")` global ❌ | `Address` sebagai key ✅ |
| Minting | TreasuryCap disimpan di Faucet object ✅ | `sac.mint()` via StellarAssetClient ✅ | Sama ✅ |
| Cooldown durasi | 24 jam (86,400,000 ms) | 1 jam (3600s) | Same ✅ |

Sui punya kelebihan: `cooldown_remaining()` view function jadi frontend bisa nampilin countdown.

---

## 🚀 Rekomendasi untuk Stellar ARTEL

Berdasarkan audit Suivan, ini recommended improvements buat Stellar version:

### Priority HIGH (Keamanan)
1. **Winner escrow** — jangan transfer payout langsung di `select_winner()`, simpan dulu di `winner_payout_balance`
2. **Rejection sampling** — ganti `% total` dengan unbiased random index
3. **Protocol fee** — implementasi `admin_fee_bps` yang udah ada di config tapi ga dipake

### Priority MEDIUM (Fungsionalitas)
4. **Winner payout balance** — tambah balance field dedicated
5. **Add more tests** — target minimal 20-30 tests, termasuk edge cases
6. **Gas sponsorship** — implementasi fee bump transactions biar user ga perlu XLM

### Priority LOW (Enhancement)
7. **Generic token support** — bikin pool bisa pake token berbeda
8. **Admin delegation** — biar admin bisa delegate ke agent/keeper
9. **Yield strategy hooks** — integrasi dengan Stellar DEX / Blend protocol

---

## 📂 File Referensi

```
refs-suivan/
├── contracts/sources/
│   ├── arisan_pool.move        ← Referensi utama (lifecycle, collateral, gacha)
│   ├── arisan_factory.move     ← Factory pattern (templates + registry)
│   ├── deepbook_yield.move     ← Yield strategy (flash loan arbitrage)
│   ├── seal_randomness.move    ← Verifiable randomness
│   └── faucet.move             ← Faucet pattern
├── YIELD_COLLATERAL_HANDOFF.md ← Dokumentasi perubahan yield logic
├── MASTER_PLAN.md              ← Master plan (final sprint tasks)
└── MENTOR_HANDOFF.md           ← Deployment + environment config
```
