# 🔧 ARTEL — Smart Contracts

## 1. arisan-contract (`contracts/arisan-contract/src/lib.rs`)

Kontrak utama — seluruh lifecycle ROSCA.

### Structs

```rust
ArisanConfig {
    name, contribution_amount, collateral_ratio_bps, token,
    max_members, round_duration, slash_grace_period,
    min_reputation, admin_fee_bps (HARUS 0),
    early_points, mid_points, late_penalty,
    blend_address (Address — untuk Blend integration, currently unused)
}

Pool {
    config, admin, yield_vault,
    state (Pending/Active/Completed),
    current_round, total_rounds,
    members: Map<Address, MemberInfo>,
    member_list: Vec<Address>,
    active_depositors_count,
    collateral_balance, pool_funds_balance, winner_payout_balance,
    yield_balance, collateral_yield_balance,
    blend_btoken_balance (untuk Blend tracking, currently unused)
    paused: bool
}

MemberInfo {
    address, collateral_amount, total_contributed,
    has_won, is_active, deposited_this_round,
    pending_winner_payout, winner_payout_claimed,
    gacha_claimed, yield_earned,
    early_payments, mid_payments, late_payments,
    total_points, current_streak
}
```

### Fungsi Publik

| Function | Who | State Req | Description |
|----------|-----|-----------|-------------|
| `create_pool(admin, vault, config)` | Admin | — | Buat pool + auto-join admin (all-in: collateral + cycle-1 iuran). Return pool_id |
| `join(pool_id, member)` | Member | Pending | Join pool, bayar collateral + iuran cycle-1 |
| `exit(pool_id, member)` | Member | Pending | Keluar sebelum pool start, refund collateral + deposit |
| `start_pool(pool_id)` | Admin | Pending+full | Mulai pool → Active, active_depositors_count set ke member_list.len() |
| `contribute(pool_id, member)` | Member | Active | Bayar iuran ronde ini. Points based on timing (early/mid/late) |
| `select_winner(pool_id)` | Admin | Active | Pilih pemenang weighted random. Payout ke escrow. Advance round. Completion check |
| `claim_winner_payout(pool_id, member)` | Winner | Any | Tarik escrow payout (pull-based) |
| `claim_final(pool_id, member)` | Member | Completed | Tarik collateral + yield_earned |
| `slash_collateral(pool_id, defaulter)` | Admin | Active | Sita collateral penunggak setelah grace period |
| `distribute_collateral_yield(pool_id)` | Admin | Any | Bagi hasil yield collateral (50% member / 40% vault / 10% ops) |
| `harvest_yield(pool_id, amount)` | Admin | Any | Admin deposit manual yield → 75% member / 25% gacha |
| `disburse_pool_yield_gacha(pool_id)` | Admin | Completed | Undi gacha jackpot (weighted ticket) |
| `deposit_yield(pool_id, from, amount)` | Admin | Any | Topup yield balance |
| `pause/unpause(pool_id)` | Admin | Any | Emergency pause |

### View Functions
`get_state`, `get_config`, `get_member_info`, `get_tickets`, `get_leaderboard`, `get_admin`, `get_round_winner`, `get_pool_count`

### Known Issues / Limitations

| # | Issue | Impact | Status |
|---|-------|--------|--------|
| 🔴 | **C2 (FIXED)**: `collateral_yield_balance` init 0 → kalau dipanggil `distribute_collateral_yield()` seluruh principal dianggep yield → insolvency | Fixed: seed `collateral_yield_balance = collateral_balance` di create_pool/join |
| 🔴 | **C1 (NEUTRALIZED)**: Secret key deployer lama bocor di git history | Account-merge → akun 404. Secret worthless. Scrub history deferred |
| 🟡 | **Randomness**: `derive_seed` pakai `ledger.sequence * timestamp` — admin bisa bias lewat timing | Acceptable for hackathon/testnet. Need VRF for mainnet |
| 🟡 | **Blend no-op**: `blend_supply`/`blend_withdraw` kosong (nggak manggil Blend). `blend_btoken_balance` tracking internal tidak akurat | Blend belum live. Frontend hide Blend stats |
| 🟡 | **blend_address default**: `CONTRACT_IDS.blend` = string kosong. Perlu address Blend Pool beneran waktu integrasi | — |

---

## 2. yield-vault (`contracts/yield-vault/src/lib.rs`)

Kontrak vault untuk yield 40% yang diundi via gacha tahunan.

### Fungsi
| Function | Description |
|----------|-------------|
| `init(admin)` | Inisialisasi vault (one-time) |
| `set_token(token_addr)` | Set token address (admin only) |
| `receive_yield(from, amount)` | Terima transfer yield dari arisan contract |
| `register_participant(arisan, participant, tickets)` | Daftarkan peserta gacha (admin-gated) |
| `annual_gacha()` | Undi gacha tahunan (admin only, June-July window) |
| `reset_for_new_year()` | Reset buat tahun baru (admin only) |
| `get_state()` | (total_vaulted, total_distributed, last_timestamp, locked) |

### Known Issues
- **Date check**: pakai kalkulasi day-of-year yang nggak akurat di tahun kabisat
- **Randomness**: sama lemah dengan arisan (admin timing)

---

## 3. artel-factory (DEPRECATED)

Tidak dipakai dalam arsitektur "1 contract → many pools". Tersimpan untuk referensi.

## 4. artel-faucet (Unused)

Aplikasi pakai friendbot (`/api/faucet` → `friendbot.stellar.org`). Kontrak ini tidak digunakan karena XLM native SAC tidak bisa di-mint oleh arbitrary account.
